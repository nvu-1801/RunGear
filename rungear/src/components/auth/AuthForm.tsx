"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "../../libs/supabase/supabase-client";

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
  // Chỉ cho phép relative redirect nội bộ
  const redirectTo = sp.get("redirect")?.startsWith("/")
    ? sp.get("redirect")!
    : "/home";

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
            // case tắt email confirmation
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

        // Sign in email/password
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;

        await sb.auth.refreshSession();
        router.replace(redirectTo);
        router.refresh();
      } catch (err: unknown) {
        // safe extract message from unknown
        const maybeMessage =
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message?: unknown }).message
            : undefined;
        setMsg(
          humanize(
            typeof maybeMessage === "string" ? maybeMessage : String(err)
          )
        );
        console.error("[auth]", err);
      }
    });
  }

  async function signInWithGoogle() {
    if (pending) return; // chặn double click
    const sb = supabaseBrowser();
    const origin = window.location.origin;
    const next = new URLSearchParams(window.location.search)
      .get("redirect")
      ?.startsWith("/")
      ? new URLSearchParams(window.location.search).get("redirect")!
      : "/home";

    // Quan trọng: redirectTo phải đúng /auth/callback và đã whitelisted
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // (tuỳ chọn) giúp user chọn account lại và xin refresh_token
        queryParams: {
          prompt: "select_account", // hoặc "consent"
          access_type: "offline",
        },
        scopes: "openid email profile",
      },
    });

    if (error) {
      setMsg(humanize(error.message));
      console.error("[oauth]", error);
    }
    // data.url sẽ được supabase-js tự mở (browser redirect). Không cần set window.location.
  }

  async function resendConfirmEmail() {
    setMsg(null);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.resend({ type: "signup", email });
    if (error) setMsg(humanize(error.message));
    else setConfirmNotice(`Đã gửi lại email xác nhận đến ${email}.`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-gray-900">
      {/* Google OAuth */}
      <button
        type="button"
        disabled={pending}
        className="w-full h-10 rounded-full border border-gray-300 bg-white
                   text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-60"
        onClick={signInWithGoogle}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 11.9v3.8h5.4c-.2 1.2-1.6 3.6-5.4 3.6-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 5.6 14.6 4.7 12 4.7 6.9 4.7 2.8 8.8 2.8 13.9S6.9 23 12 23c6.9 0 9.6-4.8 9.6-7.3 0-.5 0-.9-.1-1.3H12z"
          />
        </svg>
        <span className="text-sm">Continue with Google</span>
      </button>

      {/* Thông báo confirm */}
      {confirmNotice && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {confirmNotice}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={resendConfirmEmail}
              className="text-emerald-700 underline underline-offset-2"
            >
              Gửi lại email xác nhận
            </button>
            <a
              href="/auth/signin"
              className="text-emerald-700 underline underline-offset-2"
            >
              Đã xác nhận? Đăng nhập
            </a>
          </div>
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm mb-1 text-gray-800">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white text-gray-900 placeholder:text-gray-400
                     border border-gray-300 rounded-xl px-3 py-2 outline-none
                     focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
          placeholder="you@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm mb-1 text-gray-800">Mật khẩu</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white text-gray-900 placeholder:text-gray-400
                       border border-gray-300 rounded-xl px-3 py-2 pr-10 outline-none
                       focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
            aria-label="Toggle password visibility"
          >
            {show ? "🙈" : "👁️"}
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Ít nhất 8 ký tự.</p>
      </div>

      {mode === "signin" && (
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-10 rounded-full bg-gray-900 hover:bg-black text-white transition disabled:opacity-60"
      >
        {pending
          ? "Đang xử lý..."
          : mode === "signin"
          ? "Đăng nhập"
          : "Đăng ký"}
      </button>

      {msg && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {msg}
        </p>
      )}
    </form>
  );
}
