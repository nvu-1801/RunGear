"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import SupportUserList from "@/components/support/SupportUserList";
import SupportChatPanel from "@/components/support/SupportChatPanel";
import { useAdminGuard } from "@/hooks/useAdminGuard";

type SessionRow = {
  session_id: string;
  user_id: string | null;
  created_at?: string;
};

export default function AdminSupportPage() {
  const sb = supabaseBrowser();

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const {
    ready: adminReady,
    user: adminUser,
    error: adminError,
  } = useAdminGuard({
    supabaseClient: sb,
    redirectTo: "/auth/sign-in",
    next: "/admin/support",
    onFail: (err) => console.error("Admin guard failed:", err?.code ?? err),
  });

  // debug ready state (use admin* names)
  useEffect(() => {
    console.debug("[AdminSupportPage] admin guard:", {
      adminReady,
      adminError,
      adminUser,
    });
  }, [adminReady, adminError, adminUser]);

  function upsertAndBumpTop(s: SessionRow) {
    setSessions((prev) => {
      if (!s.session_id) return prev;
      const map = new Map(prev.map((r) => [r.session_id, r]));
      const merged = { ...(map.get(s.session_id) || {}), ...s };
      map.set(s.session_id, merged);
      const rest = Array.from(map.values()).filter(
        (r) => r.session_id !== s.session_id
      );
      return [merged, ...rest];
    });
  }

  useEffect(() => {
    if (!adminReady) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await sb
        .from("support_messages")
        .select("session_id, user_id, created_at")
        .not("session_id", "is", null)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("load sessions error:", error);
      } else if (data) {
        const unique = Array.from(
          new Map<string, SessionRow>(
            (data as SessionRow[]).map((d) => [d.session_id, d])
          ).values()
        );
        setSessions(unique);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adminReady, sb]);

  useEffect(() => {
    if (!adminReady) return;

    const channel = sb
      .channel("support_messages_admin")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload) => {
          const newData: unknown = payload.new;

          // Type guard for newData
          if (
            !newData ||
            typeof newData !== "object" ||
            !("session_id" in newData) ||
            typeof newData.session_id !== "string"
          ) {
            return;
          }

          const sessionData = newData as {
            session_id: string;
            user_id?: string | null;
            created_at?: string;
          };

          upsertAndBumpTop({
            session_id: sessionData.session_id,
            user_id: sessionData.user_id ?? null,
            created_at: sessionData.created_at,
          });
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [adminReady, sb]);

  useEffect(() => {
    if (!selectedSession && sessions.length > 0) {
      setSelectedSession(sessions[0].session_id);
    }
  }, [sessions, selectedSession]);

  return (
    <div className="flex h-[75vh] mt-8 max-w-7xl mx-auto px-4 border rounded-lg overflow-hidden shadow-lg bg-white min-h-0">
      <div className="w-1/3 border-r bg-gray-50">
        {adminReady && !adminError ? (
          <SupportUserList
            sessions={sessions}
            selectedSession={selectedSession}
            onSelect={setSelectedSession}
          />
        ) : (
          <div className="h-full grid place-items-center text-sm text-gray-500 p-4">
            {!adminReady
              ? "Đang kiểm tra quyền admin…"
              : "Không có quyền truy cập trang admin."}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {!adminReady ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            Đang kiểm tra quyền admin…
          </div>
        ) : adminError ? (
          <div className="h-full flex items-center justify-center text-red-600 text-sm">
            Không có quyền truy cập trang admin.
          </div>
        ) : selectedSession ? (
          <SupportChatPanel key={selectedSession} sessionId={selectedSession} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            👈 Chọn 1 người dùng để bắt đầu chat
          </div>
        )}
      </div>
    </div>
  );
}
