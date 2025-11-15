"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import type { User } from "@supabase/supabase-js";

type AuthContextPayload = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
};

// 1. Tạo Context
const AuthContext = createContext<AuthContextPayload>({
  user: null,
  isAdmin: false,
  isLoading: true,
});

// 2. Sửa Provider để nhận `value` từ Server Component
export const AuthProvider = ({
  value, // `value` này đến từ `ProductsGroupLayout.tsx`
  children,
}: {
  value: AuthContextPayload;
  children: React.ReactNode;
}) => {
  const sb = supabaseBrowser();

  // ✅ FIX 1: Khởi tạo state bằng `value` từ server (Fix lỗi "flash")
  const [user, setUser] = useState(value.user);
  const [isAdmin, setIsAdmin] = useState(value.isAdmin);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FIX 2: Dùng useEffect để đồng bộ state (Fix lỗi "không phản ứng")
  useEffect(() => {
    let mounted = true;
    // Lắng nghe thay đổi auth (như login, logout) ở phía client
    // Hỏi supabase ngay lập tức để biết trạng thái hiện tại, tránh "flash"
    (async () => {
      try {
        const res = await sb.auth.getUser();
        if (!mounted) return;
        const sessionUser = res.data?.user ?? null;
        setUser(sessionUser);

        if (!sessionUser) setIsAdmin(false);
        else if (sessionUser.id === value.user?.id) setIsAdmin(value.isAdmin);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (!sessionUser) {
        setIsAdmin(false);
      } else if (sessionUser.id === value.user?.id) {
        setIsAdmin(value.isAdmin);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sb, value.user, value.isAdmin]); // Thêm dependencies

  // 4. Cung cấp state đã được đồng bộ
  const contextValue = useMemo(
    () => ({
      user,
      isAdmin,
      isLoading,
    }),
    [user, isAdmin, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// 5. useAuth hook giữ nguyên
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
