"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../libs/db/supabase/supabase-client";

function humanize(message?: string) {
  const m = (message || "").toLowerCase();
  if (m.includes("email not confirmed") || m.includes("not confirmed"))
    return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.";
  if (m.includes("invalid login credentials"))
    return "Sai email hoặc mật khẩu.";
  if (m.includes("email provider disabled"))
    return "Email/Password đang bị tắt trong Supabase. Hãy bật Provider Email.";
  if (m.includes("captcha"))
    return "Captcha đang bật. Hãy tắt Captcha hoặc tích hợp hCaptcha.";
  return message || "Có lỗi xảy ra.";
}

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get("redirect") || "/home";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setConfirmNotice(null);
    const sb = supabaseBrowser();

    startTransition(async () => {
      try {
        if (mode === "signup") {
          const origin = window.location.origin;
          const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
                redirectTo
              )}`,
            },
          });
          if (error) throw error;

          if (data.session) {
            await sb.auth.refreshSession();
            router.replace(redirectTo);
            router.refresh();
            return;
          }

          setConfirmNotice(
            `Đã gửi email xác nhận đến ${email}. Vui lòng kiểm tra hộp thư và bấm vào liên kết để kích hoạt tài khoản.`
          );
          return;
        }

        // Sign in
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;

        await sb.auth.refreshSession();
        router.replace(redirectTo);
        router.refresh();
      } catch (err: any) {
        setMsg(humanize(err?.message));
        console.error("[auth]", err);
      }
    });
  }

  async function signInWithGoogle() {
    const sb = supabaseBrowser();
    const origin = window.location.origin;
    const next =
      new URLSearchParams(window.location.search).get("redirect") || "/home";

    await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  async function resendConfirmEmail() {
    setMsg(null);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.resend({ type: "signup", email });
    if (error) setMsg(humanize(error.message));
    else setConfirmNotice(`Đã gửi lại email xác nhận đến ${email}.`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 text-gray-900">
      {/* Nút OAuth Google */}
      <button
        type="button"
        className="w-full h-11 rounded-full border border-gray-300 bg-white
                   text-gray-800 hover:bg-blue-50 flex items-center justify-center gap-2 shadow-sm transition"
        onClick={signInWithGoogle}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path
            fill="#EA4335"
            d="M12 11.9v3.8h5.4c-.2 1.2-1.6 3.6-5.4 3.6-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 5.6 14.6 4.7 12 4.7 6.9 4.7 2.8 8.8 2.8 13.9S6.9 23 12 23c6.9 0 9.6-4.8 9.6-7.3 0-.5 0-.9-.1-1.3H12z"
          />
        </svg>
        <span className="text-sm font-medium">Đăng nhập với Google</span>
      </button>

      {/* Thông báo confirm email */}
      {confirmNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 shadow">
          {confirmNotice}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={resendConfirmEmail}
              className="text-emerald-700 underline underline-offset-2 font-medium"
            >
              Gửi lại email xác nhận
            </button>
            <link
              href="/auth/signin"
              className="text-emerald-700 underline underline-offset-2 font-medium"
            >
              Đã xác nhận? Đăng nhập
            </link>
          </div>
        </div>
      )}

      {/* Form */}
      <div>
        <label className="block text-sm mb-1 text-gray-800 font-medium">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white text-gray-900 placeholder:text-gray-400
                     border border-gray-300 rounded-xl px-3 py-2.5 outline-none
                     focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-800 font-medium">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white text-gray-900 placeholder:text-gray-400
                       border border-gray-300 rounded-xl px-3 py-2.5 pr-12 outline-none
                       focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-blue-600 transition"
            aria-label="Toggle password visibility"
          >
            {show ? "🙈" : "👁️"}
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Ít nhất 8 ký tự.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-base shadow transition disabled:opacity-60"
      >
        {pending
          ? "Đang xử lý..."
          : mode === "signin"
          ? "Đăng nhập"
          : "Đăng ký"}
      </button>

      {msg && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 shadow">
          {msg}
        </p>
      )}
    </form>
  );
}
