"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../libs/db/supabase/supabase-client";
import SupportUserList from "../../../../components/support/SupportUserList";
import SupportChatPanel from "../../../../components/support/SupportChatPanel";

type SessionRow = { session_id: string; user_id: string | null; created_at?: string };

export default function AdminSupportPage() {
  const sb = supabaseBrowser();
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [ready, setReady] = useState(false); // ✅ chỉ cho phép query/subscribe khi đã xác thực admin

  // ✅ ensureAdmin: KHÔNG anonymous trên trang admin
  async function ensureAdminAuth() {
    // gọi getSession để đảm bảo token đã refresh nếu cần
    await sb.auth.getSession();

    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("NOT_AUTHENTICATED");

    const { data: prof, error } = await sb
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    if (!prof?.is_admin) throw new Error("NOT_ADMIN");

    return user;
  }

  // ✅ chạy 1 lần: xác thực admin
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ensureAdminAuth();
        if (mounted) setReady(true);
      } catch (e) {
        console.error("Admin auth failed:", e);
        // điều hướng tuỳ ý
        router.replace("/auth/login?next=/admin/support");
      }
    })();
    return () => { mounted = false; };
  }, [router, sb]);

  // ✅ gom unique và đẩy session mới lên đầu
  function upsertAndBumpTop(s: SessionRow) {
    setSessions(prev => {
      if (!s.session_id) return prev;
      const map = new Map(prev.map(r => [r.session_id, r]));
      const merged = { ...(map.get(s.session_id) || {}), ...s };
      map.set(s.session_id, merged);
      const rest = Array.from(map.values()).filter(r => r.session_id !== s.session_id);
      return [merged, ...rest];
    });
  }

  // ✅ load initial (chỉ chạy khi ready)
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await sb
        .from("support_messages")
        .select("session_id, user_id, created_at")
        .not("session_id", "is", null)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (error) console.error(error);
        else if (data) {
          const unique = Array.from(
            new Map<string, SessionRow>(data.map(d => [d.session_id!, d as SessionRow])).values()
          );
          setSessions(unique);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [ready, sb]);

  // ✅ subscribe realtime (chỉ chạy khi ready)
  useEffect(() => {
    if (!ready) return;
    const channel = sb
      .channel("support_messages_admin")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload) => {
          const d = payload.new as SessionRow;
          if (!d?.session_id) return;
          upsertAndBumpTop({ session_id: d.session_id, user_id: d.user_id ?? null, created_at: d.created_at });
        }
      ).subscribe();

    return () => { sb.removeChannel(channel); };
  }, [ready, sb]);

  return (
    <div className="flex h-[75vh] mt-8 max-w-7xl mx-auto px-4 border rounded-lg overflow-hidden shadow-lg bg-white min-h-0">
      <div className="w-1/3 border-r bg-gray-50">
        <SupportUserList sessions={sessions} selectedSession={selectedSession} onSelect={setSelectedSession} />
      </div>
      <div className="flex-1 min-h-0">
        {selectedSession ? (
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
