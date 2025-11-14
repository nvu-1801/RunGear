"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation"; // 👈 thêm
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import SupportUserList from "@/components/support/SupportUserList";
import SupportChatPanel from "@/components/support/SupportChatPanel";

type Thread = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  last_message: string | null;
  last_message_at: string;
};

export default function AdminSupportPage() {
  const sb = supabaseBrowser();
  const pathname = usePathname(); // 👈 thêm

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadThreads = useCallback(
    async (label: string) => {
      console.log(`🔄 [Admin] Loading threads (${label})...`);

      try {
        const { data, error } = await sb
          .from("support_threads")
          .select("*")
          .order("last_message_at", { ascending: false });

        console.log("👀 [Admin] View support_threads result:", {
          error,
          length: data?.length,
          sample: data?.[0],
        });

        if (error) {
          console.error("❌ [Admin] support_threads error:", error);
          setLoadError(error.message);
          setThreads([]);
          return;
        }

        if (!data || data.length === 0) {
          console.log("ℹ️ [Admin] support_threads: no rows");
          setThreads([]);
          setLoadError(null);
          return;
        }

        setThreads(data as Thread[]);
        setLoadError(null);
      } catch (e) {
        console.error("❌ [Admin] Exception in loadThreads:", e);
        setLoadError(e instanceof Error ? e.message : "Unknown error");
        setThreads([]);
      }
    },
    [sb]
  );

  // 🔹 Mỗi lần vào route này / pathname đổi => reload threads
  useEffect(() => {
    console.log("🚀 [Admin] Enter page / pathname changed:", pathname);
    loadThreads("enter-page");
  }, [loadThreads, pathname]); // 👈 dùng pathname

  // 🔹 Realtime: INSERT vào support_messages => reload
  useEffect(() => {
    console.log("🎧 [Admin] Setting up realtime subscription...");

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
          console.log("📨 [Admin] New message payload:", payload);

          const newData = payload.new as {
            user_id?: string | null;
            text?: string;
          };

          console.log("📝 [Admin] New message details:", newData);

          if (!newData.user_id) {
            console.warn("⚠️ [Admin] New message has no user_id, skip");
            return;
          }

          console.log("🔄 [Admin] Reload threads because of new message");
          loadThreads("realtime");
        }
      )
      .subscribe((status) => {
        console.log("🔌 [Admin] Realtime status:", status);
      });

    return () => {
      console.log("🔌 [Admin] Cleanup realtime channel");
      sb.removeChannel(channel);
    };
  }, [sb, loadThreads]);

  useEffect(() => {
    console.log("📊 [Admin] threads state changed:", threads);
  }, [threads]);

  useEffect(() => {
    if (!selectedUserId && threads.length > 0) {
      console.log("👆 [Admin] Auto-select user:", threads[0].user_id);
      setSelectedUserId(threads[0].user_id);
    } else {
      console.log(
        "ℹ️ [Admin] Auto-select check. selectedUserId =",
        selectedUserId,
        "threads.length =",
        threads.length
      );
    }
  }, [threads, selectedUserId]);

  if (loadError) {
    return (
      <div className="flex h-[75vh] mt-8 max-w-7xl mx-auto px-4 items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <h3 className="text-red-800 font-semibold mb-2">
            ⚠️ Lỗi tải danh sách chat
          </h3>
          <p className="text-red-600 text-sm mb-4 whitespace-pre-wrap">
            {loadError}
          </p>
          <button
            onClick={() => {
              setLoadError(null);
              loadThreads("retry");
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[75vh] mt-8 max-w-7xl mx-auto px-4 border rounded-lg overflow-hidden shadow-lg bg-white min-h-0">
      <div className="w-1/3 border-r bg-gray-50">
        <SupportUserList
          threads={threads}
          selectedUserId={selectedUserId}
          onSelect={(id) => {
            console.log("👉 [Admin] Selected user:", id);
            setSelectedUserId(id);
          }}
        />
      </div>

      <div className="flex-1 min-h-0">
        {selectedUserId ? (
          <SupportChatPanel key={selectedUserId} userId={selectedUserId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            {threads.length === 0 ? (
              <div className="text-center">
                <div className="text-4xl mb-2">💬</div>
                <div>Chưa có tin nhắn nào</div>
              </div>
            ) : (
              <>👈 Chọn người dùng để chat</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
