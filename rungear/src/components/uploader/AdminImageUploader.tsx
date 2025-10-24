// src/components/uploader/AdminImageUploader.tsx
"use client";

import { useState, useEffect } from "react";

export default function AdminImageUploader({
  folder = "products",
  onUploaded,
  onPreview,
}: {
  folder?: string;
  onUploaded?: (file: { path: string; publicUrl: string }) => void;
  onPreview?: (previewUrl: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/check", { credentials: "include" });
        if (!res.ok) {
          setIsAdmin(false);
          return;
        }
        const data = (await res.json()) as {
          user?: { role?: string | null } | null;
        };
        setIsAdmin(data?.user?.role === "admin");
      } catch (e) {
        console.error("auth check failed:", e);
        setIsAdmin(false);
      }
    })();
  }, []);

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (isAdmin === false) {
      setError("Bạn không có quyền upload.");
      return;
    }
    if (isAdmin === null) {
      setError("Đang kiểm tra quyền, thử lại sau.");
      return;
    }

    // preview local
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") onPreview?.(result);
      };
      reader.readAsDataURL(f);
    } catch {}

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append("file", f);
      form.append("folder", folder);

      const r = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const j = await r.json();

      if (!r.ok) {
        throw new Error(j?.error ?? "Upload failed");
      }

      onUploaded?.({ path: j.path, publicUrl: j.publicUrl ?? "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("upload error:", err);
    } finally {
      setLoading(false);
      try {
        const input = document.getElementById(
          "image-upload"
        ) as HTMLInputElement | null;
        if (input) input.value = "";
      } catch {}
    }
  }

  if (isAdmin === null) {
    return (
      <div className="text-sm text-gray-500">Đang kiểm tra quyền admin...</div>
    );
  }
  if (isAdmin === false) {
    return (
      <div className="text-sm text-orange-600">
        Không có quyền upload (admin required).
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="image-upload" className="cursor-pointer">
        {loading ? "Đang upload..." : "Chọn ảnh"}
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={onSelect}
        className="hidden"
      />
      {success && <div className="text-green-600">Upload thành công</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
