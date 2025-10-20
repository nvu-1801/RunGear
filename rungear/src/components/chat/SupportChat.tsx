"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { RealtimeChat } from "./realtime-chat";

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
        // Type guard for crypto.randomUUID
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
  const roomName = sid ? `support:${sid}` : undefined;

  const [initial, setInitial] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState<string>("Guest");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // prevent duplicate sends: remember last send signature and timestamp
  const lastSentRef = useRef<{ sig: string; ts: number } | null>(null);
  const sendingRef = useRef(false);

  // Lấy thông tin user (id + email) trước để map lịch sử đúng vị trí
  useEffect(() => {
    (async () => {
      try {
        const { data } = await sb.auth.getUser();

        // Type guard for user data
        if (
          data &&
          typeof data === "object" &&
          "user" in data &&
          data.user &&
          typeof data.user === "object"
        ) {
          const user = data.user as { id?: string; email?: string };
          if (user.email) setUsername(user.email);
          if (user.id) setCurrentUserId(user.id);
        }
      } catch (e: unknown) {
        // ignore
      }
    })();
  }, [sb]);

  // Load lịch sử từ DB — chạy sau khi đã biết currentUserId (hoặc ít nhất sid)
  useEffect(() => {
    if (!sid) return;
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await sb
          .from("support_messages")
          .select("id, session_id, user_id, role, text, created_at")
          .eq("session_id", sid)
          .order("created_at", { ascending: true });

        if (!mounted) return;
        if (error) {
          setInitial([]);
          return;
        }

        // Type guard for data
        if (!Array.isArray(data)) {
          setInitial([]);
          return;
        }

        // map: xác định "mình" nếu message.session_id === sid  OR message.user_id === currentUserId
        const mapped = (data as DBMsg[]).map((m) => {
          const isMine =
            (m.session_id && sid && m.session_id === sid) ||
            (m.user_id && currentUserId && m.user_id === currentUserId);

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
          } as ChatMessage;
        });

        setInitial(mapped);
      } catch (e: unknown) {
        if (mounted) setInitial([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sb, sid, currentUserId, username]);

  // Gửi từ UI → ghi DB role=user
  const handleMessage = useCallback(
    async (next: ChatMessage[]) => {
      if (!sid) return;
      const last = next[next.length - 1];
      if (!last) return;

      const sig = `${last.content}::${sid}`;
      const now = Date.now();

      // simple dedupe: ignore identical send within 3s
      const lastEntry = lastSentRef.current;
      if (lastEntry && lastEntry.sig === sig && now - lastEntry.ts < 3000) {
        return;
      }

      if (sendingRef.current) return; // avoid concurrent sends
      sendingRef.current = true;
      try {
        const {
          data: { user },
        } = await sb.auth.getUser();

        const { error } = await sb.from("support_messages").insert({
          session_id: sid,
          user_id: user?.id ?? null,
          role: "user",
          text: last.content,
        });

        if (!error) {
          lastSentRef.current = { sig, ts: Date.now() };
        }
      } catch (e: unknown) {
        // ignore
      } finally {
        sendingRef.current = false;
      }
    },
    [sb, sid]
  );

  if (!roomName) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 sm:px-5 pt-3 bg-white/60">
        <div className="text-[13px] text-gray-600">
          Chat realtime với nhân viên. Bạn có thể rời trang—cuộc trò chuyện sẽ
          gắn với phiên hiện tại.
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
