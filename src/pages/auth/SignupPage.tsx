// src/pages/auth/SignupPage.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useToast } from "@/contexts/useToast"; // 경로 수정
import type { SignupForm } from "@/types/auth";

type SignupStep = "INFO" | "VERIFY" | "PASSWORD";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<SignupStep>("INFO");
  const [verificationSent, setVerificationSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { showToast } = useToast();
  
// src/pages/auth/SignupPage.tsx
const {
  register,
  handleSubmit,
  formState: { errors }, // isValid 제거
  watch,
  trigger,
  clearErrors,
} = useForm<SignupForm>({
  mode: "onChange",
});

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerificationSend = async () => {
    const isValid = await trigger(["name", "email"]);
    if (!isValid) return;
    
    setVerificationSent(true);
    setCountdown(180); // 3분
    clearErrors("verificationCode");
  };

  const handleVerifyCode = async () => {
    const isValid = await trigger("verificationCode");
    if (!isValid) return;
    
    // TODO: API 연동 후 실제 인증번호 확인
    setCurrentStep("PASSWORD");
  };

  const onSubmit = async (data: SignupForm) => {
    try {
      // TODO: API 연동 후 실제 회원가입 처리
      console.log("Form submitted:", data);
      showToast("회원가입이 완료되었습니다.", "success");
    } catch {
      showToast("회원가입에 실패했습니다.", "error");
    }
  };

  const email = watch("email");
  const verificationCode = watch("verificationCode");
  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");

  const isEmailValid = email && !errors.email;
  const isVerificationComplete = verificationCode?.length === 6 && !errors.verificationCode;
  const isPasswordValid = password && passwordConfirm && !errors.password && !errors.passwordConfirm;

  const renderVerificationMessage = () => {
    if (!verificationSent) return null;
    if (currentStep === "PASSWORD") {
      return <p className="text-sm text-primary mt-1">인증이 완료되었습니다.</p>;
    }
    return <p className="text-sm text-primary mt-1">인증번호가 발송되었습니다.</p>;
  };

  return (
    <div className="flex justify-center items-center px-4">
      <div className="w-[520px]">
        <h2 className="text-[32px] text-center font-bold text-primary mb-8">회원가입</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* 이름 입력 필드 */}
            <Input
              label="이름"
              placeholder="이름을 입력하세요"
              className="w-full h-[56px]"
              {...register("name", {
                required: "이름을 입력해주세요",
              })}
              error={errors.name?.message}
              disabled={verificationSent}
            />
            
            {/* 이메일 입력 필드 */}
            <div className="space-y-1">
              <div className="flex gap-4">
                <Input
                  label="이메일"
                  placeholder="abc@refhub.com"
                  className="w-[379px] h-[56px]"
                  {...register("email", {
                    required: "이메일을 입력해주세요",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "올바른 이메일 형식이 아닙니다",
                    },
                  })}
                  error={errors.email?.message}
                  disabled={verificationSent}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant={countdown > 0 ? "secondary" : "primary"}
                    onClick={handleVerificationSend}
                    disabled={!isEmailValid || countdown > 0}
                    className="w-[136px] h-[56px] text-base font-medium whitespace-nowrap"
                  >
                    {countdown > 0 
                      ? `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`
                      : "인증번호 전송"
                    }
                  </Button>
                </div>
              </div>
              {renderVerificationMessage()}
            </div>

            {/* 인증번호 입력 필드 */}
            {verificationSent && currentStep !== "PASSWORD" && (
              <div className="space-y-4">
                <Input
                  label="인증번호"
                  placeholder="인증번호 6자리를 입력하세요"
                  className="w-full h-[56px]"
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
                  className="w-full h-[56px]"
                >
                  다음
                </Button>
              </div>
            )}

            {/* 비밀번호 입력 필드 */}
            {currentStep === "PASSWORD" && (
              <div className="space-y-4">
                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  className="w-full h-[56px]"
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
                  className="w-full h-[56px]"
                  {...register("passwordConfirm", {
                    required: "비밀번호 확인을 입력해주세요",
                    validate: (value) =>
                      value === watch("password") || "비밀번호가 일치하지 않습니다",
                  })}
                  error={errors.passwordConfirm?.message}
                />
                <Button 
                  type="submit" 
                  variant={isPasswordValid ? "primary" : "secondary"}
                  className="w-full h-[56px]"
                  disabled={!isPasswordValid}
                >
                  회원가입
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}