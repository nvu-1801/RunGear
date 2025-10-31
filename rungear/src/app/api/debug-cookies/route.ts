import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const all = cookieStore.getAll(); // Lấy toàn bộ cookie
  return NextResponse.json({
    cookies: all.map((c) => ({
      name: c.name,
      valuePreview: c.value.slice(0, 10) + "...", // chỉ in preview
    })),
  });
}
