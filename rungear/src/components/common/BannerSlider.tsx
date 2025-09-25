"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

type Props = { images: string[] };

export default function BannerSlider({ images }: Props) {
  return (
    <div className="mb-10 relative">
      {/* Nút prev/next đặt TRƯỚC để Swiper có thể query DOM theo class */}
      <button
        aria-label="Previous"
        className="banner-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 
                   bg-white/80 hover:bg-white rounded-full p-2 shadow-lg
                   transition-all duration-200 hover:scale-110 hover:shadow-xl
                   focus:outline-none focus:ring-2 focus:ring-black/30
                   pointer-events-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-800"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        aria-label="Next"
        className="banner-next absolute right-3 top-1/2 -translate-y-1/2 z-10 
                   bg-white/80 hover:bg-white rounded-full p-2 shadow-lg
                   transition-all duration-200 hover:scale-110 hover:shadow-xl
                   focus:outline-none focus:ring-2 focus:ring-black/30
                   pointer-events-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-800"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        loop={images.length > 1}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        navigation={{
          prevEl: ".banner-prev",
          nextEl: ".banner-next",
        }}
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <img
              src={src}
              alt={`Banner ${i + 1}`}
              className="w-full h-64 md:h-96 object-cover rounded-2xl select-none"
              loading="eager"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
