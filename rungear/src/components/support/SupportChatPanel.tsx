"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { RealtimeChat } from "../chat/realtime-chat";

type DBMsg = {
  id: string;
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

export default function SupportChatPanel({ userId }: { userId: string }) {
  const sb = supabaseBrowser();
  const [initial, setInitial] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const roomName = `support:user:${userId}`;

  const lastSentRef = useRef<{ sig: string; ts: number } | null>(null);
  const sendingRef = useRef(false);

  // ✅ Load lịch sử theo user_id
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await sb
          .from("support_messages")
          .select("id, user_id, role, text, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        if (!mounted) return;

        if (error || !Array.isArray(data)) {
          console.error("load messages error:", error);
          setInitial([]);
          return;
        }

        const mapped = (data as DBMsg[]).map((m) => ({
          id: m.id,
          content: m.text || "",
          user: { name: m.role === "admin" ? "Admin" : "Khách" },
          createdAt: m.created_at,
        }));

        setInitial(mapped);
      } catch (e) {
        console.error("Failed to load messages:", e);
        setInitial([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [sb, userId]);

  // ✅ Admin gửi message
  const handleMessage = useCallback(
    async (next: ChatMessage[]) => {
      if (!Array.isArray(next) || next.length === 0) return;

      const last = next[next.length - 1];
      if (!last?.content) return;

      const sig = `${last.content}::${userId}`;
      const now = Date.now();

      const lastEntry = lastSentRef.current;
      if (lastEntry && lastEntry.sig === sig) {
        const elapsed = now - lastEntry.ts;
        if (elapsed < 2000) {
          console.log("[SupportChatPanel] Duplicate within 2s, skip");
          return;
        }
      }

      if (sendingRef.current) return;
      sendingRef.current = true;

      try {
        const { data, error: authErr } = await sb.auth.getUser();

        if (authErr || !data?.user?.id) {
          console.error("Admin not authenticated");
          return;
        }

        const { error } = await sb.from("support_messages").insert({
          user_id: userId,
          session_id: null,
          role: "admin",
          text: last.content,
        });

        if (error) {
          console.error("Insert failed:", error);
        } else {
          lastSentRef.current = { sig, ts: now }; // ✅ fix: thêm ts
        }
      } catch (e) {
        console.error("handleMessage error:", e);
      } finally {
        sendingRef.current = false;
      }
    },
    [sb, userId]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 sm:p-4 border-b bg-white/70 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-800">Admin Support</div>
          <span className="text-xs text-gray-500">
            user:{userId.slice(0, 8)}…
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <RealtimeChat
            roomName={roomName}
            username="Admin"
            messages={initial}
            onMessage={handleMessage}
          />
        )}
      </div>
    </div>
  );
}
