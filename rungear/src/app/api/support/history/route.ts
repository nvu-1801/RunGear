import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// ✅ 1. Import createServerClient trực tiếp
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// ❌ 2. KHÔNG import hàm supabaseServer read-only
// import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET() {
  const cookieStore = await cookies();

  // ✅ 3. Tạo một Supabase client đầy đủ cho API Route
  // Client này có thể ĐỌC, GHI, và XOÁ cookie
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Lỗi có thể xảy ra nếu cố set cookie trong một Route Handler
            // đã streaming response. Bỏ qua trong trường hợp này.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Lỗi có thể xảy ra nếu cố set cookie trong một Route Handler
            // đã streaming response. Bỏ qua trong trường hợp này.
          }
        },
      },
    }
  );

  try {
    const {
      data: { user },
      error: userError,
    } = await sb.auth.getUser(); // ✅ Giờ hàm này có thể refresh token thành công

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy lịch sử tin nhắn của user đã đăng nhập
    const { data, error } = await sb
      .from("support_messages")
      .select("id, session_id, user_id, role, text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[API/support/history] Error fetching messages:", error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}