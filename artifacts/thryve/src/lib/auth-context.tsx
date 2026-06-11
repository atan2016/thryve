import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Role } from "./types";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
} | null;

type AuthContextType = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  signOut: () => {}
});

const AUTH_STORAGE_KEY = "thryve:auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser>(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  });

  const setUser = (u: AuthUser) => {
    setUserState(u);
    if (u) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const signOut = () => setUser(null);

  useEffect(() => {
    // keep storage in sync with state
  }, [user]);

  return <AuthContext.Provider value={{ user, setUser, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
