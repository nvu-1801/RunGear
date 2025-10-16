"use client";

import { useEffect, useMemo, useState } from "react";
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

function isValidSessionId(s: unknown) {
  if (typeof s !== "string") return false;
  // allow UUID-like or timestamp-based ids with safe chars
  return /^[A-Za-z0-9\-_:.]+$/.test(s) && s.length > 5;
}

function useChatSession(): string | null {
  const [sid, setSid] = useState<string | null>(null);
  useEffect(() => {
    try {
      let cur = localStorage.getItem("rg_chat_session");
      // reject clearly invalid values like "[]" or serialized arrays/objects
      if (!isValidSessionId(cur)) {
        cur = (crypto as any).randomUUID?.() ?? `${Date.now()}`;
        cur = `${cur}-sess`;
        try {
          localStorage.setItem("rg_chat_session", cur);
        } catch {
          // ignore quota / privacy errors
        }
      }
      setSid(cur);
    } catch (err) {
      // fallback: generate ephemeral id but do not persist
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

  // Lấy tên hiển thị (nếu user đã đăng nhập có email)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await sb.auth.getUser();
        const email = data.user?.email;
        if (email) setUsername(email);
      } catch (e: unknown) {
        // safe ignore
        console.error("getUser error", e);
      }
    })();
  }, [sb]);

  // Load lịch sử từ DB
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
          console.error("load messages error:", error);
          setInitial([]);
          return;
        }
        const mapped = (data as DBMsg[]).map((m) => ({
          id: m.id,
          content: m.text,
          user: { name: m.role === "admin" ? "Support" : "You" },
          createdAt: m.created_at,
        }));
        setInitial(mapped);
      } catch (e: unknown) {
        console.error("load messages unexpected error:", e);
        if (mounted) setInitial([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sb, sid]);

  // Gửi từ UI → ghi DB role=user
  async function handleMessage(next: ChatMessage[]) {
    if (!sid) return;
    const last = next[next.length - 1];
    if (!last) return;

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
      if (error) console.error("Insert failed:", error.message ?? error);
    } catch (e: unknown) {
      console.error("handleMessage error:", e);
    }
  }

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
