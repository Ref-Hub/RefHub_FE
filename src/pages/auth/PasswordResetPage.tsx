import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useToast } from "@/contexts/useToast";
import { authService } from "@/services/auth";
import type { PasswordResetForm } from "@/types/auth";

type ResetStep = "EMAIL" | "VERIFY" | "NEW_PASSWORD";

export default function PasswordResetPage() {
  const [currentStep, setCurrentStep] = useState<ResetStep>("EMAIL");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    clearErrors,
  } = useForm<PasswordResetForm>({
    mode: "onChange",
  });

  const email = watch("email");
  const verificationCode = watch("verificationCode");
  const newPassword = watch("newPassword");
  const newPasswordConfirm = watch("newPasswordConfirm");
  
  const isEmailValid = email && !errors.email;
  const isVerificationComplete = verificationCode?.length === 6 && !errors.verificationCode;
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

  const handleVerificationSend = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;

    try {
      setIsVerificationSent(true);
      setCountdown(180); // 3분
      clearErrors("verificationCode");
    } catch (error) {
      console.error('인증번호 발송 실패:', error);
    }
  };

  const handleVerifyCode = async () => {
    const isValid = await trigger("verificationCode");
    if (!isValid) return;
    
    try {
      // TODO: API 연동
      setCurrentStep("NEW_PASSWORD");
    } catch (error) {
      console.error('인증 실패:', error);
    }
  };

  const onSubmit = async (data: PasswordResetForm) => {
    try {
      await authService.resetPassword(data);
      showToast("비밀번호가 변경되었습니다. 다시 로그인해주세요.", "success");
      navigate("/auth/login");
    } catch (error) {
      showToast("비밀번호 변경에 실패했습니다.", "error");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-[60px]">
      <div className="w-[520px]">
        <h1 className="text-[32px] text-center font-bold text-primary mb-8">
          비밀번호 변경
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            {/* 이메일 입력 필드 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                이메일
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
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
                    disabled={isVerificationSent}
                  />
                </div>
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
              {isVerificationSent && (
                <p className="mt-2 text-sm text-primary">
                  인증번호가 발송되었습니다.
                </p>
              )}
            </div>

            {/* 인증번호 입력 필드 */}
            {isVerificationSent && currentStep !== "NEW_PASSWORD" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    인증번호
                  </label>
                  <Input
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
                </div>
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

            {/* 새 비밀번호 입력 필드 */}
            {currentStep === "NEW_PASSWORD" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    새 비밀번호
                  </label>
                  <Input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    className="w-full h-[56px]"
                    {...register("newPassword", {
                      required: "새 비밀번호를 입력해주세요",
                      pattern: {
                        value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,12}$/,
                        message: "영문, 숫자, 특수문자 2종류 이상 조합 (8-12자)",
                      },
                    })}
                    error={errors.newPassword?.message}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    영문, 숫자, 특수문자 2종류 이상 조합 (8-12자)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    새 비밀번호 재입력
                  </label>
                  <Input
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    className="w-full h-[56px]"
                    {...register("newPasswordConfirm", {
                      required: "비밀번호 확인을 입력해주세요",
                      validate: (value) =>
                        value === watch("newPassword") ||
                        "비밀번호가 일치하지 않습니다",
                    })}
                    error={errors.newPasswordConfirm?.message}
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!isPasswordValid}
                  className="w-full h-[56px]"
                >
                  비밀번호 변경
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}