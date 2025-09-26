export default function FAQPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Hỏi đáp (FAQ)
      </h1>

      <div className="space-y-6">
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">
            Run Gear có bán sản phẩm chính hãng không?
          </h2>
          <p className="text-gray-700">
            Tất cả sản phẩm tại Run Gear đều được nhập khẩu chính hãng từ các
            thương hiệu lớn như Adidas, Puma, Asics, New Balance. Cam kết 100% chính hãng.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">
            Chính sách đổi trả như thế nào?
          </h2>
          <p className="text-gray-700">
            Bạn có thể đổi trả sản phẩm trong vòng 7 ngày nếu sản phẩm chưa qua sử dụng
            và còn nguyên tem, hộp. Chúng tôi sẽ hỗ trợ nhanh chóng và minh bạch.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">
            Thời gian giao hàng là bao lâu?
          </h2>
          <p className="text-gray-700">
            Thời gian giao hàng thường từ 2–5 ngày tùy khu vực. 
            Chúng tôi có hỗ trợ giao hàng nhanh tại các thành phố lớn.
          </p>
        </div>
      </div>
    </div>
  );
}
