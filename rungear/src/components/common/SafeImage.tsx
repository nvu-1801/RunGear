"use client";
import { useState } from "react";

export default function SafeImage({
  src,
  alt,
  className,
  fallback = "https://picsum.photos/seed/fallback/800/1000",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: string;
}) {
  const [url, setUrl] = useState(src || fallback);
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setUrl(fallback)}
    />
  );
}
