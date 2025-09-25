export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & giới thiệu */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              RunGear
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-lg bg-blue-600 text-xs font-semibold text-white">
              Official
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed">
            Cửa hàng thể thao chuyên cung cấp giày chạy bộ, quần áo và phụ kiện
            chính hãng.
            <br />
            <span className="text-blue-400 font-medium">
              Đồng hành cùng bạn trên mọi chặng đường.
            </span>
          </p>
        </div>

        {/* Menu nhanh */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Sản phẩm
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/home?cat=giay"
                className="hover:text-blue-400 transition"
              >
                Giày
              </a>
            </li>
            <li>
              <a
                href="/home?cat=quan-ao"
                className="hover:text-blue-400 transition"
              >
                Quần áo
              </a>
            </li>
            <li>
              <a href="/home" className="hover:text-blue-400 transition">
                Phụ kiện
              </a>
            </li>
          </ul>
        </div>

        {/* Chính sách */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Chính sách
          </h3>
          <ul className="space-y-2">
            <li>
              <a href="/shipping" className="hover:text-blue-400 transition">
                Giao hàng
              </a>
            </li>
            <li>
              <a href="/returns" className="hover:text-blue-400 transition">
                Đổi trả
              </a>
            </li>
            <li>
              <a href="/faq" className="hover:text-blue-400 transition">
                Hỏi đáp
              </a>
            </li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Liên hệ
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              Email:{" "}
              <a
                href="mailto:support@rungear.vn"
                className="hover:text-blue-400 transition"
              >
                support@rungear.vn
              </a>
            </li>
            <li>
              Hotline:{" "}
              <a
                href="tel:0123456789"
                className="hover:text-blue-400 transition"
              >
                0123 456 789
              </a>
            </li>
            <li>Địa chỉ: 123 Nguyễn Huệ, Quy Nhơn</li>
          </ul>
          <div className="flex space-x-3 mt-5">
            <a href="#" aria-label="Facebook" className="group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 group-hover:bg-blue-600 transition">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2c0-2 1.2-3 3-3 .9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.6l-.4 3h-2.2v7A10 10 0 0022 12z" />
                </svg>
              </span>
            </a>
            <a href="#" aria-label="Instagram" className="group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 group-hover:bg-pink-500 transition">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.8-.9a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
                </svg>
              </span>
            </a>
            <a href="#" aria-label="TikTok" className="group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 group-hover:bg-gray-100 group-hover:text-black transition">
                <svg
                  className="w-5 h-5 text-white group-hover:text-black"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 8.1a4.9 4.9 0 01-1-.1V14a5 5 0 11-5-5v2.1a3 3 0 103 3V3h3a5 5 0 002 4z" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-white">RunGear</span>. All rights
        reserved.
      </div>
    </footer>
  );
}
