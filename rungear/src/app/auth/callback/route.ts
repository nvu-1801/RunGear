import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
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

  // Lấy code từ URL và đổi sang session + đặt cookie phiên Supabase
  const { error } = await supabase.auth.exchangeCodeForSession(request.url);
  if (error) {
    const u = new URL("/auth/signin", new URL(request.url).origin);
    u.searchParams.set("error", error.message);
    return NextResponse.redirect(u);
  }

  // (tuỳ chọn) gắn role admin theo allowlist
  try {
    const url = new URL("/api/auth/ensure-admin", new URL(request.url).origin);
    await fetch(url, { method: "POST" });
  } catch {}

  // điều hướng về trang đích
  const next = new URL(request.url).searchParams.get("next") || "/products/home";
  return NextResponse.redirect(new URL(next, new URL(request.url).origin));
}
