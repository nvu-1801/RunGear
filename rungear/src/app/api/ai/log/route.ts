// app/api/ai/log/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // chỉ dùng trên server!
);

export async function POST(req: NextRequest) {
  try {
    const { sessionId, role, text, meta, userId } = await req.json();
    if (!role || !text) {
      return new Response(JSON.stringify({ error: "Missing role/text" }), { status: 400 });
    }

    const { error } = await supabaseAdmin.from("ai_chat_logs").insert({
      user_id: userId ?? null,  // có thể map từ supabase auth nếu muốn
      session_id: sessionId ?? null,
      role,
      text,
      meta: meta ?? null,
    });

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "log error" }), { status: 500 });
  }
}
