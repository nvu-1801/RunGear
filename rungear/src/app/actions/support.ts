"use server";

import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function getUnreadSupportMessagesCount() {
  try {
    const sb = await supabaseServer();

    const {
      data: { user },
    } = await sb.auth.getUser();

    if (!user) {
      console.log("[Support] No user logged in");
      return 0;
    }

    // Check if admin
    const { data: profile } = await sb
      .from("profiles")
      .select("role, is_admin")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin" || profile?.is_admin === true;

    if (!isAdmin) {
      console.log("[Support] User is not admin");
      return 0;
    }

    console.log("[Support] Counting unread messages for admin:", user.id);

    // Đếm số thread có tin nhắn cuối từ user (role = 'user')
    const { data: messages, error } = await sb
      .from("support_messages")
      .select("user_id, role, created_at")
      .not("user_id", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Support] Error fetching messages:", error);
      return 0;
    }

    if (!messages || messages.length === 0) {
      console.log("[Support] No messages found");
      return 0;
    }

    // Group by user_id và lấy message mới nhất của mỗi user
    const lastMessageByUser = new Map<string, { role: string }>();

    for (const msg of messages) {
      if (!msg.user_id) continue;

      if (!lastMessageByUser.has(msg.user_id)) {
        lastMessageByUser.set(msg.user_id, { role: msg.role });
      }
    }

    // Đếm số user có tin nhắn cuối là "user" (chưa được admin reply)
    let unreadCount = 0;
    for (const [, lastMsg] of lastMessageByUser) {
      if (lastMsg.role === "user") {
        unreadCount++;
      }
    }

    console.log("[Support] Unread count:", unreadCount);
    return unreadCount;
  } catch (error) {
    console.error(
      "[Support] Exception in getUnreadSupportMessagesCount:",
      error
    );
    return 0;
  }
}
