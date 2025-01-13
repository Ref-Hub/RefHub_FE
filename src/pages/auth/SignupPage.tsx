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
  const [verificationSent, setVerificationSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<SignupForm>({
    mode: "onChange",
  });

  const handleVerificationSend = async () => {
    const isValid = await trigger(["name", "email"]);
    if (!isValid) return;
    
    setVerificationSent(true);
    // TODO: API 연동 후 실제 이메일 발송 처리
    alert("인증번호가 발송되었습니다.");
  };

  const handleVerifyCode = async () => {
    const isValid = await trigger("verificationCode");
    if (!isValid) return;
    
    // TODO: API 연동 후 실제 인증번호 확인
    setCurrentStep("PASSWORD");
  };

  const onSubmit = async (data: SignupForm) => {
    console.log("Form submitted:", data);
    // TODO: API 연동 후 실제 회원가입 처리
  };

  const verificationCode = watch("verificationCode");
  const isVerificationComplete = verificationCode?.length === 6;

  return (
    <div className="mt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          회원가입
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="이름"
              placeholder="이름을 입력하세요"
              {...register("name", {
                required: "이름을 입력해주세요",
              })}
              error={errors.name?.message}
              disabled={verificationSent}
            />
            <Input
              label="이메일"
              placeholder="abc@refhub.com"
              {...register("email", {
                required: "이메일을 입력해주세요",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "올바른 이메일 형식이 아닙니다",
                },
              })}
              error={errors.email?.message}
              disabled={verificationSent}
              rightElement={
                <Button
                  type="button"
                  variant={verificationSent ? "secondary" : "primary"}
                  size="sm"
                  onClick={handleVerificationSend}
                  disabled={verificationSent}
                >
                  인증번호 전송
                </Button>
              }
            />

            {verificationSent && (
              <>
                <Input
                  label="인증번호"
                  placeholder="인증번호 6자리를 입력하세요"
                  maxLength={6}
                  {...register("verificationCode", {
                    required: "인증번호를 입력해주세요",
                    minLength: {
                      value: 6,
                      message: "인증번호는 6자리입니다",
                    },
                  })}
                  error={errors.verificationCode?.message}
                />
                <Button
                  type="button"
                  variant={isVerificationComplete ? "primary" : "secondary"}
                  onClick={handleVerifyCode}
                  disabled={!isVerificationComplete}
                  fullWidth
                >
                  다음
                </Button>
              </>
            )}

            {currentStep === "PASSWORD" && (
              <>
                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  {...register("password", {
                    required: "비밀번호를 입력해주세요",
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,12}$/,
                      message: "영문, 숫자, 특수문자 2종류 이상 조합 (8-12자)",
                    },
                  })}
                  error={errors.password?.message}
                  helperText="영문, 숫자, 특수문자 2종류 이상 조합 (8-12자)"
                />
                <Input
                  label="비밀번호 재입력"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  {...register("passwordConfirm", {
                    required: "비밀번호 확인을 입력해주세요",
                    validate: (value) =>
                      value === watch("password") || "비밀번호가 일치하지 않습니다",
                  })}
                  error={errors.passwordConfirm?.message}
                />
                <Button type="submit" fullWidth>
                  회원가입
                </Button>
              </>
            )}
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">이미 계정이 있으신가요? </span>
            <Link
              to="/auth/login"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}