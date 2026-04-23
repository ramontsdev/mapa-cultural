export const MEUS_LOCAL_USER_ID = "local-user";

export function generateMeuRecursoId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function readJsonList<T>(storageKey: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as T[];
  } catch {
    return [];
  }
}

export function writeJsonList<T>(storageKey: string, records: T[], eventName: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
    window.dispatchEvent(new Event(eventName));
  } catch {
    /* ignore */
  }
}

export function subscribeKey(storageKey: string, eventName: string, cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKey || e.key === null) cb();
  };
  const onLocal = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener(eventName, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(eventName, onLocal);
  };
}
