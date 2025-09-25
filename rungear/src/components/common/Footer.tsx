export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & giới thiệu */}
        <div>
          <h2 className="text-xl font-bold text-white">RunGear</h2>
          <p className="mt-3 text-sm text-gray-400">
            Cửa hàng thể thao chuyên cung cấp giày chạy bộ, quần áo và phụ kiện
            chính hãng. Đồng hành cùng bạn trên mọi chặng đường.
          </p>
        </div>

        {/* Menu nhanh */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Sản phẩm
          </h3>
          <ul className="mt-4 space-y-2">
            <li><a href="/home?cat=giay" className="hover:text-white">Giày</a></li>
            <li><a href="/home?cat=quan-ao" className="hover:text-white">Quần áo</a></li>
            <li><a href="/home" className="hover:text-white">Phụ kiện</a></li>
          </ul>
        </div>

        {/* Chính sách */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Chính sách
          </h3>
          <ul className="mt-4 space-y-2">
            <li><a href="/shipping" className="hover:text-white">Giao hàng</a></li>
            <li><a href="/returns" className="hover:text-white">Đổi trả</a></li>
            <li><a href="/faq" className="hover:text-white">Hỏi đáp</a></li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Liên hệ
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Email: <a href="mailto:support@rungear.vn" className="hover:text-white">support@rungear.vn</a></li>
            <li>Hotline: <a href="tel:0123456789" className="hover:text-white">0123 456 789</a></li>
            <li>Địa chỉ: 123 Nguyễn Huệ, Quy Nhơn</li>
          </ul>
          <div className="flex space-x-4 mt-4">
            <a href="#" aria-label="Facebook" className="hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2c0-2 1.2-3 3-3 .9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.6l-.4 3h-2.2v7A10 10 0 0022 12z" /></svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.8-.9a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" /></svg>
            </a>
            <a href="#" aria-label="TikTok" className="hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8.1a4.9 4.9 0 01-1-.1V14a5 5 0 11-5-5v2.1a3 3 0 103 3V3h3a5 5 0 002 4z" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} RunGear. All rights reserved.
      </div>
    </footer>
  );
}
