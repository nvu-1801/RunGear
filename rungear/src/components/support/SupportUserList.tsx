"use client";
import { useMemo, useState, useEffect } from "react";

type Thread = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  last_message: string | null;
  last_message_at: string;
};

type Props = {
  threads: Thread[];
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
};

const COLORS = [
  "from-indigo-500 to-sky-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-blue-600 to-cyan-500",
  "from-rose-500 to-orange-500",
];

function pickGradient(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++)
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function SupportUserList({
  threads,
  selectedUserId,
  onSelect,
}: Props) {
  const [q, setQ] = useState("");

  // 👀 log mỗi lần threads thay đổi
  useEffect(() => {
    console.log("[SupportUserList] threads prop:", threads);
    if (threads.length > 0) {
      console.log("[SupportUserList] first thread:", threads[0]);
      console.log("[SupportUserList] first thread email:", threads[0].email);
    }
  }, [threads]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    console.log("[SupportUserList] filter keyword:", keyword);

    if (!keyword) {
      console.log("[SupportUserList] filtered = threads (no keyword)");
      return threads;
    }

    const result = threads.filter((t) => {
      const email = t.email ?? "";
      const name = t.full_name ?? "";
      return (
        email.toLowerCase().includes(keyword) ||
        name.toLowerCase().includes(keyword) ||
        t.user_id.toLowerCase().includes(keyword)
      );
    });

    console.log("[SupportUserList] filtered result:", result);
    return result;
  }, [q, threads]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center">
            👥
          </span>
          Danh sách khách hàng
        </div>
        <div className="mt-3 relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo email hoặc tên..."
            className="w-full h-10 rounded-xl border border-gray-300 pl-10 pr-3 text-sm focus:ring-2 focus:ring-indigo-400/60"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔎
          </span>
        </div>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
        {filtered.map((t, idx) => {
          // 👀 log từng item khi render
          console.log("[SupportUserList] render item", idx, t);

          const active = selectedUserId === t.user_id;
          const email = t.email ?? "khách";
          const grad = pickGradient(t.user_id);
          const initials = (email || "G").slice(0, 1).toUpperCase();

          return (
            <li
              key={t.user_id}
              onClick={() => {
                console.log("[SupportUserList] click user:", t.user_id);
                onSelect(t.user_id);
              }}
              className={`group px-4 py-3 cursor-pointer transition ${
                active ? "bg-indigo-50/80" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={`h-10 w-10 rounded-xl text-white grid place-items-center bg-gradient-to-br ${grad} shadow-sm`}
                >
                  <span className="text-sm font-bold">{initials}</span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-800 truncate text-sm">
                    {email}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {t.last_message || "Chưa có tin nhắn"}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(t.last_message_at).toLocaleString("vi-VN")}
                  </div>
                </div>

                {/* Chevron */}
                <div className="opacity-0 group-hover:opacity-100 transition text-gray-400">
                  ›
                </div>
              </div>
            </li>
          );
        })}

        {filtered.length === 0 && (
          <li className="p-6 text-gray-400 text-sm italic">
            Không tìm thấy khách hàng phù hợp…
          </li>
        )}

        {threads.length === 0 && (
          <li className="p-6 text-gray-400 text-sm italic">
            Chưa có khách hàng nào chat
          </li>
        )}
      </ul>
    </div>
  );
}
