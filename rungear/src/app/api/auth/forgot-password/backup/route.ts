import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseServer } from "@/libs/db/supabase/supabase-server";
import { error } from "console";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
export async function POST(req: NextRequest) {
  try {
    console.log("reqqqqq:", req);
    const body = await req.json();
    console.log("bodyyyy:", body);
    console.log("email:", body.email);
    const { email } = body;

    // Validation
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    const supabase = await supabaseAdmin();

    // Kiểm tra email có tồn tại trong DB không
    const { data: user, error: checkError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email.toLowerCase().trim())
      .single();
      console.log("user found:", user);
      console.log("checkError:", checkError);

    if (checkError || !user) {
      // Không tiết lộ email có tồn tại hay không (bảo mật)
      return NextResponse.json(
        { error: "Tài khoản không tồn tại" },
        { status: 404 }
      );
    }

    // Sử dụng Supabase Auth để gửi email reset password
    console.log("🔗 Redirect URL:", `${process.env.NEXT_PUBLIC_BASE_URL}/auth/forgot-password/reset-password`);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/forgot-password/reset-password`,
      }
    );

    if (resetError) {
      console.error("Reset password error:", resetError);
      return NextResponse.json(
        { error: "Không thể gửi email đặt lại mật khẩu" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Link đặt lại mật khẩu đã được gửi đến email của bạn",
    });
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra, vui lòng thử lại" },
      { status: 500 }
    );
  }
}