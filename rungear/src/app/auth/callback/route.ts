import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const cookieStore = await cookies();

  // client theo session của user (đọc user hiện tại)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => (cookieStore as any).set({ name, value, ...options }),
        remove: (name, options) => (cookieStore as any).set({ name, value: "", ...options, maxAge: 0 }),
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ ok: false }, { status: 401 });

  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  if (allow.includes((user.email || "").toLowerCase())) {
    // service role: cập nhật app_metadata.role = 'admin'
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: upErr } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...(user.app_metadata || {}), role: "admin" },
    });
    if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

    // đồng bộ profiles.role = 'admin'
    await admin.from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
}
