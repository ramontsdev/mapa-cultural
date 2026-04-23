"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "mapa-cultural-auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      setIsAuthenticated(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const login = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore quota / private mode */
    }
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
