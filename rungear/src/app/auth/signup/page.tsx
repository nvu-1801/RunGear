import React, { Suspense } from "react";
import AuthTabs from "@/components/auth/AuthTabs";
import AuthForm from "@/components/auth/AuthForm";

export default function SignUpPage() {
  return (
    <main>
      <Suspense fallback={<div className="mb-6">Đang tải giao diện...</div>}>
        <div className="mb-6">
          <AuthTabs />
        </div>

        <h1 className="text-2xl font-semibold mb-4 text-gray-900">
          Create account
        </h1>

        <AuthForm mode="signup" />

        <p className="text-xs text-gray-500 mt-4">
          Tôi đồng ý với Privacy Policy và Terms of Service.
        </p>
      </Suspense>
    </main>
  );
}
