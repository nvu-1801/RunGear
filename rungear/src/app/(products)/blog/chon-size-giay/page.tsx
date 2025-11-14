// app/blog/chon-size-giay/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Bảng size & cách đo bàn chân chuẩn | Góc tư vấn",
  description:
    "Hướng dẫn đo chiều dài, chiều rộng bàn chân, cách chọn size giày chạy hợp lý và một số lưu ý khi chân bị lệch size.",
};

export default function ChonSizeGiayPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 group"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-medium">Về trang chủ</span>
          </Link>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Góc tư vấn • Chạy khỏe & mặc đẹp
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bảng size & cách đo bàn chân chuẩn
            </h1>

            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Hướng dẫn đo chiều dài, chiều rộng bàn chân và cách chọn size giày
              chạy hợp lý – không còn lo mua online bị chật hoặc rộng.
            </p>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-12 md:h-16 text-gray-50"
            preserveAspectRatio="none"
            viewBox="0 0 1440 54"
            fill="currentColor"
          >
            <path d="M0,32L80,37.3C160,43,320,53,480,53.3C640,53,800,43,960,37.3C1120,32,1280,32,1360,32L1440,32L1440,54L1360,54C1280,54,1120,54,960,54C800,54,640,54,480,54C320,54,160,54,80,54L0,54Z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Section 1 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  1
                </span>
                Chuẩn bị trước khi đo
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: "📄", text: "1 tờ giấy trắng lớn hơn bàn chân" },
                  { icon: "✏️", text: "1 cây bút" },
                  { icon: "📏", text: "1 thước kẻ (cm hoặc mm)" },
                  {
                    icon: "🌙",
                    text: "Đo vào cuối ngày khi chân đã nở to nhất",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <p className="text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  2
                </span>
                Cách đo chiều dài bàn chân
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="space-y-4">
                {[
                  "Đặt tờ giấy sát tường, chân trần hoặc mang tất mỏng lên tờ giấy.",
                  "Gót chân chạm nhẹ vào tường, đứng thẳng tự nhiên.",
                  "Dùng bút đánh dấu điểm ngón chân dài nhất.",
                  "Đo khoảng cách từ mép tường đến điểm vừa đánh dấu – đó là chiều dài bàn chân.",
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 pt-1 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-xl">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-gray-700 leading-relaxed">
                    Lặp lại với chân còn lại, vì{" "}
                    <strong className="text-amber-700">
                      đa số mọi người hai chân không dài bằng nhau
                    </strong>
                    . Hãy dùng{" "}
                    <strong className="text-amber-700">số lớn hơn</strong> để
                    chọn size.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-teal-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  3
                </span>
                Cách đo chiều rộng bàn chân
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                Chiều rộng giúp bạn biết mình thuộc dạng chân{" "}
                <em className="text-teal-600 font-semibold">bình thường</em>,
                <em className="text-teal-600 font-semibold"> bè</em> hay{" "}
                <em className="text-teal-600 font-semibold">thon</em>:
              </p>

              <div className="space-y-4">
                {[
                  "Ngồi trên ghế, đặt chân lên tờ giấy, trọng lực dồn đều hai chân.",
                  "Đánh dấu hai điểm rộng nhất ở hai bên bàn chân (thường là phần ngang khớp ngón cái và ngón út).",
                  "Đo khoảng cách giữa 2 điểm này – đó là chiều rộng bàn chân.",
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 pt-1 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 bg-gradient-to-br from-teal-50 to-cyan-50 border-l-4 border-teal-500 rounded-r-xl">
                <p className="text-gray-700 leading-relaxed">
                  Nếu chiều rộng lớn hơn mặt bằng chung, bạn nên ưu tiên{" "}
                  <strong className="text-teal-700">form rộng (wide)</strong>{" "}
                  hoặc tăng thêm nửa size.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-rose-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-rose-500 to-red-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  4
                </span>
                Cộng "khoảng thở" cho chân khi chạy
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                Khi chạy, bàn chân sẽ{" "}
                <strong className="text-rose-600">nở ra</strong> và trượt nhẹ về
                phía mũi giày. Vì vậy, bạn nên cộng thêm:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border-2 border-rose-200">
                  <div className="text-4xl mb-3">📏</div>
                  <p className="text-gray-700 leading-relaxed">
                    <strong className="text-rose-700 text-lg">0.5–1cm</strong>{" "}
                    so với chiều dài bàn chân đo được
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border-2 border-rose-200">
                  <div className="text-4xl mb-3">🏃</div>
                  <p className="text-gray-700 leading-relaxed">
                    Chạy đường dài (&gt;10km) hoặc hay bị tụ máu móng chân, nên
                    dư gần <strong className="text-rose-700">1cm</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  5
                </span>
                Quy đổi sang size giày
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                Mỗi hãng (Nike, adidas, Asics, v.v.) có bảng quy đổi từ{" "}
                <strong className="text-indigo-600">cm → EU/US/UK</strong> hơi
                khác nhau. Khi mua, bạn nên:
              </p>

              <div className="space-y-3">
                {[
                  {
                    icon: "📊",
                    text: "Xem bảng size theo cm của từng mẫu giày",
                  },
                  {
                    icon: "🎯",
                    text: "Ưu tiên chọn theo cm, không chỉ nhìn EU/US/UK",
                  },
                  {
                    icon: "⬆️",
                    text: "Nếu đang phân vân giữa 2 size, hãy chọn size lớn hơn (dễ xử lý bằng tất dày hoặc chỉnh dây giày)",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <p className="text-gray-700 leading-relaxed pt-1">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-violet-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  6
                </span>
                Một số trường hợp đặc biệt
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    icon: "👣",
                    title: "Hai chân lệch nhau nhiều",
                    desc: "Hãy chọn size theo chân lớn hơn",
                  },
                  {
                    icon: "🦶",
                    title: "Chân bè rộng",
                    desc: "Chọn form wide hoặc tăng nửa size, tránh bó ngang gây tê",
                  },
                  {
                    icon: "👟",
                    title: "Bàn chân dẹt / vòm cao",
                    desc: "Nên tham khảo thêm về insole (lót giày) phù hợp",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 hover:shadow-md transition-shadow"
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="font-bold text-violet-700 mb-2 text-lg">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-emerald-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  7
                </span>
                Mẹo nhỏ khi mua giày online
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="space-y-3">
                {[
                  {
                    icon: "📝",
                    text: "Gửi chiều dài bàn chân (cm), chiều cao, cân nặng cho shop để được tư vấn kỹ hơn",
                  },
                  {
                    icon: "🔄",
                    text: "Hỏi trước về chính sách đổi size nếu đi không vừa",
                  },
                  {
                    icon: "✅",
                    text: "Nếu đã đi quen một mẫu giày nào đó, hãy dùng nó làm 'tham chiếu' khi chọn mẫu mới",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <p className="text-gray-700 leading-relaxed pt-1">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                  💬
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Cần tư vấn size chi tiết?
                  </h3>
                  <p className="text-white/90 leading-relaxed text-lg mb-5">
                    Nếu bạn gửi số đo bàn chân cho shop (chiều dài, chiều rộng,
                    thói quen chạy), bên mình có thể gợi ý size chi tiết cho
                    từng mẫu giày cụ thể – giảm tối đa rủi ro mua về bị chật /
                    rộng.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                  >
                    Liên hệ tư vấn ngay
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
