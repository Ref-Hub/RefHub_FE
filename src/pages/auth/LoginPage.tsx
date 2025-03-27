// src/pages/auth/LoginPage.tsx
import { useState, useCallback, useEffect } from "react"; 
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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>();



  const emailValue = watch("email");
  const passwordValue = watch("password");

  // 이메일 형식 검증 함수
  const validateEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  // 이메일 값이 변경될 때마다 유효성 검사
  useEffect(() => {
    if (emailValue) {
      const isValid = validateEmail(emailValue);
      if (!isValid) {
        setEmailError("이메일 형식이 올바르지 않습니다");
      } else {
        setEmailError(null);
      }
    } else {
      setEmailError(null);
    }
  }, [emailValue]);

  // 비밀번호 입력 필드 변경 시 관련 에러 초기화
  useEffect(() => {
    setPasswordError(null);
  }, [passwordValue]);

  const isButtonActive =
    emailValue && validateEmail(emailValue) && passwordValue?.length > 0;

  const onSubmit = useCallback(
    async (data: LoginForm) => {
      if (isLoading) return;

      // 에러 상태 초기화
      setLoginError(null);
      setEmailError(null);
      setPasswordError(null);
      setIsLoading(true);

      try {
        await authService.login(data, rememberMe);
        setShareModal((prev) => ({ ...prev, userEmail: data.email }));
        navigate("/");
        showToast("로그인이 완료되었습니다.", "success");
      } catch (error) {
        if (error instanceof Error) {
          const errorMessage = error.message;

          // 에러 메시지 분류
          if (
            errorMessage.includes("이메일") ||
            errorMessage.includes("등록되지 않은 계정")
          ) {
            setEmailError(errorMessage);
          } else if (errorMessage.includes("비밀번호")) {
            setPasswordError(errorMessage);
          } else if (
            errorMessage.includes("계정 정보") ||
            errorMessage.includes("회원가입")
          ) {
            setLoginError(errorMessage);
          } else {
            setLoginError(errorMessage);
          }
        } else {
          setLoginError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, rememberMe, showToast, isLoading, setShareModal]
  );

  return (
    <div className="min-h-screen flex max-h-screen overflow-hidden">
      {/* Left Section */}
      <div className="hidden lg:block lg:w-1/2 flex-shrink-0 overflow-hidden">
        <img
          src="/images/login-intro-bg.svg"
          alt="RefHub Introduction"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-[#f9faf9] flex items-center justify-center overflow-y-auto py-4">
        <div className="w-full max-w-[520px] px-4">
          <h2 className="text-center text-2xl font-bold text-primary mb-8 sm:mb-12">
            로그인
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 bg-white p-6 sm:p-8 rounded-lg"
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
                      message: "이메일 형식이 올바르지 않습니다",
                    },
                  })}
                  error={emailError || errors.email?.message}
                  className="h-12 sm:h-14"
                  emailOnly
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
                  error={passwordError || errors.password?.message}
                  className="h-12 sm:h-14"
                  passwordOnly
                />
              </div>
            </div>

            <div className="flex items-center justify-between my-4 sm:my-6">
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
                w-full h-12 sm:h-14 rounded-lg font-medium transition-colors duration-200
                ${
                  isButtonActive && !isLoading
                    ? "bg-primary hover:bg-primary-dark text-white"
                    : "bg-[#8A8D8A] text-white cursor-not-allowed"
                }
              `}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>

            {/* 일반 에러 메시지 표시 영역 */}
            {loginError && (
              <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                <p className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  {loginError}
                </p>
              </div>
            )}
          </form>

          <div className="text-center mt-4 sm:mt-6">
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
