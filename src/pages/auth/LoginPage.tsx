// src/pages/auth/LoginPage.tsx
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import type { LoginForm } from "@/types/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<LoginForm>();

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const isEmailValid = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  const isButtonActive = emailValue && isEmailValid(emailValue) && passwordValue?.length > 0;

  const onSubmit = useCallback(async (data: LoginForm) => {
    try {
      setLoginError(null);
      await login(data, rememberMe);
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError("계정 정보가 없습니다. 다시 시도해주세요.");
    }
  }, [login, rememberMe]);

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden lg:block lg:w-1/2">
        <img 
          src="/src/assets/images/auth/login-intro-bg.svg" 
          alt="RefHub Introduction" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-[#f9faf9] flex items-center justify-center">
        <div className="w-[520px]">
          <h2 className="text-center text-2xl font-bold text-primary mb-12">로그인</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">이메일</p>
                <Input
                  placeholder="abc@refhub.com"
                  {...register("email", {
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  })}
                  error={emailValue && !isEmailValid(emailValue) ? "이메일 형식이 올바르지 않습니다." : undefined}
                  className="h-14"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-700">비밀번호</p>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  {...register("password", { required: true })}
                  className="h-14"
                />
              </div>
            </div>

            <div className="flex items-center justify-between my-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-[#676967]">
                  자동 로그인
                </label>
              </div>
              <Link
                to="/auth/reset-password"
                className="text-sm text-[#676967] hover:text-primary"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={!isButtonActive}
                className={`
                  w-full h-14 rounded-lg font-medium transition-colors duration-200
                  ${isButtonActive 
                    ? 'bg-primary hover:bg-primary-dark text-white' 
                    : 'bg-[#8A8D8A] text-white cursor-not-allowed'}
                `}
              >
                로그인
              </button>
              
              {loginError && (
                <p className="text-[#F04438] text-sm text-center mt-2">{loginError}</p>
              )}
            </div>
          </form>

          <div className="text-center mt-6">
            <span className="text-[#676967] text-sm">계정이 없으신가요? </span>
            <Link to="/auth/signup" className="text-primary hover:text-primary-dark text-sm">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}