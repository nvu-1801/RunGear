"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { usePathname } from "next/navigation";

type Props = {
  initialCount: number;
};

export default function SupportChatBadge({ initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const pathname = usePathname();
  const isOnSupportPage = pathname?.startsWith("/admin/support");

  useEffect(() => {
    console.log("[SupportBadge] Initial count:", initialCount);
    console.log("[SupportBadge] Current pathname:", pathname);
    console.log("[SupportBadge] Is on support page:", isOnSupportPage);

    // Reset về 0 khi vào trang support
    if (isOnSupportPage) {
      console.log("[SupportBadge] On support page, resetting count to 0");
      setCount(0);
      return;
    }

    const sb = supabaseBrowser();

    console.log("[SupportBadge] Setting up realtime subscription...");

    // Lắng nghe tin nhắn mới từ user
    const channel = sb
      .channel("support_badge_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: "role=eq.user",
        },
        (payload) => {
          console.log("[SupportBadge] New user message received:", payload);
          setCount((prev) => {
            const newCount = prev + 1;
            console.log("[SupportBadge] Count updated:", prev, "→", newCount);
            return newCount;
          });
        }
      )
      .subscribe((status) => {
        console.log("[SupportBadge] Subscription status:", status);
      });

    return () => {
      console.log("[SupportBadge] Cleaning up subscription");
      sb.removeChannel(channel);
    };
  }, [isOnSupportPage, pathname, initialCount]);

  console.log("[SupportBadge] Rendering with count:", count);

  // Không hiển thị nếu count = 0 hoặc đang ở trang support
  if (isOnSupportPage || count === 0) {
    console.log(
      "[SupportBadge] Not rendering badge (count=0 or on support page)"
    );
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white animate-pulse">
      {count > 9 ? "9+" : count}
    </span>
  );
}
