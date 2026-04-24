const TOKEN_STORAGE_KEY = "mapa-cultural-token";

type AuthListener = () => void;

const authListeners = new Set<AuthListener>();

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    /* ignore quota / private mode */
  }
  authListeners.forEach((listener) => listener());
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  authListeners.forEach((listener) => listener());
}

export function subscribeAuthChange(listener: AuthListener) {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

export type ApiErrorShape = {
  error?: string;
  message?: string;
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorShape | null;

  constructor(status: number, body: ApiErrorShape | null, fallback: string) {
    const resolvedMessage =
      body?.error || body?.message || fallback || "Erro inesperado";
    super(resolvedMessage);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  fieldErrors(): Record<string, string> {
    const fieldErrors = this.body?.details?.fieldErrors ?? {};
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(fieldErrors)) {
      if (!value || value.length === 0) continue;
      const first = value[0];
      if (typeof first === "string") result[key] = first;
    }
    return result;
  }
}

function getBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4500/api";
  return raw.replace(/\/+$/, "");
}

export type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
};

function buildQueryString(
  query: ApiFetchOptions["query"],
): string {
  if (!query) return "";
  const entries = Object.entries(query).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  if (entries.length === 0) return "";
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    params.append(key, String(value));
  }
  return `?${params.toString()}`;
}

function isOnAuthPage(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return (
    path === "/cadastro" ||
    path.startsWith("/cadastro/") ||
    path.startsWith("/login")
  );
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers = {}, query, auth = true, ...rest } = options;

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}${buildQueryString(query)}`;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const tokenAtRequest = auth ? getStoredToken() : null;
  if (tokenAtRequest) {
    finalHeaders.Authorization = `Bearer ${tokenAtRequest}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    // Only force a redirect to the sign-in page when the user had an active
    // session that got invalidated (expired / revoked token). If the request
    // reached a 401 because it was fired without any token (e.g. a hook on a
    // public page that forgot an `enabled` guard), we just propagate the error
    // so the page itself can keep rendering its public content.
    if (response.status === 401 && auth && tokenAtRequest) {
      clearStoredToken();
      if (typeof window !== "undefined" && !isOnAuthPage()) {
        window.location.href = "/cadastro";
      }
    }

    throw new ApiError(
      response.status,
      payload as ApiErrorShape | null,
      response.statusText,
    );
  }

  return (payload ?? (undefined as unknown)) as T;
}
