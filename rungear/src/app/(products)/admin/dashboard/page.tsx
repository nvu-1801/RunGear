"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/libs/db/supabase/supabase-client";

type Stats = { sold_this_month: number; total_stock: number; skus_in_stock: number };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data, error } = await sb.rpc("get_dashboard_stats");
        if (error) throw error;
        setStats(data?.[0] ?? { sold_this_month: 0, total_stock: 0, skus_in_stock: 0 });
      } catch (e:any) { setErr(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-6 text-gray-800">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      {loading && <p>Đang tải…</p>}
      {err && <p className="text-red-600">{err}</p>}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card label="Sold this month" value={stats.sold_this_month} />
          <Card label="Total stock (qty)" value={stats.total_stock} />
          <Card label="SKUs in stock" value={stats.skus_in_stock} />
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
