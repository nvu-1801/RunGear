"use client";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";

type Props = {
  sessions: { session_id: string; user_id: string | null }[];
  selectedSession: string | null;
  onSelect: (sid: string) => void;
};

type UserLite = { email: string | null };

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
  const idx = Math.abs(hash) % COLORS.length;
  return COLORS[idx];
}

// Normalize user_id:
// - accept plain UUID
// - accept "<uuid>-sess" and return uuid
// - accept strings that contain a UUID and return first uuid
function normalizeUserId(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;

  // direct UUID match
  const uuidFull = s.match(
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
  );
  if (uuidFull) return uuidFull[1];

  // uuid with suffix like "-sess"
  const uuidWithSuffix = s.match(
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})[-_].*/i
  );
  if (uuidWithSuffix) return uuidWithSuffix[1];

  // any uuid occurring inside string
  const anyUuid = s.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  );
  if (anyUuid) return anyUuid[1];

  return null;
}

export default function SupportUserList({
  sessions,
  selectedSession,
  onSelect,
}: Props) {
  const sb = supabaseBrowser();
  const [users, setUsers] = useState<Record<string, UserLite | null>>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!sb) return;

        console.debug("[SupportUserList] sessions count:", sessions.length);
        const ids = Array.from(
          new Set(
            sessions
              .map((s) => normalizeUserId(s.user_id)) // <- changed to normalizeUserId
              .filter((id): id is string => Boolean(id))
          )
        );

        console.debug("[SupportUserList] normalized user ids:", ids);

        if (ids.length === 0) return;

        const { data, error } = await sb
          .from("profiles")
          .select("id, email")
          .in("id", ids);

        if (!mounted) return;
        if (error) {
          console.error("load profiles error:", error);
          return;
        }
        if (data) {
          const map: Record<string, UserLite | null> = {};
          for (const row of data as { id: string; email: string | null }[]) {
            map[row.id] = { email: row.email };
          }
          setUsers((prev) => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.error("SupportUserList load profiles failed:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessions, sb]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return sessions;
    return sessions.filter((s) => {
      const norm = normalizeUserId(s.user_id); // <- changed to normalizeUserId
      const email = norm ? users[norm]?.email ?? "" : "";
      const sid = String(s.session_id ?? "");
      return (
        email.toLowerCase().includes(keyword) ||
        sid.toLowerCase().includes(keyword)
      );
    });
  }, [q, sessions, users]);

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
            placeholder="Tìm theo email hoặc session id…"
            className="w-full h-10 rounded-xl border border-gray-300 pl-10 pr-3 text-sm focus:ring-2 focus:ring-indigo-400/60"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔎
          </span>
        </div>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
        {filtered.map((s) => {
          const sid = String(s.session_id ?? "");
          const norm = normalizeUserId(s.user_id);
          const email = norm
            ? users[norm]?.email ?? `Khách vãng lai (${sid.slice(0, 6)}…)`
            : `Khách vãng lai (${sid.slice(0, 6)}…)`;
          const logged = Boolean(norm && users[norm]);
          const active = selectedSession === s.session_id;
          const grad = pickGradient(sid);
          const initials = (email || "G").slice(0, 1).toUpperCase();

          return (
            <li
              key={sid}
              onClick={() => onSelect(sid)}
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

                {/* Texts */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-800 truncate text-sm">
                      {email}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        active
                          ? "bg-indigo-600 text-white"
                          : logged
                          ? "bg-gray-100 text-gray-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {logged ? "Đã đăng nhập" : "Guest"}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {sid}
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

        {sessions.length === 0 && (
          <li className="p-6 text-gray-400 text-sm italic">
            Chưa có khách hàng nào chat
          </li>
        )}
      </ul>
    </div>
  );
}
