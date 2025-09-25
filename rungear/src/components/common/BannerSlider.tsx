"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Props = { images: string[] };

export default function BannerSlider({ images }: Props) {
  return (
    <div className="mb-10 relative">
      {/* Overlay hai bên */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white/80 to-transparent rounded-2xl z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white/80 to-transparent rounded-2xl z-10" />

      {/* Nút prev/next */}
      <button
        aria-label="Previous"
        className="banner-prev absolute left-6 top-1/2 -translate-y-1/2 z-20
                   bg-white/90 hover:bg-blue-600 hover:text-white text-gray-800
                   rounded-full p-3 shadow-xl border border-gray-200
                   transition-all duration-200 hover:scale-110 hover:shadow-2xl
                   focus:outline-none focus:ring-2 focus:ring-blue-300
                   pointer-events-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        aria-label="Next"
        className="banner-next absolute right-6 top-1/2 -translate-y-1/2 z-20
                   bg-white/90 hover:bg-blue-600 hover:text-white text-gray-800
                   rounded-full p-3 shadow-xl border border-gray-200
                   transition-all duration-200 hover:scale-110 hover:shadow-2xl
                   focus:outline-none focus:ring-2 focus:ring-blue-300
                   pointer-events-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        loop={images.length > 1}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        navigation={{
          prevEl: ".banner-prev",
          nextEl: ".banner-next",
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-gray-300",
          bulletActiveClass: "!bg-blue-600",
        }}
        className="rounded-2xl"
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <img
              src={src}
              alt={`Banner ${i + 1}`}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl border border-gray-200 select-none"
              loading="eager"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
