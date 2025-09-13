// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

export default async function AdminPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) redirect("/auth/signin?redirect=/admin");

  // check role từ profiles
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  if (!isAdmin) redirect("/home");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Admin</h1>
      <p>Chào {user.email}. Bạn có quyền admin.</p>
    </div>
  );
}
