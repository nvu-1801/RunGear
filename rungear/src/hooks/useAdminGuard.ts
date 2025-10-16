// src/hooks/useAdminGuard.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
type AdminAuthError = { code: string; message?: string } | null;
type Options = {
  supabaseClient?: unknown;
  redirectTo?: string;
  next?: string;
  onFail?: (error: AdminAuthError) => void;
};
type UserInfo = { id: string; email?: string | null } | null;
type UseAdminGuardResult = {
  ready: boolean;
  error: AdminAuthError;
  user: UserInfo;
};

export function useAdminGuard({
  supabaseClient,
  redirectTo = "/auth/sign-in",
  next,
  onFail,
}: Options = {}): UseAdminGuardResult {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<AdminAuthError>(null);
  const [user, setUser] = useState<UserInfo>(null);

  const calledRef = useRef(false); // prevent repeated runs
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;

  useEffect(() => {
    if (calledRef.current) {
      return;
    }
    calledRef.current = true;

    let mounted = true;
    const finish = (err: AdminAuthError = null) => {
      if (!mounted) return;
      setError(err);
      setReady(true);
    };

    (async () => {
      try {
        const sb = (supabaseClient as any) ?? supabaseBrowser();

        if (!sb) {
          const noClientErr = {
            code: "no_client",
            message: "Missing supabase client",
          } as AdminAuthError;
          onFailRef.current?.(noClientErr);
          finish(noClientErr);
          if (!onFailRef.current && typeof window !== "undefined") {
            const targetNext =
              next ?? window.location.pathname + window.location.search;
            window.location.replace(
              `${redirectTo}?next=${encodeURIComponent(targetNext)}`
            );
          }
          return;
        }

        const userRes = await sb.auth
          .getUser()
          .catch((e: unknown) => ({ error: e }));
        const sessionRes = await sb.auth
          .getSession()
          .catch((e: unknown) => ({ error: e }));

        const u =
          (userRes?.data as any)?.user ??
          (sessionRes?.data as any)?.session?.user ??
          null;
        if (!u) {
          const unauth = { code: "unauthenticated" } as AdminAuthError;
          onFailRef.current?.(unauth);
          finish(unauth);
          if (!onFailRef.current && typeof window !== "undefined") {
            const targetNext =
              next ?? window.location.pathname + window.location.search;
            window.location.replace(
              `${redirectTo}?next=${encodeURIComponent(targetNext)}`
            );
          }
          return;
        }

        if (!mounted) return;
        setUser({ id: u.id, email: u.email ?? null });

        // profile check (tolerant)
        let isAdmin = false;
        try {
          const profRes = await sb
            .from("profiles")
            .select("role")
            .eq("id", u.id)
            .maybeSingle();
          let prof: any = profRes?.data ?? null;
          if (Array.isArray(prof)) prof = prof[0] ?? null;
          if (prof && typeof prof.role === "string") {
            isAdmin = prof.role.trim().toLowerCase() === "admin";
          }
        } catch (e) {
          // ignore profile check error
        }

        if (!isAdmin) {
          const forb = { code: "forbidden" } as AdminAuthError;
          onFailRef.current?.(forb);
          finish(forb);
          if (!onFailRef.current && typeof window !== "undefined") {
            const targetNext =
              next ?? window.location.pathname + window.location.search;
            window.location.replace(
              `${redirectTo}?next=${encodeURIComponent(targetNext)}`
            );
          }
          return;
        }

        finish(null);
      } catch (e: unknown) {
        const err = { code: "error", message: String(e) } as AdminAuthError;
        onFailRef.current?.(err);
        finish(err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [supabaseClient, redirectTo, next]);

  return { ready, error, user };
}
