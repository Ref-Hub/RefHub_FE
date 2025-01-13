// src/pages/auth/PasswordResetPage.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import type { PasswordResetForm } from "@/types/auth";

type ResetStep = "EMAIL" | "VERIFY" | "NEW_PASSWORD";

export default function PasswordResetPage() {
  const [currentStep, setCurrentStep] = useState<ResetStep>("EMAIL");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<PasswordResetForm>({
    mode: "onChange",
  });

  const email = watch("email");
  const verificationCode = watch("verificationCode");
  const newPassword = watch("newPassword");
  const newPasswordConfirm = watch("newPasswordConfirm");
  
  const isEmailValid = email && !errors.email;
  const isVerificationComplete = verificationCode?.length === 6;
  const isPasswordValid = 
    newPassword && 
    newPasswordConfirm && 
    !errors.newPassword && 
    !errors.newPasswordConfirm;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerificationSend = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;

    setIsVerificationSent(true);
    setCountdown(180); // 3분
    // TODO: API 연동 후 실제 이메일 발송 처리
    console.log("인증번호가 발송되었습니다.");
  };

  const handleVerifyCode = async () => {
    const isValid = await trigger("verificationCode");
    if (!isValid) return;
    
    setCurrentStep("NEW_PASSWORD");
  };

  const onSubmit = async (data: PasswordResetForm) => {
    // TODO: API 연동 후 실제 비밀번호 변경 처리
    console.log(data);
  };

  return (
    <div className="mt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          비밀번호 변경
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="abc@refhub.com"
              {...register("email", {
                required: "이메일을 입력해주세요",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "올바른 이메일 형식이 아닙니다",
                },
              })}
              error={errors.email?.message}
              disabled={isVerificationSent}
              rightElement={
                <Button
                  type="button"
                  variant={isEmailValid ? "primary" : "secondary"}
                  size="sm"
                  onClick={handleVerificationSend}
                  disabled={!isEmailValid || countdown > 0}
                >
                  인증번호 전송
                </Button>
              }
            />

            {isVerificationSent && (
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
                  maxLength: {
                    value: 6,
                    message: "인증번호는 6자리입니다",
                  },
                })}
                error={errors.verificationCode?.message}
                helperText={countdown > 0 ? `남은 시간: ${formatTime(countdown)}` : ""}
              />
            )}

            {isVerificationSent && (
              <Button 
                type="button" 
                variant={isVerificationComplete ? "primary" : "secondary"}
                onClick={handleVerifyCode}
                disabled={!isVerificationComplete}
                fullWidth
              >
                다음
              </Button>
            )}

            {currentStep === "NEW_PASSWORD" && (
              <>
                <Input
                  label="새 비밀번호"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  {...register("newPassword", {
                    required: "새 비밀번호를 입력해주세요",
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,12}$/,
                      message: "영문, 숫자, 특수문자 2종류 이상 조합 (8-12자)",
                    },
                  })}
                  error={errors.newPassword?.message}
                  helperText="영문, 숫자, 특수문자 2종류 이상 조합 (8-12자)"
                />
                <Input
                  label="새 비밀번호 재입력"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  {...register("newPasswordConfirm", {
                    required: "비밀번호 확인을 입력해주세요",
                    validate: (value) =>
                      value === watch("newPassword") ||
                      "비밀번호가 일치하지 않습니다",
                  })}
                  error={errors.newPasswordConfirm?.message}
                />
                <Button 
                  type="submit" 
                  variant={isPasswordValid ? "primary" : "secondary"}
                  disabled={!isPasswordValid}
                  fullWidth
                >
                  비밀번호 변경
                </Button>
              </>
            )}
          </div>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}