import { useState, useEffect } from "react";
import type { Address } from "./SavedAddresses";

type ShippingData = {
  full_name: string;
  phone: string;
  email: string;
  address_line: string;
  province: string;
  district: string;
  note?: string;
};

type Props = {
  selectedAddress?: Address | null;
  onChange: (data: ShippingData) => void; // ← Callback để gửi data lên cha
  onShippingChange?: (data: ShippingData) => void;
  // note controlled (page truyền) hoặc internal
  note?: string;
  onNoteChange?: (v: string) => void;
};

export function ShippingInfoForm({
  selectedAddress,
  onChange,
  onShippingChange,
  note: noteProp,
  onNoteChange,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [note, setNote] = useState("");

  // Auto-fill khi selectedAddress thay đổi
  useEffect(() => {
    if (selectedAddress) {
      setFullName(selectedAddress.name);
      setPhone(selectedAddress.phone);
      setEmail(selectedAddress.email || "");
      setAddressLine(selectedAddress.address);
      setProvince(selectedAddress.province);
      setDistrict(selectedAddress.district);
    }
  }, [selectedAddress]);

  // Sync note từ prop (nếu parent control)
  useEffect(() => {
    if (noteProp !== undefined) {
      setNote(noteProp);
    }
  }, [noteProp]);

  // Gửi data lên component cha mỗi khi có thay đổi
  useEffect(() => {
    const data: ShippingData = {
      full_name: fullName,
      phone: phone,
      email: email,
      address_line: addressLine,
      province: province,
      district: district,
      note: note,
    };
    

    // Gọi cả 2 callback nếu có
    if (onChange) onChange(data);
    if (onShippingChange) onShippingChange(data);
    
    // Notify parent về note riêng
    if (onNoteChange) onNoteChange(note);
  }, [fullName, phone, email, addressLine, province, district, note]);
  return (
    <section className="rounded-2xl border bg-white p-8 shadow-lg">
      <h2 className="text-xl font-semibold mb-5 text-gray-700">
        Thông tin nhận hàng
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0901234567"
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="123 Đường ABC"
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <input
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="TP. Hồ Chí Minh"
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Quận 1"
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>



        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Ghi chú (tuỳ chọn)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Giao giờ hành chính..."
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
      </div>
    </section>
  );
}
