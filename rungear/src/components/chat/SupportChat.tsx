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

  const lastSentRef = useRef<{ sig: string } | null>(null);
  const sendingRef = useRef(false);

  // ✅ roomName ưu tiên user_id, fallback session
  const roomName = useMemo(() => {
    if (currentUserId) return `support:user:${currentUserId}`;
    if (sid) return `support:session:${sid}`;
    return undefined;
  }, [currentUserId, sid]);

  // Load user info
  useEffect(() => {
    (async () => {
      try {
        const { data } = await sb.auth.getUser();
        console.log("[SupportChat] Loaded user info:", data); // ✅ sửa clgog -> console.log
        if (data?.user) {
          if (data.user.email) setUsername(data.user.email);
          if (data.user.id) setCurrentUserId(data.user.id);
        }
      } catch (e) {
        console.error("[SupportChat] getUser error:", e);
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

  // ✅ handleMessage: dedupe theo message.id, không theo content
  const handleMessage = useCallback(
    async (next: ChatMessage[]) => {
      if (!roomName) {
        console.warn("[SupportChat] No roomName, skip save to DB");
        return;
      }
      const last = next[next.length - 1];
      if (!last) return;

      const sig = last.id; // ✅ mỗi message id là duy nhất

      // Nếu đã lưu message này rồi thì không insert nữa
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
        if (userErr) {
          console.error("[SupportChat] auth.getUser error:", userErr);
        }
        console.log("[SupportChat] Sending message as user:", user?.id);

        const { data, error } = await sb
          .from("support_messages")
          .insert({
            session_id: sid ?? null,
            user_id: user?.id ?? null,
            role: "user",
            text: last.content,
          })
          .select("id");

        if (error) {
          console.error("[SupportChat] INSERT support_messages error:", error);
        } else {
          console.log("[SupportChat] INSERT OK, row:", data);
          lastSentRef.current = { sig }; // ✅ đánh dấu đã lưu message này
        }
      } catch (e) {
        console.error("[SupportChat] handleMessage exception:", e);
      } finally {
        sendingRef.current = false;
      }
    },
    [sb, sid, roomName]
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
