// src/components/auth/AuthContext.tsx
"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, isAdmin: false });

export function AuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AuthState;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
