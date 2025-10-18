import type { Address } from "./SavedAddresses";

type Props = {
  note: string;
  onNoteChange: (v: string) => void;
  selectedAddress?: Address | null;
};

export function ShippingInfoForm({
  note,
  onNoteChange,
  selectedAddress,
}: Props) {
  return (
    <section className="rounded-2xl border bg-white p-8 shadow-lg">
      <h2 className="text-xl font-semibold mb-5 text-gray-700">
        Thông tin nhận hàng
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Họ và tên
          </label>
          <input
            defaultValue={selectedAddress?.name ?? ""}
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Số điện thoại
          </label>
          <input
            defaultValue={selectedAddress?.phone ?? ""}
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Email (tuỳ chọn)
          </label>
          <input
            defaultValue={selectedAddress?.email ?? ""}
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Địa chỉ
          </label>
          <input
            defaultValue={selectedAddress?.address ?? ""}
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Tỉnh/Thành
          </label>
          <input
            defaultValue={selectedAddress?.province ?? ""}
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Quận/Huyện
          </label>
          <input
            defaultValue={selectedAddress?.district ?? ""}
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Ghi chú
          </label>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={3}
            className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
      </div>
    </section>
  );
}
