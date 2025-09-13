type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  // TODO: fetch từ Supabase theo slug/id
  return (
    <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="aspect-square rounded-xl border bg-gray-50" />
      <div>
        <h1 className="text-2xl font-semibold">Tên sản phẩm ({params.id})</h1>
        <p className="mt-2 text-xl font-bold">300.000₫</p>
        <div className="h-4" />
        <button className="px-5 py-2 rounded-lg bg-black text-white">Thêm vào giỏ</button>
        <div className="h-6" />
        <p className="text-sm text-gray-700">Mô tả…</p>
      </div>
    </section>
  );
}
