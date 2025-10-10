"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../../../libs/db/supabase/supabase-client";
import SupportUserList from "./SupportUserList";
import SupportChatPanel from "./SupportChatPanel";

type SessionRow = {
  session_id: string;
  user_id: string | null;
  created_at?: string;
};

export default function AdminSupportPage() {
  const sb = supabaseBrowser();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // ✅ gom unique theo session_id và sắp theo "vừa có message gần nhất"
  function upsertAndBumpTop(s: SessionRow) {
    setSessions((prev) => {
      if (!s.session_id) return prev;

      const map = new Map(prev.map((r) => [r.session_id, r]));
      const merged = { ...(map.get(s.session_id) || {}), ...s };
      map.set(s.session_id, merged);

      // trả về mảng: session vừa có activity lên đầu
      const rest = Array.from(map.values()).filter(
        (r) => r.session_id !== s.session_id
      );
      return [merged, ...rest];
    });
  }

  // ✅ load initial
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await sb
        .from("support_messages")
        .select("session_id, user_id, created_at")
        .not("session_id", "is", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }
      if (!cancelled && data) {
        const unique = Array.from(
          new Map<string, SessionRow>(
            data.map((d) => [d.session_id!, d as SessionRow])
          ).values()
        );
        setSessions(unique);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sb]);

  // ✅ subscribe realtime: khi có INSERT -> cập nhật list
  useEffect(() => {
    const channel = sb
      .channel("support_messages_admin")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
        },
        (payload) => {
          const d = payload.new as SessionRow;
          if (!d?.session_id) return;
          // Đưa session lên đầu (nếu mới thì thêm)
          upsertAndBumpTop({
            session_id: d.session_id,
            user_id: d.user_id ?? null,
            created_at: d.created_at,
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // console.log("✅ Realtime subscribed support_messages");
        }
      });

    return () => {
      sb.removeChannel(channel);
    };
  }, [sb]);

  return (
    <div className="flex h-[75vh] mt-8 max-w-7xl mx-auto px-4 border rounded-lg overflow-hidden shadow-lg bg-white">
      {/* === Cột trái: danh sách user === */}
      <div className="w-1/3 border-r bg-gray-50">
        <SupportUserList
          sessions={sessions}
          selectedSession={selectedSession}
          onSelect={setSelectedSession}
        />
      </div>

      {/* === Cột phải: khung chat === */}
      <div className="flex-1">
        {selectedSession ? (
          <SupportChatPanel sessionId={selectedSession} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            👈 Chọn 1 người dùng để bắt đầu chat
          </div>
        )}
      </div>
    </div>
  );
}
