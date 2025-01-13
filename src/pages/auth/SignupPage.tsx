// src/pages/auth/SignupPage.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import type { SignupForm } from "@/types/auth";

type SignupStep = "INFO" | "VERIFY" | "PASSWORD";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<SignupStep>("INFO");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>();
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const onSubmit = async (data: SignupForm) => {
    // TODO: API 연동 후 구현
    console.log(data);
  };

  const handleSendVerification = async () => {
    // TODO: API 연동 후 구현
    setIsVerificationSent(true);
    
    // 1분 후에 재발송 가능하도록 설정
    setTimeout(() => {
      setIsVerificationSent(false);
    }, 60000);
  };

  const handleVerifyCode = async () => {
    // TODO: API 연동 후 구현
    setCurrentStep("PASSWORD");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            회원가입
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {currentStep === "INFO" && (
            <div className="space-y-4">
              <Input
                label="이름"
                {...register("name", {
                  required: "이름을 입력해주세요",
                })}
                error={errors.name?.message}
              />
              <Input
                label="이메일"
                type="email"
                {...register("email", {
                  required: "이메일을 입력해주세요",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "올바른 이메일 형식이 아닙니다",
                  },
                })}
                error={errors.email?.message}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendVerification}
                disabled={isVerificationSent}
              >
                {isVerificationSent ? "인증번호 발송됨" : "인증번호 재발송"}
              </Button>
            </div>
          )}

          {currentStep === "VERIFY" && (
            <div className="space-y-4">
              <Input
                label="인증번호"
                {...register("verificationCode", {
                  required: "인증번호를 입력해주세요",
                })}
                error={errors.verificationCode?.message}
              />
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendVerification}
                >
                  인증번호 재발송
                </Button>
                <Button type="button" onClick={handleVerifyCode}>
                  확인
                </Button>
              </div>
            </div>
          )}

          {currentStep === "PASSWORD" && (
            <div className="space-y-4">
              <Input
                label="비밀번호"
                type="password"
                {...register("password", {
                  required: "비밀번호를 입력해주세요",
                  minLength: {
                    value: 8,
                    message: "비밀번호는 8자 이상이어야 합니다",
                  },
                })}
                error={errors.password?.message}
              />
              <Input
                label="비밀번호 확인"
                type="password"
                {...register("passwordConfirm", {
                  required: "비밀번호 확인을 입력해주세요",
                  validate: (value) =>
                    value === watch("password") ||
                    "비밀번호가 일치하지 않습니다",
                })}
                error={errors.passwordConfirm?.message}
              />
              <Button type="submit" fullWidth>
                가입하기
              </Button>
            </div>
          )}

          <div className="text-center">
            <span className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
            </span>
            <Link
              to="/auth/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
