// app/api/ai/rate/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { messageId, rating, text, userId } = await req.json();
    if (!messageId || !rating || !text) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }
    if (rating !== "up" && rating !== "down") {
      return new Response(JSON.stringify({ error: "Invalid rating" }), { status: 400 });
    }

    const { error } = await supabaseAdmin.from("ai_message_ratings").insert({
      message_local_id: messageId,
      rating,
      text,
      user_id: userId ?? null,
    });

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "rate error" }), { status: 500 });
  }
}
