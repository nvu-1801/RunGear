// src/hooks/useAdminGuard.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminAuthError = { code: string; message?: string } | null;

type Options = {
  supabaseClient?: SupabaseClient;
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

  const calledRef = useRef(false);
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
        const sb = supabaseClient ?? supabaseBrowser();

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

        // Type guard for user from auth responses
        let u: { id: string; email?: string | null } | null = null;

        if (
          userRes &&
          typeof userRes === "object" &&
          "data" in userRes &&
          userRes.data &&
          typeof userRes.data === "object" &&
          "user" in userRes.data &&
          userRes.data.user &&
          typeof userRes.data.user === "object"
        ) {
          const userData = userRes.data.user as {
            id?: string;
            email?: string | null;
          };
          if (userData.id) {
            u = { id: userData.id, email: userData.email ?? null };
          }
        }

        if (
          !u &&
          sessionRes &&
          typeof sessionRes === "object" &&
          "data" in sessionRes &&
          sessionRes.data &&
          typeof sessionRes.data === "object" &&
          "session" in sessionRes.data &&
          sessionRes.data.session &&
          typeof sessionRes.data.session === "object" &&
          "user" in sessionRes.data.session &&
          sessionRes.data.session.user &&
          typeof sessionRes.data.session.user === "object"
        ) {
          const sessionUser = sessionRes.data.session.user as {
            id?: string;
            email?: string | null;
          };
          if (sessionUser.id) {
            u = { id: sessionUser.id, email: sessionUser.email ?? null };
          }
        }

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

          // Type guard for profile data
          let prof: { role?: unknown } | null = null;

          if (
            profRes &&
            typeof profRes === "object" &&
            "data" in profRes &&
            profRes.data
          ) {
            if (Array.isArray(profRes.data)) {
              prof = profRes.data[0] ?? null;
            } else if (typeof profRes.data === "object") {
              prof = profRes.data as { role?: unknown };
            }
          }

          if (prof && typeof prof.role === "string") {
            isAdmin = prof.role.trim().toLowerCase() === "admin";
          }
        } catch (e: unknown) {
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
        const message = e instanceof Error ? e.message : String(e);
        const err = { code: "error", message } as AdminAuthError;
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
