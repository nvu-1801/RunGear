"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { RealtimeChat } from "../chat/realtime-chat";

type DBMsg = {
  id: string;
  session_id: string;
  user_id: string | null;
  role: "admin" | "user";
  text: string;
  created_at: string;
};

type ChatMessage = {
  id: string;
  content: string;
  user: { name: string };
  createdAt: string;
};

export default function SupportChatPanel({ sessionId }: { sessionId: string }) {
  const sb = supabaseBrowser();
  const [initial, setInitial] = useState<ChatMessage[]>([]);
  const roomName = `support:${sessionId}`;

  // dedupe / prevent concurrent sends
  const lastSentRef = useRef<{ sig: string; ts: number } | null>(null);
  const sendingRef = useRef(false);

  // Load lịch sử từ DB và map -> ChatMessage
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await sb
        .from("support_messages")
        .select("id, session_id, user_id, role, text, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!mounted) return;
      if (error) {
        console.error("load messages error:", error);
        setInitial([]);
        return;
      }

      // Type guard for data
      if (!Array.isArray(data)) {
        setInitial([]);
        return;
      }

      const mapped = (data as DBMsg[]).map((m) => ({
        id: m.id,
        content: m.text,
        user: { name: m.role === "admin" ? "Admin" : "Khách" },
        createdAt: m.created_at,
      }));
      setInitial(mapped);
    })();
    return () => {
      mounted = false;
    };
  }, [sb, sessionId]);

  // Khi admin gửi từ UI → ghi vào DB (role=admin).
  const handleMessage = useCallback(
    async (next: ChatMessage[]) => {
      const last = next[next.length - 1];
      if (!last) return;

      const sig = `${last.content}::${sessionId}`;
      const now = Date.now();

      // ignore identical send within 3s
      const lastEntry = lastSentRef.current;
      if (lastEntry && lastEntry.sig === sig && now - lastEntry.ts < 3000) {
        return;
      }

      if (sendingRef.current) return;
      sendingRef.current = true;
      try {
        const { data, error: authErr } = await sb.auth.getUser();

        // Type guard for user data
        if (authErr) {
          console.error("Admin auth error:", authErr);
          return;
        }

        if (
          !data ||
          typeof data !== "object" ||
          !("user" in data) ||
          !data.user ||
          typeof data.user !== "object"
        ) {
          console.error("Admin not authenticated");
          return;
        }

        const user = data.user as { id?: string };
        if (!user.id) {
          console.error("Admin user has no id");
          return;
        }

        const { error } = await sb.from("support_messages").insert({
          session_id: sessionId,
          user_id: user.id,
          role: "admin",
          text: last.content,
        });

        if (error) {
          console.error("Insert failed:", error.message ?? error);
        } else {
          lastSentRef.current = { sig, ts: Date.now() };
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        console.error("handleMessage error:", errorMessage);
      } finally {
        sendingRef.current = false;
      }
    },
    [sb, sessionId]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 sm:p-4 border-b bg-white/70 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-800">Admin Support</div>
          <span className="text-xs text-gray-500">
            #{sessionId.slice(0, 8)}…
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <RealtimeChat
          roomName={roomName}
          username="Admin"
          messages={initial}
          onMessage={handleMessage}
        />
      </div>
    </div>
  );
}
