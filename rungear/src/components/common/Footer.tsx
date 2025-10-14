"use client";

import React from "react";
import {
  Mail,
  ArrowUp,
} from "lucide-react";
import {
  SiTiktok,
  SiFacebook,
  SiInstagram,
  SiYoutube
} from "react-icons/si";

export default function Footer({ brand = "RunGear" }: { brand?: string }) {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const year = new Date().getFullYear();

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }
    setMessage("Đăng ký nhận tin thành công ✨");
    setEmail("");
  }

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50 text-neutral-700">
      {/* Accent gradient line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500" />

      <div className="max-w-7xl mx-auto px-6 py-14 space-y-12">
        {/* === Tầng 1: Hệ thống === */}
        <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Hệ thống cửa hàng {brand} toàn quốc
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Bao gồm cửa hàng RunGear, trung tâm trải nghiệm thể thao và đại lý đối tác trên toàn quốc.
            </p>
          </div>
          <button className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition">
            Xem danh sách cửa hàng
          </button>
        </div>

        {/* === Tầng 2: 4 cột nội dung === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* 1️⃣ Social + Form */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-800 mb-4">
              Kết nối với {brand}
            </h4>
            <div className="flex items-center gap-4 mb-5">
              {[
                { Icon: SiFacebook, label: "Facebook" },
                { Icon: SiInstagram, label: "Instagram" },
                { Icon: SiYoutube, label: "YouTube" },
                { Icon: SiTiktok, label: "TikTok" },
              ].map(({ Icon, label }, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={label}
                  className="text-neutral-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-500 hover:to-fuchsia-500 transition"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>


            <div className="space-y-1 text-sm text-neutral-600">
              <p>
                <strong className="text-neutral-800">Tư vấn:</strong> 1800.888.999
              </p>
              <p>
                <strong className="text-neutral-800">Kỹ thuật:</strong> 1800.888.555
              </p>
              <p>Email: support@rungear.vn</p>
            </div>

            <form onSubmit={onSubscribe} className="mt-5 space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Nhận tin & ưu đãi mới
              </label>
              <div className="flex rounded-xl border border-neutral-300 bg-white overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
                <div className="grid place-items-center px-3 text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@mail.com"
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 text-sm font-medium text-white hover:opacity-90 transition"
                >
                  Gửi
                </button>
              </div>
              {message && <p className="text-xs text-emerald-600">{message}</p>}
              {error && <p className="text-xs text-rose-600">{error}</p>}
            </form>
          </div>

          {/* 2️⃣ Về RunGear */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-800 mb-4">
              Về {brand}
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><a href="/about" className="hover:text-neutral-900">Giới thiệu thương hiệu</a></li>
              <li><a href="/careers" className="hover:text-neutral-900">Tuyển dụng</a></li>
              <li><a href="/stores" className="hover:text-neutral-900">Hệ thống cửa hàng</a></li>
              <li><a href="/blog" className="hover:text-neutral-900">Blog & Câu chuyện thể thao</a></li>
              <li><a href="/runclub" className="hover:text-neutral-900">Chính sách thành viên RunClub</a></li>
            </ul>
          </div>

          {/* 3️⃣ Chính sách */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-800 mb-4">
              Chính sách & Hỗ trợ
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><a href="/policy/warranty" className="hover:text-neutral-900">Chính sách bảo hành</a></li>
              <li><a href="/policy/return" className="hover:text-neutral-900">Chính sách đổi trả</a></li>
              <li><a href="/policy/shipping" className="hover:text-neutral-900">Chính sách vận chuyển</a></li>
              <li><a href="/policy/payment" className="hover:text-neutral-900">Chính sách thanh toán</a></li>
              <li><a href="/terms" className="hover:text-neutral-900">Điều khoản sử dụng</a></li>
              <li><a href="/privacy" className="hover:text-neutral-900">Bảo mật thông tin</a></li>
            </ul>
          </div>

          {/* 4️⃣ Thanh toán + chứng nhận */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-800 mb-4">
              Hỗ trợ thanh toán
            </h4>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
              {["VISA", "Mastercard", "JCB", "Momo", "ZaloPay", "ApplePay"].map((pay) => (
                <span
                  key={pay}
                  className="rounded-md border border-neutral-300 px-2 py-1"
                >
                  {pay}
                </span>
              ))}
            </div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-800 mt-6 mb-3">
              Chứng nhận
            </h4>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
              {["DMCA", "Bộ Công Thương", "RunGear Certified"].map((cert) => (
                <span
                  key={cert}
                  className="rounded-md border border-neutral-300 px-2 py-1"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* === Tầng 3: Copyright === */}
        <div className="border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500 space-y-3">
          <p className="font-medium text-neutral-700">
            Website thuộc hệ thống RunGear Group
          </p>
          <div className="flex justify-center flex-wrap gap-4 text-neutral-600">
            <span>RunGear Studio</span>
            <span>RunGear Care</span>
            <span>RunFit</span>
          </div>

          <p className="text-xs text-neutral-500">
            © {year} RunGear Vietnam. All rights reserved.<br />
            Công ty TNHH RunGear Việt Nam – ĐKKD: 0316xxxxxx, TP.HCM.<br />
            Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM · Điện thoại: (028) 7777 8888 · Email: contact@rungear.vn
          </p>

          <div className="pt-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
            >
              <ArrowUp className="h-4 w-4" /> Lên đầu trang
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
