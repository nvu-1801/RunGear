"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { RealtimeChat } from "./realtime-chat";
import Link from "next/link";

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

  const [initial, setInitial] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState<string>("Guest");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState(false);

  const lastSentRef = useRef<{ sig: string } | null>(null);
  const sendingRef = useRef(false);

  // ✅ roomName ưu tiên user_id, fallback session
  const roomName = useMemo(() => {
    if (currentUserId) return `support:user:${currentUserId}`;
    if (sid) return `support:session:${sid}`;
    return undefined;
  }, [currentUserId, sid]);

  // ✅ Load user info với error handling
  useEffect(() => {
    (async () => {
      try {
        setAuthChecking(true);
        const { data, error } = await sb.auth.getUser();

        if (error) {
          console.error("[SupportChat] auth.getUser error:", error);
          // AuthSessionMissingError = chưa login
          if (error.message.includes("Auth session missing")) {
            setAuthError(true);
          }
          setAuthChecking(false);
          return;
        }

        console.log("[SupportChat] Loaded user info:", data);

        if (data?.user) {
          if (data.user.email) setUsername(data.user.email);
          if (data.user.id) setCurrentUserId(data.user.id);
          setAuthError(false);
        } else {
          // Không có user = chưa login
          setAuthError(true);
        }

        setAuthChecking(false);
      } catch (e) {
        console.error("[SupportChat] getUser exception:", e);
        setAuthError(true);
        setAuthChecking(false);
      }
    })();
  }, [sb]);

  // ✅ Load lịch sử: ưu tiên user_id, fallback session_id
  useEffect(() => {
    if (!sid && !currentUserId) return;
    let mounted = true;

    (async () => {
      try {
        let query = sb
          .from("support_messages")
          .select("id, session_id, user_id, role, text, created_at")
          .order("created_at", { ascending: true });

        if (currentUserId) {
          query = query.eq("user_id", currentUserId);
        } else if (sid) {
          query = query.eq("session_id", sid);
        } else {
          return;
        }

        const { data, error } = await query;

        if (!mounted || error || !Array.isArray(data)) {
          if (error) {
            console.error("[SupportChat] load history error:", error);
          }
          setInitial([]);
          return;
        }

        const mapped = (data as DBMsg[]).map((m) => {
          const isMine =
            (m.user_id && currentUserId && m.user_id === currentUserId) ||
            (!currentUserId && m.session_id && sid && m.session_id === sid);

          const name = isMine
            ? username ?? "You"
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
        console.error("[SupportChat] load history exception:", e);
        if (mounted) setInitial([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [sb, sid, currentUserId, username]);

  // ✅ handleMessage: chỉ lưu nếu đã login
  const handleMessage = useCallback(
    async (next: ChatMessage[]) => {
      if (!roomName) {
        console.warn("[SupportChat] No roomName, skip save to DB");
        return;
      }

      // ✅ Check auth trước khi gửi
      if (authError) {
        console.warn("[SupportChat] Not authenticated, skip save to DB");
        return;
      }

      const last = next[next.length - 1];
      if (!last) return;

      const sig = last.id;

      const lastEntry = lastSentRef.current;
      if (lastEntry && lastEntry.sig === sig) {
        console.log("[SupportChat] Duplicate same message id, skip");
        return;
      }

      if (sendingRef.current) {
        console.log("[SupportChat] Already sending, skip");
        return;
      }
      sendingRef.current = true;

      try {
        const {
          data: { user },
          error: userErr,
        } = await sb.auth.getUser();

        if (userErr || !user?.id) {
          console.error("[SupportChat] Cannot send: user not authenticated");
          sendingRef.current = false;
          return;
        }

        console.log("[SupportChat] Sending message as user:", user.id);

        const { data, error } = await sb
          .from("support_messages")
          .insert({
            session_id: sid ?? null,
            user_id: user.id,
            role: "user",
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
    [sb, sid, roomName, authError]
  );

  // ✅ Loading state
  if (authChecking) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // ✅ Not logged in - Show login prompt
  if (authError) {
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
