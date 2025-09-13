import { redirect } from "next/navigation";
import { supabaseServer } from "../../../libs/db/supabase/supabase-server";

export default async function AdminPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) redirect("/auth?redirect=/products/admin");
  if (user.app_metadata?.role !== "admin") redirect("/products/home");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Admin</h1>
      <p>Chào {user.email}. Bạn có quyền admin.</p>
      {/* nội dung quản trị… */}
    </div>
  );
}
