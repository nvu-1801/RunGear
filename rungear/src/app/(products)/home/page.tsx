import Link from "next/link";
import { listProducts, productImageUrl } from "@/modules/products/service/product.service";
import { formatPriceVND } from "../../../shared/price";

export const revalidate = 60; // ISR

export default async function ProductsPage({
  searchParams,
}: { searchParams?: { q?: string } }) {
  const q = searchParams?.q ?? "";
  const items = await listProducts({ q });

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Cửa hàng</h1>
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm kiếm…"
            className="border rounded-lg px-3 py-2 text-sm w-64 text-gray-900"
          />
        </form>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(p => (
          <li key={p.id} className="group">
            <Link href={`/products/${p.slug}`} className="block">
              <div className="aspect-square overflow-hidden rounded-2xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImageUrl(p) ?? "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform text-gray-900"
                  loading="lazy"
                />
              </div>
              <div className="mt-3">
                <p className="font-medium line-clamp-1 text-gray-900">{p.name}</p>
                <p className="mt-1 font-semibold text-gray-900">{formatPriceVND(p.price)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
