// app/blog/tips-chon-giay-chay/page.tsx
import Link from "next/link";

export const metadata = {
  title: "5 tips chọn giày chạy bộ cho người mới | Góc tư vấn",
  description:
    "Đệm, độ rơi gót–mũi (heel-to-toe drop), độ ôm và tip chọn giày chạy bộ chuẩn cho người mới bắt đầu.",
};

export default function TipsChonGiayChayPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
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
              5 tips chọn giày chạy bộ cho người mới
            </h1>

            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Đệm, độ rơi gót–mũi, độ ôm và vài lưu ý nhỏ giúp bạn chọn đôi giày
              đầu tiên "đi là thấy muốn chạy".
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
        {/* Intro Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-green-100 overflow-hidden border border-gray-100 p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                👟
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Với người mới chạy, đôi giày thường quyết định tới{" "}
                  <strong className="text-green-600">50% trải nghiệm</strong>:
                  êm hay đau, muốn chạy tiếp hay bỏ cuộc. Dưới đây là 5 gợi ý
                  đơn giản giúp bạn chọn đúng đôi giày để bắt đầu hành trình
                  chạy bộ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tip 1 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  1
                </span>
                Chọn đúng mục đích chạy
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                Hãy xác định bạn sẽ chạy chủ yếu ở đâu và như thế nào. Mỗi kiểu
                chạy sẽ cần một kiểu giày khác nhau:
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: "🏙️",
                    title: "Chạy đường bê tông / công viên",
                    desc: "Ưu tiên giày đệm êm, ổn định, giảm chấn tốt",
                    color: "from-blue-50 to-indigo-50 border-blue-100",
                  },
                  {
                    icon: "⛰️",
                    title: "Chạy trail (đồi núi, địa hình xấu)",
                    desc: "Cần đế bám tốt, chống trơn, chống đá nhọn",
                    color: "from-amber-50 to-orange-50 border-amber-100",
                  },
                  {
                    icon: "⚡",
                    title: "Chạy ngắn, tốc độ",
                    desc: "Giày nhẹ, linh hoạt, đệm vừa đủ",
                    color: "from-purple-50 to-pink-50 border-purple-100",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 p-5 bg-gradient-to-br ${item.color} rounded-xl border hover:shadow-md transition-shadow`}
                  >
                    <span className="text-3xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tip 2 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  2
                </span>
                Quan tâm đến độ đệm (cushioning)
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                Người mới thường nên chọn giày có{" "}
                <strong className="text-purple-600">đệm dày vừa–nhiều</strong>{" "}
                để hạn chế đau gối, đau cổ chân:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <div className="text-4xl mb-4">🛏️</div>
                  <h3 className="font-bold text-purple-700 mb-2 text-lg">
                    Đệm mềm, êm
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Nếu bạn <strong>hay đau chân, đứng nhiều</strong> trong ngày
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200">
                  <div className="text-4xl mb-4">🏃</div>
                  <h3 className="font-bold text-teal-700 mb-2 text-lg">
                    Đệm vừa phải
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Nếu bạn <strong>thích cảm giác mặt đường</strong>, midsole
                    không quá dày
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tip 3 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-orange-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  3
                </span>
                Độ rơi gót–mũi (heel-to-toe drop)
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                <strong className="text-orange-600">Drop</strong> là chênh lệch
                chiều cao giữa gót và mũi giày, tính bằng mm. Một số gợi ý:
              </p>

              <div className="space-y-4">
                {[
                  {
                    range: "8–12 mm",
                    desc: "Dễ làm quen, phù hợp đa số người mới",
                    color: "bg-green-500",
                    bgColor: "from-green-50 to-emerald-50 border-green-100",
                    icon: "✅",
                  },
                  {
                    range: "4–8 mm",
                    desc: "Tự nhiên hơn, hợp người đã chạy một thời gian",
                    color: "bg-yellow-500",
                    bgColor: "from-yellow-50 to-amber-50 border-yellow-100",
                    icon: "⚠️",
                  },
                  {
                    range: "0–4 mm",
                    desc: "Giày tối giản - chỉ nên dùng khi bạn đã quen kỹ thuật và tăng dần từ từ",
                    color: "bg-red-500",
                    bgColor: "from-red-50 to-rose-50 border-red-100",
                    icon: "🔴",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-5 bg-gradient-to-r ${item.bgColor} rounded-xl border hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl flex-shrink-0">
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 ${item.color} text-white rounded-full text-sm font-bold`}
                          >
                            {item.range}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-gray-700 leading-relaxed">
                    Nếu bạn hay{" "}
                    <strong className="text-blue-700">tiếp đất bằng gót</strong>
                    , drop cao sẽ dễ chịu hơn lúc đầu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tip 4 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-teal-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  4
                </span>
                Độ ôm: mũi, thân và gót giày
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                Một đôi giày chạy đúng cỡ sẽ{" "}
                <strong className="text-teal-600">không gây cấn</strong> nhưng
                cũng <strong className="text-teal-600">không quá lỏng</strong>:
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    icon: "👣",
                    title: "Mũi giày",
                    desc: "Nên dư khoảng 0.5–1cm so với ngón dài nhất (chân sẽ nở ra khi chạy)",
                    color: "from-teal-50 to-cyan-50 border-teal-100",
                  },
                  {
                    icon: "↔️",
                    title: "Bề ngang",
                    desc: "Không bị bó chặt phần mu bàn chân; khi buộc dây vẫn cử động được tự nhiên",
                    color: "from-blue-50 to-indigo-50 border-blue-100",
                  },
                  {
                    icon: "🔒",
                    title: "Gót",
                    desc: "Ôm vừa, không trượt lên xuống mỗi bước chạy",
                    color: "from-purple-50 to-pink-50 border-purple-100",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-5 bg-gradient-to-br ${item.color} rounded-xl border hover:shadow-md transition-shadow`}
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg">
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

        {/* Tip 5 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">
                  5
                </span>
                Thử giày đúng cách
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="space-y-4">
                {[
                  {
                    icon: "🌙",
                    text: "Thử giày vào cuối ngày hoặc sau khi đi lại nhiều, chân to nhất",
                  },
                  {
                    icon: "🧦",
                    text: "Mang loại tất bạn hay chạy để cảm nhận đúng",
                  },
                  {
                    icon: "🏃‍♂️",
                    text: "Đi lại, chạy thử vài bước nếu cửa hàng cho phép",
                  },
                  {
                    icon: "🎯",
                    text: 'Đừng mua chỉ vì "đẹp" – hãy ưu tiên cảm giác chân trước tiên',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-colors border border-indigo-100"
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

        {/* Bonus Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-rose-100 overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                Bonus: Giày chạy không chữa được chấn thương
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                Giày tốt giúp bạn{" "}
                <strong className="text-rose-600">
                  giảm rủi ro chấn thương
                </strong>
                , nhưng không thay thế được{" "}
                <strong className="text-rose-600">khởi động, giãn cơ</strong> và{" "}
                <strong className="text-rose-600">tăng cự ly từ từ</strong>. Hãy
                bắt đầu nhẹ nhàng, lắng nghe cơ thể và nâng dần khối lượng chạy.
              </p>

              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {[
                  { icon: "🔥", text: "Khởi động đúng cách" },
                  { icon: "🧘", text: "Giãn cơ sau chạy" },
                  { icon: "📈", text: "Tăng từ từ, đều đặn" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <p className="text-gray-700 text-sm font-medium text-center">
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
          <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                  💬
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Vẫn phân vân chưa biết chọn đôi nào?
                  </h3>
                  <p className="text-white/90 leading-relaxed text-lg mb-5">
                    Hãy inbox fanpage hoặc chat với shop – gửi chiều cao, cân
                    nặng, cự ly dự định chạy, mình sẽ tư vấn chi tiết hơn để bạn
                    chọn được đôi giày phù hợp nhất.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                  >
                    Nhận tư vấn miễn phí
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
