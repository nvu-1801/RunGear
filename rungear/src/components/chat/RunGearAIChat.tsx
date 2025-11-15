"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// ✅ THÊM: Helper function format AI response
function formatAIResponse(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    let processedLine = line;
    const boldRegex = /\*\*(.+?)\*\*/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(
        <strong
          key={`bold-${index}-${match.index}`}
          className="font-bold text-gray-900"
        >
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    const formattedParts = parts.map((part, partIndex) => {
      if (typeof part !== "string") return part;

      const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const linkParts: React.ReactNode[] = [];
      let lastLinkIndex = 0;
      let linkMatch;

      while ((linkMatch = markdownLinkRegex.exec(part)) !== null) {
        if (linkMatch.index > lastLinkIndex) {
          linkParts.push(part.substring(lastLinkIndex, linkMatch.index));
        }

        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        const isInternal = linkUrl.startsWith("/");

        linkParts.push(
          isInternal ? (
            <Link
              key={`link-${index}-${partIndex}-${linkMatch.index}`}
              href={linkUrl}
              target="_blank" // ← THÊM: Mở tab mới
              rel="noopener noreferrer" // ← THÊM: Security
              className="text-indigo-600 underline hover:text-indigo-800 font-semibold"
            >
              {linkText}
            </Link>
          ) : (
            <a
              key={`link-${index}-${partIndex}-${linkMatch.index}`}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline hover:text-indigo-800 font-semibold"
            >
              {linkText}
            </a>
          )
        );

        lastLinkIndex = linkMatch.index + linkMatch[0].length;
      }

      if (lastLinkIndex < part.length) {
        linkParts.push(part.substring(lastLinkIndex));
      }

      return linkParts.length > 0 ? linkParts : part;
    });

    if (formattedParts.length > 0) {
      elements.push(
        <p
          key={`line-${index}`}
          className="mb-2 last:mb-0 text-[15px] leading-relaxed text-gray-800"
        >
          {formattedParts}
        </p>
      );
    } else if (line.trim() === "") {
      elements.push(<br key={`br-${index}`} />);
    }
  });

  return <div className="space-y-1">{elements}</div>;
}

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  rating?: "up" | "down" | null;
};

