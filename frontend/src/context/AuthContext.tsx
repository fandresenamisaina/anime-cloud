import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/client";

interface AuthContextType {
  token: string | null;
  userId: number | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeUserId(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [userId, setUserId] = useState<number | null>(decodeUserId(token));

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    setUserId(decodeUserId(newToken));
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const loginWithToken = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
