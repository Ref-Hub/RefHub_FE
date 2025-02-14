// src/pages/auth/LoginPage.tsx
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import { Input } from "@/components/common/Input";
import { authService } from "@/services/auth";
import type { LoginForm } from "@/types/auth";
import { useSetRecoilState } from "recoil";
import { shareModalState } from "@/store/collection";

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setShareModal = useSetRecoilState(shareModalState);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>();

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const isEmailValid = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  const isButtonActive =
    emailValue && isEmailValid(emailValue) && passwordValue?.length > 0;

  const onSubmit = useCallback(
    async (data: LoginForm) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        await authService.login(data, rememberMe);
        setShareModal((prev) => ({ ...prev, userEmail: data.email }));
        navigate("/");
        showToast("로그인이 완료되었습니다.", "success");
      } catch (error) {
        if (error instanceof Error) {
          showToast(error.message, "error");
        } else {
          showToast("로그인에 실패했습니다.", "error");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, rememberMe, showToast, isLoading]
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          src="/images/login-intro-bg.svg"
          alt="RefHub Introduction"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-[#f9faf9] flex items-center justify-center">
        <div className="w-[520px]">
          <h2 className="text-center text-2xl font-bold text-primary mb-12">
            로그인
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 bg-white p-8 rounded-lg"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">이메일</p>
                <Input
                  placeholder="abc@refhub.com"
                  {...register("email", {
                    required: "이메일을 입력해주세요",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "올바른 이메일 형식이 아닙니다",
                    },
                  })}
                  error={errors.email?.message}
                  className="h-14"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-700">비밀번호</p>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  {...register("password", {
                    required: "비밀번호를 입력해주세요",
                  })}
                  error={errors.password?.message}
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
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-[#676967]"
                >
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

            <button
              type="submit"
              disabled={!isButtonActive || isLoading}
              className={`
                w-full h-14 rounded-lg font-medium transition-colors duration-200
                ${
                  isButtonActive && !isLoading
                    ? "bg-primary hover:bg-primary-dark text-white"
                    : "bg-[#8A8D8A] text-white cursor-not-allowed"
                }
              `}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-[#676967] text-sm">계정이 없으신가요? </span>
            <Link
              to="/auth/signup"
              className="text-primary hover:text-primary-dark text-sm"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
