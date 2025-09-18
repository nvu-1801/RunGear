import Link from "next/link";
import {
  listProducts,
  productImageUrl,
} from "@/modules/products/controller/product.service";
import { formatPriceVND } from "../../../shared/price";

export const revalidate = 60;

type CatKey = "all" | "giay" | "quan-ao";

export default async function ProductsPage({
  searchParams,
}: {
  // ✅ Next 15: searchParams là Promise
  searchParams: Promise<{ q?: string; cat?: CatKey }>;
}) {
  const { q = "", cat = "all" } = await searchParams; // ✅
  const items = await listProducts({ q, cat });

  const Tab = (label: string, key: CatKey) => {
    const isActive = cat === key || (!cat && key === "all");
    const query: Record<string, string> = {};
    if (q) query.q = q;
    if (key !== "all") query.cat = key;

    return (
      <Link
        key={key}
        href={{ pathname: "/home", query }}
        className={`px-3 py-1.5 rounded-full text-sm border transition
          ${
            isActive
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Cửa hàng</h1>
      </div>

      {/* Tabs filter */}
      <div className="flex items-center gap-2 mb-8">
        {Tab("Tất cả", "all")}
        {Tab("Giày", "giay")}
        {Tab("Trang phục", "quan-ao")}
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((p) => (
          <li key={p.id} className="group">
            <Link href={`/home/${p.slug}`} className="block">
              <div className="aspect-square overflow-hidden rounded-2xl border">
                <img
                  src={productImageUrl(p) ?? "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              <div className="mt-3">
                <p className="font-medium line-clamp-1 text-gray-900">
                  {p.name}
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {formatPriceVND(p.price)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
