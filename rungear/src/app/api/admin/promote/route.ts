// app/api/admin/promote/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const secret = req.headers.get("x-admin-secret");

  if (secret !== process.env.ADMIN_INTERNAL_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { user_id?: string };
  if (!body.user_id) {
    return NextResponse.json({ ok: false, error: "Missing user_id" }, { status: 400 });
  }

  const supaAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supaAdmin.auth.admin.updateUserById(body.user_id, {
    app_metadata: { role: "admin" },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data });
}
