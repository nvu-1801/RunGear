export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12 text-gray-800">
        {/* Tiêu đề */}
        <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-900">
          Chào mừng đến với{" "}
          <span className="text-yellow-500">Run Gear</span>
        </h1>

        {/* Đoạn giới thiệu */}
        <p className="text-lg text-gray-600 leading-relaxed text-center mb-12 max-w-3xl mx-auto">
          <strong className="text-gray-900">Run Gear</strong> là cửa hàng trực tuyến chuyên cung cấp giày và trang phục thể thao 
          chính hãng từ các thương hiệu hàng đầu như{" "}
          <span className="font-medium">Adidas, Puma, Asics, New Balance</span>.  
          Chúng tôi mang đến cho bạn những sản phẩm chất lượng cao để đồng hành cùng bạn 
          trong luyện tập và phong cách hằng ngày.
        </p>

        {/* Grid Sứ mệnh và Giá trị */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-600">Sứ mệnh</h2>
            <p className="text-gray-700 leading-relaxed">
              Run Gear hướng tới việc trở thành thương hiệu thể thao đáng tin cậy, 
              mang lại trải nghiệm mua sắm dễ dàng, nhanh chóng và tiện lợi cho mọi khách hàng.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-600">Giá trị</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Chính hãng 100%</li>
              <li>Dịch vụ chăm sóc khách hàng tận tâm</li>
              <li>Cập nhật xu hướng thể thao mới nhất</li>
              <li>Cam kết đổi trả minh bạch</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-2xl p-10 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Hãy đồng hành cùng Run Gear
          </h2>
          <p className="text-gray-800 mb-6">
            Mỗi bước chạy, mỗi buổi tập đều mang lại năng lượng tích cực 
            và giúp bạn trở nên tốt hơn mỗi ngày.
          </p>
          <a
            href="/home"
            className="inline-block px-8 py-3 bg-black text-white font-semibold rounded-lg shadow hover:bg-gray-800 transition"
          >
            Khám phá sản phẩm
          </a>
        </div>
      </div>
    </div>
  );
}
