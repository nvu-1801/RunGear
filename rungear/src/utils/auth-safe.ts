// utils/auth-safe.ts
export function isTransientNetworkError(e: unknown) {
  const msg = String((e as { message?: unknown })?.message ?? e ?? "");
  const name = (e as { name?: unknown })?.name;
  return (
    (typeof name === "string" && name === "TypeError") || // fetch lỗi
    msg.includes("Failed to fetch") ||
    msg.includes("ERR_NETWORK_CHANGED") ||
    msg.includes("NetworkError") ||
    msg.includes("load resource")
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type SupabaseLike = {
  auth: {
    getUser: () => Promise<{ data: { user?: unknown } }>;
  };
};

export async function safeGetUser(
  sb: unknown,
  retries = 2
): Promise<unknown | null> {
  const client = sb as SupabaseLike;
  for (let i = 0; i <= retries; i++) {
    try {
      const {
        data: { user },
      } = await client.auth.getUser();
      return user ?? null;
    } catch (e: unknown) {
      if (i === retries || !isTransientNetworkError(e)) return null; // don't throw further
      await sleep(400 * (i + 1)); // backoff
    }
  }
  return null;
}
