import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

async function handle(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // 1) Lấy code qua GET (chủ yếu)
  let code = searchParams.get("code");

  // 2) Dự phòng khi nhà cung cấp POST về
  if (!code && request.method === "POST") {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      code = (form.get("code") as string) || null;
    } else if (ct.includes("application/json")) {
      const body = await request.json().catch(() => null);
      code = body?.code ?? null;
    }
  }

  const next = searchParams.get("next") || "/home";

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) =>
          (cookieStore as any).set({ name, value, ...options }),
        remove: (name: string, options: CookieOptions) =>
          (cookieStore as any).set({ name, value: "", ...options, maxAge: 0 }),
      },
    }
  );

  if (code) {
    // ĐỔI CODE -> SESSION + set cookie auth
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect về trang đích
  return NextResponse.redirect(new URL(next, request.url));
}

export async function GET(request: Request) { return handle(request); }
export async function POST(request: Request) { return handle(request); }

// Không cache để tránh lỗi state
export const dynamic = "force-dynamic";
