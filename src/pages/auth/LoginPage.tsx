// src/pages/auth/LoginPage.tsx
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import type { LoginForm } from "@/types/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = useCallback(async (data: LoginForm) => {
    try {
      setError(null);
      await login(data, rememberMe);
    } catch (err) {
      const errorMessage = 
        err instanceof Error 
          ? err.message 
          : "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.";
      console.error("Login failed:", errorMessage);
      setError(errorMessage);
    }
  }, [login, rememberMe]);

  return (
    <div className="mt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-center text-3xl font-bold text-gray-900">로그인</h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="이메일"
              placeholder="이메일을 입력하세요"
              disabled={isSubmitting}
              {...register("email", {
                required: "이메일을 입력해주세요",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "올바른 이메일 형식이 아닙니다",
                },
              })}
              error={errors.email?.message}
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              disabled={isSubmitting}
              {...register("password", {
                required: "비밀번호를 입력해주세요",
              })}
              error={errors.password?.message}
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/auth/reset-password"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              로그인 상태 유지
            </label>
          </div>

          <Button type="submit" fullWidth disabled={isSubmitting}>
            로그인
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">계정이 없으신가요? </span>
            <Link
              to="/auth/signup"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}