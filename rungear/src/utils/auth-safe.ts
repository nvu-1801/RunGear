// utils/auth-safe.ts
export function isTransientNetworkError(e: any) {
  const msg = String(e?.message ?? e ?? "");
  return (
    e?.name === "TypeError" ||                 // fetch lỗi
    msg.includes("Failed to fetch") ||
    msg.includes("ERR_NETWORK_CHANGED") ||
    msg.includes("NetworkError") ||
    msg.includes("load resource")
  );
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function safeGetUser(sb: ReturnType<typeof import("@/libs/db/supabase/supabase-client").supabaseBrowser>, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      return user ?? null;
    } catch (e) {
      if (i === retries || !isTransientNetworkError(e)) return null; // đừng quăng lỗi nữa
      await sleep(400 * (i + 1)); // backoff nhẹ
    }
  }
  return null;
}
