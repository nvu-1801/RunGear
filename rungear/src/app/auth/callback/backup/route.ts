import { NextRequest,NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

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
          (
            cookieStore as unknown as {
              set: (c: Record<string, unknown>) => void;
            }
          ).set({
            name,
            value,
            ...options,
          }),
        remove: (name: string, options: CookieOptions) =>
          (
            cookieStore as unknown as {
              set: (c: Record<string, unknown>) => void;
            }
          ).set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          }),
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

export async function GET(request: Request) {
  return handle(request);
}
export async function POST(request: Request) {
  return handle(request);
}

// Không cache để tránh lỗi state
export const dynamic = "force-dynamic";

//
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.log("🔍 Callback params:", { code: code?.substring(0, 20), next });

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      console.log("🔐 Exchange result:", {
        hasSession: !!data.session,
        hasUser: !!data.user,
        error
      });

      if (error) {
        console.error("❌ Exchange error:", error);
        return NextResponse.redirect(`${origin}/auth/forgot-password?error=invalid_code`);
      }

      if (data.session) {
        console.log("✅ Session created, redirecting to:", next);
        
        // Redirect với session token trong cookie
        const response = NextResponse.redirect(`${origin}${next}`);
        
        // Set session cookies
        response.cookies.set("sb-access-token", data.session.access_token, {
          path: "/",
          maxAge: 60 * 60, // 1 hour
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });

        response.cookies.set("sb-refresh-token", data.session.refresh_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });

        return response;
      }
    } catch (err) {
      console.error("💥 Exception:", err);
    }
  }

  // Fallback nếu không có code
  console.log("❌ No code found, redirecting to signin");
  return NextResponse.redirect(`${origin}/auth/signin`);
}
