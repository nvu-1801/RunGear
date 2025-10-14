"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Props = {
  images: string[];
  aspect?: string;
  className?: string;
};

export default function BannerSlider({
  images,
  aspect = "16/6",
  className = "",
}: Props) {
  return (
    <div className={className}>
      <div
        style={{ aspectRatio: aspect }}
        className="w-full h-full overflow-hidden rounded-2xl"
      >
        {/* simple slider fallback / static list */}
        <div className="w-full h-full grid grid-flow-col auto-cols-fr gap-2">
          {images.map((src, i) => (
            <div key={i} className="w-full h-full">
              <img
                src={src}
                alt={`slide-${i}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
