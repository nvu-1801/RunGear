import AuthTabs from "@/modules/auth/ui/AuthTabs";
import AuthForm from "@/modules/auth/ui/AuthForm";

export default function SignInPage() {
  return (
    <div>
      <div className="mb-6">
        <AuthTabs />
      </div>
      <h1 className="text-2xl font-semibold mb-4 text-gray-900">Welcome back</h1>
      <AuthForm mode="signin" />
      <p className="text-xs text-gray-500 mt-4">
        Bằng việc tiếp tục, bạn đồng ý với Chính sách & Điều khoản.
      </p>
    </div>
  );
}
