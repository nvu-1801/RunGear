import Link from "next/link";

export function BlogSection() {
  return (
    <section className="mt-12">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4">
        Góc tư vấn • Chạy khỏe & mặc đẹp
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            href: "/blog/tips-chon-giay-chay",
            title: "5 tips chọn giày chạy bộ cho người mới",
            desc: "Đệm, độ rơi gót–mũi (heel-to-toe drop), độ ôm…",
            img: "https://antien.vn/files/uploads/kailas/do-on-dinh-cua-giay-chay-trail.png",
          },
          {
            href: "/blog/chon-size-giay",
            title: "Bảng size & cách đo bàn chân chuẩn",
            desc: "Đo chiều dài, chiều rộng, phòng nở chân khi chạy…",
            img: "https://images.pexels.com/photos/8770394/pexels-photo-8770394.jpeg",
          },
          {
            href: "/blog/phoi-outfit-chay",
            title: "Phối outfit: Áo – quần – giày “ăn” màu",
            desc: "3 công thức phối màu nhìn gọn mắt, lên ảnh đẹp…",
            img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
          },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={a.img}
                alt={a.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                {a.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {a.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
