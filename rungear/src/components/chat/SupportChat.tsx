"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { RealtimeChat } from "./realtime-chat";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext"; // ✅ 1. DÙNG CONTEXT

type DBMsg = {
  id: string;
  session_id: string;
  user_id: string | null;
  role: "user" | "admin";
  text: string;
  created_at: string;
};

type ChatMessage = {
  id: string;
  content: string;
  user: { name: string };
  createdAt: string;
};

// ... (Hàm isValidSessionId và useChatSession giữ nguyên) ...

function isValidSessionId(s: unknown): s is string {
  if (typeof s !== "string") return false;
  return /^[A-Za-z0-9\-_:.]+$/.test(s) && s.length > 5;
}

function useChatSession(): string | null {
  const [sid, setSid] = useState<string | null>(null);
  useEffect(() => {
    try {
      let cur = localStorage.getItem("rg_chat_session");
      if (!isValidSessionId(cur)) {
        const cryptoObj = typeof crypto !== "undefined" ? crypto : null;
        const hasRandomUUID =
          cryptoObj &&
          typeof cryptoObj === "object" &&
          "randomUUID" in cryptoObj &&
          typeof (cryptoObj as { randomUUID?: unknown }).randomUUID ===
            "function";

        cur = hasRandomUUID
          ? (cryptoObj as { randomUUID: () => string }).randomUUID()
          : `${Date.now()}`;
        cur = `${cur}-sess`;
        try {
          localStorage.setItem("rg_chat_session", cur);
        } catch {
          // ignore
        }
      }
      setSid(cur);
    } catch (err: unknown) {
      const fallback = `${Date.now()}-sess`;
      setSid(fallback);
    }
  }, []);
  return sid;
}

export default function SupportChat() {
  const sb = supabaseBrowser();
  const sid = useChatSession();

  // ✅ 1. Lấy thông tin từ Context (FIX LỖI CHẬM)
  const { user, isAdmin, isLoading } = useAuth();
  const currentUserId = useMemo(() => user?.id ?? null, [user]);
  const username = useMemo(() => user?.email ?? "Guest", [user]);
  // authError chỉ true khi auth đã resolve và user === null
  const authError = useMemo(() => !isLoading && !user, [isLoading, user]);

  const [initial, setInitial] = useState<ChatMessage[]>([]);

  // ✅ 1. Xoá các state check auth rườm rà
  // const [username, setUsername] = useState<string>("Guest");
  // const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // const [authChecking, setAuthChecking] = useState(true);
  // const [authError, setAuthError] = useState(false);

  const lastSentRef = useRef<{ sig: string } | null>(null);
  const sendingRef = useRef(false);

  const roomName = useMemo(() => {
    if (currentUserId) return `support:user:${currentUserId}`;
    if (sid) return `support:session:${sid}`; // Fallback cho user chưa login (nếu có)
    return undefined;
  }, [currentUserId, sid]);

  // ✅ 1. Xoá useEffect check auth (sb.auth.getUser)

  // ✅ 2. Load lịch sử TỪ API ROUTE
  useEffect(() => {
    // Chỉ load khi đã đăng nhập (vì API route yêu cầu auth)
    if (!currentUserId) {
      setInitial([]); // Đảm bảo clear lịch sử nếu logout
      return;
    }
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/support/history");
        if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
        }

        const data: DBMsg[] = await res.json();
        if (!mounted || !Array.isArray(data)) return;

        const mapped = data.map((m) => {
          const isMine = m.user_id === currentUserId;

          // Sửa logic tên: Dùng context `isAdmin` để biết mình là admin hay user
          const name = isMine
            ? isAdmin
              ? "Support (Admin)"
              : username ?? "You"
            : m.role === "admin"
            ? "Support"
            : "User";

          return {
            id: m.id,
            content: m.text,
            user: { name },
            createdAt: m.created_at,
          };
        });

        setInitial(mapped);
      } catch (e) {
        console.error("[SupportChat] load history from API error:", e);
        if (mounted) setInitial([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentUserId, username, isAdmin]); // Phụ thuộc vào state từ context

  // ✅ 3. handleMessage vẫn dùng supabaseBrowser để INSERT (vì cần real-time)
  const handleMessage = useCallback(
    async (next: ChatMessage[]) => {
      if (!roomName) {
        console.warn("[SupportChat] No roomName, skip save to DB");
        return;
      }

      // Check auth (lấy từ context). Nếu auth chưa sẵn sàng, skip.
      if (isLoading) {
        console.warn("[SupportChat] Auth still loading, skip save to DB");
        return;
      }
      if (authError) {
        console.warn("[SupportChat] Not authenticated, skip save to DB");
        return;
      }

      const last = next[next.length - 1];
      if (!last) return;

      const sig = last.id;
      if (lastSentRef.current && lastSentRef.current.sig === sig) {
        console.log("[SupportChat] Duplicate same message id, skip");
        return;
      }
      if (sendingRef.current) {
        console.log("[SupportChat] Already sending, skip");
        return;
      }

      sendingRef.current = true;

      try {
        // ✅ 3. Dùng `user` từ context, không gọi sb.auth.getUser()
        if (!user?.id) {
          console.error("[SupportChat] Cannot send: user not authenticated");
          return;
        }

        const { data, error } = await sb
          .from("support_messages")
          .insert({
            session_id: sid ?? null,
            user_id: user.id, // Dùng user.id từ context
            role: isAdmin ? "admin" : "user", // Dùng `isAdmin` từ context
            text: last.content,
          })
          .select("id");

        if (error) {
          console.error("[SupportChat] INSERT support_messages error:", error);
        } else {
          console.log("[SupportChat] INSERT OK, row:", data);
          lastSentRef.current = { sig };
        }
      } catch (e) {
        console.error("[SupportChat] handleMessage exception:", e);
      } finally {
        sendingRef.current = false;
      }
    },
    [sb, sid, roomName, authError, user, isAdmin] // Dùng state từ context
  );

  // ✅ 1. Xoá Loading state (vì authChecking đã bị xoá)
  // if (authChecking) { ... }

  // ✅ Not logged in - Show login prompt
  // Nếu auth vẫn đang tải, hiển thị placeholder/loader thay vì prompt
  if (!isLoading && authError) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="rounded-2xl border bg-white p-10 text-center shadow-lg max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-700"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Bạn cần đăng nhập
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Để sử dụng chức năng chat hỗ trợ, vui lòng đăng nhập vào tài khoản
            của bạn.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Đăng nhập ngay
          </Link>
          <p className="text-xs text-gray-500 mt-4">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Đăng ký tại đây
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ✅ Logged in - Show chat
  if (!roomName) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 sm:px-5 pt-3 bg-white/60 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Đang online
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {currentUserId ? "Đã đăng nhập" : "Khách"}
          </span>
        </div>
        <div className="text-[13px] text-gray-600 pb-3">
          Chat realtime với nhân viên hỗ trợ. Tin nhắn sẽ được lưu lại trong tài
          khoản của bạn.
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <RealtimeChat
          roomName={roomName}
          username={username}
          messages={initial}
          onMessage={handleMessage}
        />
      </div>
    </div>
  );
}
