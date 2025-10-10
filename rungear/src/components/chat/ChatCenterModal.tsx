"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import RunGearAIChat from "./RunGearAIChat";
import SupportChat from "./SupportChat";

function HeaderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2l1.9 5.7H20l-4.6 3.4L17.4 17 12 13.9 6.6 17l2-5.9L4 7.7h6.1L12 2z" fill="currentColor"/>
    </svg>
  );
}

export default function ChatCenterModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"ai" | "support">("ai");

  useEffect(() => {
    if (!open) return;
    // reset tab nếu muốn mỗi lần mở
    setTab("ai");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] p-4 sm:p-6 md:p-10" role="dialog" aria-modal="true">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* card */}
      <div
        className="relative mx-auto h-[85vh] max-h-[900px] w-full max-w-[1000px] transition-all duration-300 ease-out
                   data-[state=open]:opacity-100 data-[state=open]:scale-100 opacity-0 scale-95"
        data-state="open"
      >
        {/* animated gradient */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/30 via-pink-400/20 to-emerald-400/30 animate-[gradientShift_10s_ease_infinite]" />
        <div className="relative h-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
          {/* Header */}
          <div className="border-b bg-white/70 backdrop-blur-sm px-5 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center shadow">
                <HeaderIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold leading-tight">Chat Center</div>
                <div className="text-xs text-gray-500">RunGear AI • Hỗ trợ khách hàng</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/faq" className="hidden sm:inline-block text-[13px] px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                FAQ
              </Link>
              <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100" aria-label="Close">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 sm:px-5 pt-3 bg-white/60">
            <div className="flex gap-2">
              <button
                onClick={() => setTab("ai")}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  tab === "ai" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white hover:bg-gray-50"
                }`}
              >
                RunGear AI
              </button>
              <button
                onClick={() => setTab("support")}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  tab === "support" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white hover:bg-gray-50"
                }`}
              >
                Hỗ trợ khách hàng
              </button>
            </div>
          </div>

          {/* Body (mount theo tab) */}
          <div className="h-[calc(100%-60px-48px)] bg-gradient-to-b from-white to-gray-50">
            {tab === "ai" ? <RunGearAIChat /> : <SupportChat />}
          </div>
        </div>
      </div>
    </div>
  );
}
