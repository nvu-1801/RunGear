export default function ContactPage() {
  return (
    <div className="max-w-4xl text-gray-600 mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Liên hệ với Run Gear
      </h1>

      <p className="text-lg text-gray-700 text-center mb-10">
        Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi qua form dưới đây:
      </p>

      <form className="bg-white shadow-md rounded-xl p-8 space-y-6">
        <div>
          <label className="block text-gray-800 font-medium mb-2">
            Họ và tên
          </label>
          <input
            type="text"
            className="w-full border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
            placeholder="Nhập họ và tên"
          />
        </div>

        <div>
          <label className="block text-gray-800 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
            placeholder="Nhập email của bạn"
          />
        </div>

        <div>
          <label className="block text-gray-800 font-medium mb-2">
            Nội dung
          </label>
          <textarea
            rows={5}
            className="w-full border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
            placeholder="Nhập nội dung cần liên hệ..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          Gửi liên hệ
        </button>
      </form>

      <div className="text-center mt-10 text-gray-700">
        <p>📍 Địa chỉ: 123 Nguyễn Văn Cừ, Q.5, TP. Hồ Chí Minh</p>
        <p>📞 Hotline: 0909 123 456</p>
        <p>✉️ Email: support@rungear.vn</p>
      </div>
    </div>
  );
}
