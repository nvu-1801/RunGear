"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../../libs/db/supabase/supabase-client";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get("redirect") || "/products/home";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const sb = supabaseBrowser();

    startTransition(async () => {
      try {
        if (mode === "signup") {
          const { error } = await sb.auth.signUp({ email, password });
          if (error) throw error;
          await sb.auth.signInWithPassword({ email, password }).catch(() => {});
        } else {
          const { error } = await sb.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
        await fetch("/api/auth/ensure-admin", { method: "POST" }).catch(() => {});
        await sb.auth.refreshSession();
        router.replace(redirectTo);
        router.refresh();
      } catch (err: any) {
        setMsg(err?.message ?? "Có lỗi xảy ra");
      }
    });
  }

  // trong AuthForm.tsx
async function signInWithGoogle() {
  const sb = supabaseBrowser();
  const origin = window.location.origin;
  const next = new URLSearchParams(window.location.search).get("redirect") || "/products/home";

  await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      // quay về route callback của Next.js
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
}


  return (
    <form onSubmit={onSubmit} className="space-y-4 text-gray-900">
      {/* OAuth (tuỳ chọn) */}
      <button
        type="button"
        className="w-full h-10 rounded-full border border-gray-300 bg-white
                   text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2"
        onClick={signInWithGoogle}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#EA4335" d="M12 11.9v3.8h5.4c-.2 1.2-1.6 3.6-5.4 3.6-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 5.6 14.6 4.7 12 4.7 6.9 4.7 2.8 8.8 2.8 13.9S6.9 23 12 23c6.9 0 9.6-4.8 9.6-7.3 0-.5 0-.9-.1-1.3H12z"/></svg>
        <span className="text-sm">Continue with Google</span>
      </button>

      <div className="flex items-center gap-2">
        <span className="h-px bg-gray-200 flex-1" />
        <span className="text-[11px] text-gray-500">Or use email</span>
        <span className="h-px bg-gray-200 flex-1" />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-800">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-white text-gray-900 placeholder:text-gray-400
                     border border-gray-300 rounded-xl px-3 py-2 outline-none
                     focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-800">Mật khẩu</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-white text-gray-900 placeholder:text-gray-400
                       border border-gray-300 rounded-xl px-3 py-2 pr-10 outline-none
                       focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
            aria-label="Toggle password visibility"
          >
            {show ? "🙈" : "👁️"}
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Ít nhất 8 ký tự.</p>
      </div>

      <button
        type="submit"
        className="w-full h-10 rounded-full bg-gray-900 hover:bg-black text-white transition"
      >
        {mode === "signin" ? "Đăng nhập" : "Đăng ký"}
      </button>

      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </form>
  );
}
