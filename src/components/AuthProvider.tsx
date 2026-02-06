"use client";

import React, { createContext, useContext, useState } from "react";

export type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

export type CurrentUser = {
  id: string;
  email: string;
  role: Role;
  companyName: string | null;
  country: string | null;
  address: string | null;
};

type AuthState = {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<boolean>; 
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.user) {
        setUser(null);
        return false;
      }

      setUser(data.user as CurrentUser);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