function useChatSession() {
  const sessionRef = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let sid = localStorage.getItem("rg_chat_session");
    if (!sid) {
      sid = (crypto.randomUUID?.() ?? String(Date.now())) + "-sess";
      localStorage.setItem("rg_chat_session", sid);
    }
    sessionRef.current = sid;
  }, []);
  return sessionRef;
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export default function RunGearAIChat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "m0",
      role: "assistant",
      text: "Xin chào! Mình là trợ lý AI của Run Gear. Bạn muốn tìm sản phẩm hay cần trợ giúp thanh toán?",
      rating: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const sessionRef = useChatSession();
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !sending,
    [input, sending]
  );

  const INTENTS = [
    {
      label: "Tìm sản phẩm",
      prompt: "Tìm giúp tôi giày chạy êm chân dưới 1 triệu, size 42.",
    },
    {
      label: "Kiểm tra tồn kho",
      prompt: "Mã RG-TRAIL-01 còn size 42 ở kho không?",
    },
    {
      label: "Voucher/PayOS",
      prompt: "Hướng dẫn thanh toán PayOS và áp dụng voucher 10%.",
    },
  ];
  const useIntent = (p: string) => {
    setInput(p);
    setTimeout(() => onSend(p), 0);
  };

  // ✅ SỬA FUNCTION onSend() - ĐỔI TỪ STREAMING → JSON
  const onSend = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text) return;
    if (!preset) setInput("");

    const userLocalId = crypto.randomUUID?.() ?? String(Date.now());
    setMsgs((m) => [
      ...m,
      { id: userLocalId, role: "user", text, rating: null },
    ]);

    const asstLocalId = crypto.randomUUID?.() ?? String(Date.now() + 1);
    setMsgs((m) => [
      ...m,
      { id: asstLocalId, role: "assistant", text: "", rating: null },
    ]);
    setSending(true);

    const historyForApi = [...msgs, { role: "user" as const, text }].map(
      ({ role, text }) => ({ role, text })
    );

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, history: historyForApi }),
      });

      if (!res.ok) {
        throw new Error(`AI error ${res.status}`);
      }

      // ✅ FIX: Parse JSON response thay vì streaming
      const data = await res.json();

      // ✅ CHỈ LẤY FIELD 'text' TỪ RESPONSE
      const aiText = data.text || "Xin lỗi, không nhận được phản hồi.";

      // Update message với text đã parse
      setMsgs((m) =>
        m.map((msg) =>
          msg.id === asstLocalId ? { ...msg, text: aiText } : msg
        )
      );

      // Log
      try {
        await fetch("/api/ai/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionRef.current ?? null,
            role: "user",
            text,
            meta: { model: data.model || "gemini-1.5-flash" },
          }),
        });
      } catch {}

      try {
        await fetch("/api/ai/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionRef.current ?? null,
            role: "assistant",
            text: aiText,
            meta: { model: data.model || "gemini-1.5-flash" },
          }),
        });
      } catch {}
    } catch (e) {
      setMsgs((m) =>
        m.map((msg) =>
          msg.id === asstLocalId
            ? {
                ...msg,
                text: "Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại.",
              }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return;
      e.preventDefault();
      if (canSend) onSend();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  const rateMessage = async (id: string, rating: "up" | "down") => {
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, rating } : x)));
    try {
      const msg = msgs.find((x) => x.id === id);
      await fetch("/api/ai/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, rating, text: msg?.text ?? "" }),
      });
    } catch {}
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* INTENTS */}
      <div className="px-4 sm:px-5 pt-3 bg-white/60">
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((it) => (
            <button
              key={it.label}
              onClick={() => useIntent(it.prompt)}
              className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50"
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-4 bg-gradient-to-b from-white to-gray-50 min-h-0">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "flex justify-end gap-2"
                : "flex justify-start gap-2"
            }
          >
            {m.role === "assistant" && (
              <div className="mr-1 mt-0.5 h-8 w-8 rounded-full bg-indigo-500 text-white grid place-items-center font-bold text-[11px]">
                AI
              </div>
            )}
            {m.role === "user" && (
              <div className="order-2 ml-1 mt-0.5 h-8 w-8 rounded-full bg-emerald-500 text-white grid place-items-center font-bold text-[11px]">
                You
              </div>
            )}
            <div
              className={
                m.role === "user"
                  ? "max-w-[78%] rounded-2xl rounded-br-sm bg-indigo-600 text-white px-4 py-2 shadow"
                  : "max-w-[78%] rounded-2xl rounded-bl-sm bg-white border px-4 py-2 shadow-sm"
              }
            >
              {/* ✅ SỬA: Render với format function cho assistant */}
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {m.text}
                </p>
              ) : (
                formatAIResponse(m.text)
              )}

              {m.role === "assistant" && (
                <div className="mt-1 flex items-center gap-1 text-gray-400">
                  <button
                    onClick={() => rateMessage(m.id, "up")}
                    className={`h-7 w-7 grid place-items-center rounded hover:bg-gray-100 ${
                      m.rating === "up" ? "text-emerald-600" : ""
                    }`}
                    title="Hữu ích"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => rateMessage(m.id, "down")}
                    className={`h-7 w-7 grid place-items-center rounded hover:bg-gray-100 ${
                      m.rating === "down" ? "text-rose-600" : ""
                    }`}
                    title="Chưa ổn"
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="border-t bg-white/70 backdrop-blur px-4 sm:px-5 py-3"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        }}
      >
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="sr-only" htmlFor="rg-ai-input">
              Nhập câu hỏi
            </label>
            <textarea
              id="rg-ai-input"
              rows={1}
              placeholder="Hỏi AI: Ví dụ Tìm giúp tôi giày chạy êm chân dưới 1 triệu"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full resize-y min-h-[44px] max-h-[160px] rounded-xl border border-gray-300 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="mt-1 text-[11px] text-gray-500">
              Enter = gửi • Shift+Enter = xuống dòng • Ctrl/⌘+Enter = gửi
            </div>
          </div>
          <button
            onClick={() => onSend()}
            disabled={!canSend}
            className="shrink-0 inline-flex mb-6 items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow"
          >
            <SendIcon className="h-5 w-5" />
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
