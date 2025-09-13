import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => (cookieStore as any).set({ name: n, value: v, ...o }),
        remove: (n, o) => (cookieStore as any).set({ name: n, value: "", ...o, maxAge: 0 }),
      },
    }
  );

  await sb.auth.signOut();
  return NextResponse.json({ ok: true });
}
