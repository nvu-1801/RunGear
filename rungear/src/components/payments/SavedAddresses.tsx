"use client";

import { useState } from "react";

export type Address = {
  id: string;
  label: string; // "Nhà riêng", "Công ty"
  name: string;
  phone: string;
  email?: string;
  address: string;
  province: string;
  district: string;
};

type Props = {
  addresses: Address[];
  onSelectAddress: (addr: Address) => void;
  onAddAddress: (addr: Omit<Address, "id">) => void;
  onEditAddress: (id: string, addr: Omit<Address, "id">) => void;
  onDeleteAddress: (id: string) => void;
};

export function SavedAddresses({
  addresses,
  onSelectAddress,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");

  const resetForm = () => {
    setLabel("");
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setProvince("");
    setDistrict("");
    setEditing(null);
    setShowForm(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditing(addr);
    setLabel(addr.label);
    setName(addr.name);
    setPhone(addr.phone);
    setEmail(addr.email ?? "");
    setAddress(addr.address);
    setProvince(addr.province);
    setDistrict(addr.district);
    setShowForm(true);
  };

  const handleSave = () => {
    const payload = { label, name, phone, email, address, province, district };
    if (editing) {
      onEditAddress(editing.id, payload);
    } else {
      onAddAddress(payload);
    }
    resetForm();
  };

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Địa chỉ đã lưu</h2>
        <button
          onClick={handleOpenAdd}
          className="text-sm text-blue-700 font-semibold hover:underline"
        >
          + Thêm địa chỉ
        </button>
      </div>

      {/* Danh sách địa chỉ */}
      {addresses.length === 0 ? (
        <p className="text-sm text-gray-500">
          Chưa có địa chỉ nào. Hãy thêm địa chỉ mới.
        </p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border p-4 flex items-start justify-between hover:bg-gray-50 transition"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {a.label}{" "}
                  <span className="text-sm font-normal text-gray-600">
                    ({a.name} • {a.phone})
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {a.address}, {a.district}, {a.province}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectAddress(a)}
                  className="text-sm text-blue-700 font-medium hover:underline"
                >
                  Chọn
                </button>
                <button
                  onClick={() => handleOpenEdit(a)}
                  className="text-sm text-gray-700 font-medium hover:underline"
                >
                  Sửa
                </button>
                <button
                  onClick={() => {
                    if (confirm("Xóa địa chỉ này?")) onDeleteAddress(a.id);
                  }}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal form thêm/sửa */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editing ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">
                  Tên địa chỉ (Nhà riêng, Công ty…)
                </label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1 font-medium">
                    Họ và tên
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1 font-medium">
                    Số điện thoại
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">
                  Email (tuỳ chọn)
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">
                  Địa chỉ
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1 font-medium">
                    Tỉnh/Thành
                  </label>
                  <input
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1 font-medium">
                    Quận/Huyện
                  </label>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
