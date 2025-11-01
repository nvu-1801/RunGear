import React from "react";

export type StorageFileItem = {
  name: string;
  path: string;
  publicUrl: string;
  createdAt?: string;
  size: number;
};

type Props = {
  open: boolean;
  images: StorageFileItem[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

export default function GalleryModal({
  open,
  images,
  loading,
  error,
  onClose,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Image Gallery</h2>
            <p className="text-sm text-gray-500 mt-1">
              {images.length} images in storage • Click to copy URL
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              Loading…
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No images in storage yet. Upload some images first!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img) => (
                <div
                  key={img.path}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition cursor-pointer"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(img.publicUrl);
                      alert("✓ URL copied to clipboard!");
                    } catch {
                      prompt("Copy this URL:", img.publicUrl);
                    }
                  }}
                >
                  <img
                    src={img.publicUrl}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                    <button className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm font-medium">
                      📋 Copy URL
                    </button>
                    <a
                      href={img.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium"
                    >
                      🔗 Open
                    </a>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                    <p className="text-white text-xs truncate">{img.name}</p>
                    <p className="text-white/70 text-[10px]">
                      {(img.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
