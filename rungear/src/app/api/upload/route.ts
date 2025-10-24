import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function POST(req: Request) {
  try {
    const sb = await supabaseServer();

    // Lấy user từ session cookie (server-side)
    const {
      data: { user },
    } = await sb.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Kiểm tra role trong bảng profiles
    const { data: profile, error: profileErr } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr) {
      console.error("profile fetch error:", profileErr);
    }

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse multipart/form-data
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folder = (form.get("folder") as string) || "products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `${folder}/${filename}`;

    const { error: uploadError } = await sb.storage
      .from("product-images")
      .upload(path, buffer, {
        contentType: file.type || `image/${ext}`,
        upsert: false,
      });

    if (uploadError) {
      console.error("storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed", details: uploadError },
        { status: 500 }
      );
    }

    const { data: pubData } = sb.storage
      .from("product-images")
      .getPublicUrl(path);
    const publicUrl = (pubData as any)?.publicUrl ?? "";

    return NextResponse.json({ path, publicUrl });
  } catch (err) {
    console.error("upload route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
