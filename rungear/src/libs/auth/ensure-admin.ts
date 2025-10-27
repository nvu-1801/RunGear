// src/libs/auth/ensure-admin.ts
// Dùng chung cho client (supabaseBrowser) và server (supabaseServer)

import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminCheckResult = {
  user: { id: string; email?: string | null };
};

export class AdminAuthError extends Error {
  code: "NOT_AUTHENTICATED" | "NOT_ADMIN" | "DB_ERROR";
  constructor(code: AdminAuthError["code"], message?: string) {
    super(message || code);
    this.code = code;
  }
}

/**
 * Kiểm tra quyền admin.
 * - Ưu tiên profiles.role = 'admin'
 * - Fallback app_metadata.role = 'admin' hoặc app_metadata.roles chứa 'admin'
 *
 * @param sb Supabase client (browser hoặc server)
 * @returns user { id, email }
 * @throws AdminAuthError("NOT_AUTHENTICATED" | "NOT_ADMIN" | "DB_ERROR")
 */
export async function ensureAdmin(
  sb: SupabaseClient
): Promise<AdminCheckResult> {
  // đảm bảo session được refresh nếu cần
  await sb.auth.getSession().catch(() => {});

  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr) throw new AdminAuthError("DB_ERROR", userErr.message);
  if (!user) throw new AdminAuthError("NOT_AUTHENTICATED");

  // Type guard for app_metadata
  const meta: unknown = user.app_metadata;
  let metaIsAdmin = false;

  if (meta && typeof meta === "object") {
    const metaObj = meta as Record<string, unknown>;

    // Check role field
    const metaRole =
      typeof metaObj.role === "string" ? metaObj.role.toLowerCase() : undefined;

    // Check roles array
    const metaRoles = Array.isArray(metaObj.roles)
      ? metaObj.roles
          .filter((r): r is string => typeof r === "string")
          .map((r) => r.toLowerCase())
      : [];

    metaIsAdmin = metaRole === "admin" || metaRoles.includes("admin");
  }

  // Chính: profiles.role
  const { data: prof, error: profErr } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profErr && profErr.code !== "PGRST116") {
    // PGRST116 = row not found (tuỳ pgrest), vẫn có thể fallback meta
    throw new AdminAuthError("DB_ERROR", profErr.message);
  }

  // Type guard for profile role
  const profileRole =
    prof && typeof prof === "object" && "role" in prof
      ? (prof as { role: unknown }).role
      : null;

  const isAdmin =
    (typeof profileRole === "string" && profileRole === "admin") || metaIsAdmin;

  if (!isAdmin) throw new AdminAuthError("NOT_ADMIN");

  return { user: { id: user.id, email: user.email } };
}
