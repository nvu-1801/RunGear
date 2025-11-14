// app/blog/phoi-outfit-chay/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Phối outfit: Áo – quần – giày \"ăn\" màu | Góc tư vấn",
  description:
    "3 công thức phối màu outfit chạy bộ đơn giản: gọn mắt, dễ mặc và lên ảnh đẹp.",
};

export default function PhoiOutfitChayPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Về trang chủ</span>
          </Link>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              Góc tư vấn • Chạy khỏe & mặc đẹp
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Phối outfit: Áo – quần – giày "ăn" màu
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              3 công thức phối màu đơn giản để set đồ chạy vừa gọn, vừa thoải mái lại còn lên hình đẹp.
            </p>
          </div>
        </div>
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16 text-gray-50" preserveAspectRatio="none" viewBox="0 0 1440 54" fill="currentColor">
            <path d="M0,32L80,37.3C160,43,320,53,480,53.3C640,53,800,43,960,37.3C1120,32,1280,32,1360,32L1440,32L1440,54L1360,54C1280,54,1120,54,960,54C800,54,640,54,480,54C320,54,160,54,80,54L0,54Z"/>
          </svg>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Intro Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 overflow-hidden border border-gray-100 p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                👕
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Chạy bộ là môn thể thao đơn giản, nhưng <strong className="text-purple-600">outfit đẹp</strong> sẽ giúp bạn <strong className="text-purple-600">tự tin hơn, có động lực ra khỏi nhà hơn</strong>. 
                  Không cần quá cầu kỳ, chỉ cần nắm vài nguyên tắc phối màu cơ bản là bạn đã có thể mix & match rất ổn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Formula 1 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">1</span>
                Công thức "an toàn": 1 màu nổi + 2 màu trung tính
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                Đây là cách phối dễ áp dụng nhất, gần như <strong className="text-blue-600">không thể xấu</strong>.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full"></div>
                    <h3 className="font-bold text-blue-700">1 món nổi bật</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Áo hoặc giày màu sáng (đỏ, cam, xanh neon...)
                  </p>
                </div>
                
                <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full"></div>
                    <h3 className="font-bold text-gray-700">2 món trung tính</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Đen, trắng, xám, navy
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-l-4 border-orange-500 mb-6">
                <h3 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  Ví dụ combo
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-lg">•</span>
                    <p>Áo <strong className="text-orange-600">cam</strong> + quần <strong>đen</strong> + giày <strong>trắng</strong></p>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-lg">•</span>
                    <p>Áo <strong>trắng</strong> + quần <strong>xám</strong> + giày <strong className="text-green-600">xanh neon</strong></p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <span className="text-2xl flex-shrink-0">💡</span>
                <p className="text-gray-700 leading-relaxed pt-1">
                  Outfit vẫn có điểm nhấn nhưng tổng thể <strong className="text-blue-700">gọn mắt, sạch sẽ</strong>, hợp cả chạy sáng sớm lẫn tối.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Formula 2 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-teal-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">2</span>
                Công thức "tone-sur-tone": cùng tông, khác sắc độ
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                Phối <strong className="text-teal-600">cùng một tông màu</strong> nhưng khác sắc độ (đậm / nhạt) sẽ cho cảm giác rất hiện đại:
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                  <div className="flex gap-1 flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-blue-200 rounded"></div>
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                    <div className="w-6 h-6 bg-white rounded border-2 border-blue-300"></div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Áo xanh dương nhạt + quần xanh navy + giày trắng có chi tiết xanh
                  </p>
                </div>
                
                <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <div className="flex gap-1 flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                    <div className="w-6 h-6 bg-black rounded"></div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Áo xám nhạt + quần xám đậm + giày đen/xám
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">💫</span>
                  <div>
                    <h3 className="font-bold text-yellow-700 mb-2">Tip nhỏ</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Nếu set đồ "tone-sur-tone" hơi nhạt, hãy chọn giày hoặc phụ kiện (mũ, tất) có <strong className="text-yellow-700">1 điểm màu nổi</strong> để tổng thể không bị chìm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Formula 3 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">3</span>
                Công thức "trung tính toàn tập" – gọn, sạch, khó lỗi
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 text-lg">
                Nếu bạn không muốn suy nghĩ nhiều, cứ đi theo combo <strong className="text-gray-700">đen – trắng – xám – navy</strong>:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { colors: ['bg-white border-2 border-gray-300', 'bg-black', 'bg-black'], text: 'Áo trắng + quần đen + giày đen' },
                  { colors: ['bg-black', 'bg-gray-400', 'bg-white border-2 border-gray-300'], text: 'Áo đen + quần xám + giày trắng' },
                  { colors: ['bg-blue-900', 'bg-black', 'bg-gray-400'], text: 'Áo navy + quần đen + giày xám' },
                ].map((combo, idx) => (
                  <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex gap-2 mb-3">
                      {combo.colors.map((color, i) => (
                        <div key={i} className={`w-8 h-8 ${color} rounded-lg shadow-sm`}></div>
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{combo.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                <span className="text-2xl flex-shrink-0">✅</span>
                <p className="text-gray-700 leading-relaxed pt-1">
                  Nhìn <strong className="text-slate-700">cực kỳ gọn</strong>, hợp mọi dáng người, không sợ "lụa thừa" hay màu mè quá đà.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Material & Fit Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-emerald-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">4</span>
                Lưu ý về chất liệu & form dáng
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: '🌬️', title: 'Chất liệu', desc: 'Ưu tiên khô nhanh, thoáng khí (poly, mesh, dry-fit…), tránh cotton 100% vì dễ thấm mồ hôi, nặng' },
                  { icon: '👔', title: 'Áo', desc: 'Nên hơi thoáng 1 chút, không quá bó, để cử động tay thoải mái' },
                  { icon: '👖', title: 'Quần', desc: 'Nên có cạp chun chắc, nếu chạy dài nên chọn loại có dây rút' },
                  { icon: '🌙', title: 'An toàn đêm', desc: 'Nếu chạy buổi tối, ưu tiên trang phục có chi tiết phản quang để an toàn hơn' },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{item.icon}</span>
                      <h3 className="font-bold text-emerald-700 text-lg">{item.title}</h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Accessories Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg shadow-violet-100 overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 md:px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-lg">5</span>
                Phụ kiện "nhỏ mà có võ"
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="space-y-4">
                {[
                  { icon: '🧢', title: 'Mũ chạy / băng đô', desc: 'Vừa giúp nhìn gọn hơn, vừa che nắng, giữ tóc gọn' },
                  { icon: '🧦', title: 'Tất chạy chuyên dụng', desc: 'Hạn chế phồng rộp, thấm mồ hôi tốt hơn tất thường' },
                  { icon: '🎒', title: 'Đai nước / túi chạy', desc: 'Chọn màu trung tính để không phá tổng thể outfit' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl hover:from-violet-100 hover:to-purple-100 transition-colors border border-violet-100">
                    <span className="text-3xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-violet-700 mb-2">{item.title}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                  📸
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Cần gợi ý combo cụ thể?</h3>
                  <p className="text-white/90 leading-relaxed text-lg mb-5">
                    Nếu bạn gửi hình đôi giày đang có (màu sắc cụ thể), bên mình có thể gợi ý nhanh vài combo áo–quần phù hợp, 
                    đảm bảo vừa dễ mặc hằng ngày vừa lên ảnh "ngon".
                  </p>
                  <Link 
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                  >
                    Nhận tư vấn miễn phí
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
