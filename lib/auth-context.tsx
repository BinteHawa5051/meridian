"use client";

import * as React from "react";
import type { SessionUser } from "@/lib/auth";

interface AuthContextValue {
  user:    SessionUser | null;
  loading: boolean;
  logout:  () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null, loading: true,
  logout: async () => {}, refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) { const d = await res.json(); setUser(d.user); }
      else setUser(null);
    } catch { setUser(null); }
    finally { setLoading(false); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }

  React.useEffect(() => { refresh(); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return React.useContext(AuthContext); }
