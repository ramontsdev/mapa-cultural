"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchMe, signIn, signUp } from "@/lib/api/auth";
import type { AppUser } from "@/lib/api/types";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  subscribeAuthChange,
} from "@/lib/api/http";
import { queryKeys } from "@/hooks/api/query-keys";

type SignInArgs = { email: string; password: string };
type SignUpArgs = {
  name: string;
  email: string;
  document: string;
  password: string;
  passwordConfirmation: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AppUser | null;
  /** Backwards compat helper used by legacy screens. Prefer `signIn`. */
  login: () => void;
  logout: () => void;
  signIn: (payload: SignInArgs) => Promise<AppUser>;
  signUp: (payload: SignUpArgs) => Promise<AppUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setToken(getStoredToken());
    setHydrated(true);
    const unsubscribe = subscribeAuthChange(() => {
      setToken(getStoredToken());
    });
    return unsubscribe;
  }, []);

  const meQuery = useQuery<AppUser>({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    enabled: Boolean(token),
    retry: false,
  });

  const login = useCallback(() => {
    // Intentional no-op kept for backwards compatibility with screens that
    // still call `login()` after a local form submission.
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    queryClient.removeQueries({ queryKey: queryKeys.me });
  }, [queryClient]);

  const doSignIn = useCallback(
    async (payload: SignInArgs) => {
      const { accessToken } = await signIn(payload);
      setStoredToken(accessToken);
      setToken(accessToken);
      const me = await queryClient.fetchQuery<AppUser>({
        queryKey: queryKeys.me,
        queryFn: fetchMe,
      });
      return me;
    },
    [queryClient],
  );

  const doSignUp = useCallback(
    async (payload: SignUpArgs) => signUp(payload),
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      isLoading: !hydrated || (Boolean(token) && meQuery.isPending),
      user: meQuery.data ?? null,
      login,
      logout,
      signIn: doSignIn,
      signUp: doSignUp,
    }),
    [token, hydrated, meQuery.isPending, meQuery.data, login, logout, doSignIn, doSignUp],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
