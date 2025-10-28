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

export async function GET(req: Request) {
  try {
    const sb = await supabaseServer();
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "products";
    const limit = parseInt(searchParams.get("limit") || "100");
    const includeExternal = searchParams.get("includeExternal") === "true";

    // 1. List files trong bucket
    const { data: files, error: listError } = await sb.storage
      .from("product-images")
      .list(folder, {
        limit,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      console.error("storage list error:", listError);
      return NextResponse.json(
        { error: "Failed to list files", details: listError },
        { status: 500 }
      );
    }

    // 2. Tạo public URLs cho files trong bucket
    const filesWithUrls = (files || []).map((file) => {
      const path = `${folder}/${file.name}`;
      const { data: pubData } = sb.storage
        .from("product-images")
        .getPublicUrl(path);
      return {
        name: file.name,
        path,
        publicUrl: (pubData as any)?.publicUrl ?? "",
        createdAt: file.created_at,
        size: file.metadata?.size ?? 0,
        source: "bucket" as const,
      };
    });

    // 3. (Optional) Lấy external URLs từ DB nếu được yêu cầu
    let externalImages: any[] = [];
    if (includeExternal) {
      const { data: products } = await sb
        .from("products")
        .select("id, name, images")
        .not("images", "is", null);

      externalImages = (products || [])
        .flatMap((p) => {
          const imgs = Array.isArray(p.images) ? p.images : [p.images];
          return imgs.filter((img: string) => /^https?:\/\//i.test(img));
        })
        .map((url: string, idx: number) => ({
          name: `external-${idx}`,
          path: url,
          publicUrl: url,
          createdAt: new Date().toISOString(),
          size: 0,
          source: "external" as const,
        }));
    }

    const allFiles = [...filesWithUrls, ...externalImages];

    return NextResponse.json({
      files: allFiles,
      count: allFiles.length,
      bucketCount: filesWithUrls.length,
      externalCount: externalImages.length,
    });
  } catch (err) {
    console.error("upload GET route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
