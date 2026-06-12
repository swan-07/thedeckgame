import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { api } from "./api";
import { supabase } from "./supabase";
import type { UserMe } from "./types";

interface AuthState {
  session: Session | null;
  user: UserMe | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser(current: Session | null) {
    if (!current) {
      setUser(null);
      return;
    }
    try {
      setUser(await api<UserMe>("/me"));
    } catch {
      setUser(null);
    }
  }

  async function refreshUser() {
    const {
      data: { session: s },
    } = await supabase.auth.getSession();
    await loadUser(s);
  }

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadUser(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!active) return;
      setSession(s);
      await loadUser(s);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
