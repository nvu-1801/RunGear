import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) =>
          (cookieStore as any).set({ name, value, ...options }),
        remove: (name: string, options: any) =>
          (cookieStore as any).set({ name, value: "", ...options, maxAge: 0 }),
      },
    }
  );

  // Lấy user hiện tại từ session
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ ok: false }, { status: 401 });

  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  // Nếu email nằm trong allowlist và chưa có role=admin thì set
  if (allow.includes((user.email || "").toLowerCase()) && user.app_metadata?.role !== "admin") {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // CHỈ dùng ở server
    );

    const { error: upErr } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...(user.app_metadata || {}), role: "admin" },
    });
    if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
