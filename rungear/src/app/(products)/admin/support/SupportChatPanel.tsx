"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "../../../../libs/db/supabase/supabase-client";

type Message = {
  id: string;
  session_id: string;
  role: "admin" | "user" | string;
  text: string;
  created_at: string;
};

export default function SupportChatPanel({ sessionId }: { sessionId: string }) {
  const sb = supabaseBrowser();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  // Flags để kiểm soát auto-scroll
  const loadedOnceRef = useRef(false);           // ✅ Đánh dấu đã load lần đầu
  const requestScrollRef = useRef(false);        // ✅ Chỉ cuộn khi có tin mới realtime / mình gửi
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);      // ✅ Optional: chỉ cuộn nếu đang gần đáy

  // (Optional) theo dõi vị trí cuộn để quyết định có nên auto-scroll nữa không
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 64; // px: coi như "đang ở đáy" nếu cách đáy <= 64px
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom <= threshold;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Load initial & subscribe realtime theo sessionId
  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data, error } = await sb
        .from("support_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!mounted) return;
      setMsgs((data as Message[]) || []);
      loadedOnceRef.current = true;   // ✅ Đánh dấu là load đầu xong
      requestScrollRef.current = false; // ❌ Không auto scroll ở lần load đầu
    }
    load();

    const channel = sb
      .channel(`support:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setMsgs((m) => [...m, payload.new as Message]);
          // ✅ Đây là tin nhắn mới realtime → yêu cầu auto-scroll
          requestScrollRef.current = true;
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      void sb.removeChannel(channel);
    };
  }, [sessionId, sb]);

  // ✅ Thực thi cuộn: chỉ khi có requestScrollRef và (optional) đang gần đáy
  useEffect(() => {
    if (!loadedOnceRef.current) return; // chưa load xong lần đầu thì thôi
    if (!requestScrollRef.current) return;

    // Optional: nếu muốn chỉ cuộn khi đang gần đáy
    if (!shouldAutoScrollRef.current) {
      // đang xem lịch sử phía trên → không cưỡng ép cuộn
      requestScrollRef.current = false;
      return;
    }

    endRef.current?.scrollIntoView({ behavior: "smooth" });
    requestScrollRef.current = false; // reset
  }, [msgs]);

  async function send() {
    const text = input.trim();
    if (!text) return;

    // ✅ Gửi xong thì yêu cầu auto-scroll (đưa xuống đáy để thấy tin mình)
    requestScrollRef.current = true;

    await sb
      .from("support_messages")
      .insert({ session_id: sessionId, role: "admin", text });

    setInput("");
  }

  const pretty = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const bgPattern =
    "bg-[radial-gradient(1200px_600px_at_100%_-10%,rgba(99,102,241,0.08),transparent),radial-gradient(1200px_600px_at_0%_110%,rgba(244,114,182,0.08),transparent)]";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-white/70 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center shadow">
            🔧
          </span>
          <div className="leading-tight">
            <div className="font-semibold text-gray-800">Admin Support</div>
            <div className="text-[11px] text-emerald-600 font-medium">● Đang hoạt động</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">#{sessionId.slice(0, 8)}…</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollerRef}
        className={`flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 ${bgPattern}`}
      >
        {msgs.map((m) => {
          const isAdmin = m.role === "admin";
          return (
            <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] sm:max-w-[70%]`}>
                <div
                  className={[
                    "px-4 py-2.5 rounded-2xl shadow-sm",
                    isAdmin
                      ? "bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-md",
                  ].join(" ")}
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                    {m.text}
                  </div>
                </div>
                <div className={`mt-1 text-[10px] ${isAdmin ? "text-white/80" : "text-gray-400"}`}>
                  {isAdmin ? "Bạn" : "Khách"} • {pretty(m.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="h-9 w-9 rounded-lg border border-gray-200 grid place-items-center hover:shadow-sm hover:bg-gray-50"
            title="Chèn emoji (demo)"
          >
            😊
          </button>
          <button
            type="button"
            className="h-9 w-9 rounded-lg border border-gray-200 grid place-items-center hover:shadow-sm hover:bg-gray-50"
            title="Đính kèm (demo)"
          >
            📎
          </button>

          <textarea
            rows={1}
            placeholder="Nhập tin nhắn…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm
                       focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400 bg-white/80"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="px-4 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600
                       text-white font-medium shadow hover:opacity-95 disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
