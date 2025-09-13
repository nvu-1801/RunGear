import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function supabaseServer() {
  // Next 15: cookies() -> Promise<ReadonlyRequestCookies>
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Trong Server Component, cookie là readonly -> thử gọi, nếu không được thì bỏ qua
          try {
            (cookieStore as any).set({ name, value, ...options });
          } catch {
            /* no-op in RSC */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            (cookieStore as any).set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            /* no-op in RSC */
          }
        },
      },
    }
  );
}
