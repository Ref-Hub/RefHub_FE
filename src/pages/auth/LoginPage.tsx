// src/pages/auth/LoginPage.tsx
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import { Input } from "@/components/common/Input";
import { authService } from "@/services/auth";
import type { LoginForm } from "@/types/auth";
import { authUtils } from "@/store/auth";

// window.gtag에 대한 전역 타입 정의 추가
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: {
        method?: string;
        [key: string]: any;
      }
    ) => void;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
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

  // 입력 값 변경 시 로그인 오류 초기화
  useEffect(() => {
    if (emailValue || passwordValue) {
      setLoginError(null);
    }
  }, [emailValue, passwordValue]);

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
        localStorage.setItem("email", data.email);

        // 일반 이메일 로그인이므로 현재 로그인한 사용자 정보를 업데이트
        const currentUser = authUtils.getStoredUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            provider: "local" as const,
          };
          authUtils.setStoredUser(updatedUser);
        }

        // GA4 이벤트 전송 (로그인 성공)
        if (typeof window.gtag === "function") {
          window.gtag("event", "login_success", {
            method: "email",
          });
        }

        navigate("/collections");
        showToast("로그인이 완료되었습니다.", "success");
      } catch (error) {
        if (error instanceof Error) {
          const errorMessage = error.message;

          // 에러 메시지 분류
          if (errorMessage.includes("카카오 로그인")) {
            // 카카오 로그인 필요한 계정
            setLoginError(errorMessage);
          } else if (
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

        // GA4 이벤트 전송 (로그인 실패)
        if (typeof window.gtag === "function") {
          window.gtag("event", "login_failure", {
            method: "email",
            error_type:
              loginError || emailError || passwordError || "unknown_error",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      navigate,
      rememberMe,
      showToast,
      isLoading,
      loginError,
      emailError,
      passwordError,
    ]
  );

  // 카카오 로그인 핸들러 함수
  const handleKakaoLogin = useCallback(() => {
    try {
      // 이미 진행 중인 경우 중복 실행 방지
      if (isKakaoLoading) return;

      setIsKakaoLoading(true);

      // 환경에 맞는 백엔드 URL 가져오기
      const backendUrl = import.meta.env.DEV
        ? "http://43.202.152.184:4000"
        : "https://api.refhub.site";

      console.log("카카오 로그인 시도:", backendUrl);

      // GA4 이벤트 전송 (카카오 로그인 시도)
      if (typeof window.gtag === "function") {
        window.gtag("event", "login_start", {
          method: "kakao",
        });
      }

      // 사용자를 카카오 로그인 페이지로 리디렉션
      window.location.href = `${backendUrl}/api/users/kakao`;
    } catch (error) {
      console.error("카카오 로그인 리디렉션 오류:", error);
      showToast("카카오 로그인 페이지로 이동 중 오류가 발생했습니다.", "error");
      setIsKakaoLoading(false);
    }
  }, [showToast, isKakaoLoading]);

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
            className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-md"
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
                  disabled={isLoading || isKakaoLoading}
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
                  autoComplete="current-password"
                  disabled={isLoading || isKakaoLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 checked:bg-primary checked:hover:bg-primary checked:focus:bg-primary"
                  disabled={isLoading || isKakaoLoading}
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
                className="text-sm text-[#676967] hover:text-primary transition-colors"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {/* 로그인 버튼 및 카카오 로그인 버튼 */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={!isButtonActive || isLoading || isKakaoLoading}
                className={`
                  w-full h-12 sm:h-14 rounded-lg font-medium transition-colors duration-200
                  ${
                    isButtonActive && !isLoading && !isKakaoLoading
                      ? "bg-primary hover:bg-primary-dark text-white"
                      : "bg-[#8A8D8A] text-white cursor-not-allowed"
                  }
                `}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  "로그인"
                )}
              </button>

              {/* 카카오 로그인 버튼 추가 */}
              <button
                type="button"
                onClick={handleKakaoLogin}
                disabled={isLoading || isKakaoLoading}
                className="w-full h-12 sm:h-14 rounded-lg font-medium transition-colors duration-200 bg-[#FEE500] hover:bg-[#F4DC00] text-[#191919] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isKakaoLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#191919]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    카카오 로그인 중...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9 0.5C4.30371 0.5 0.5 3.32075 0.5 6.80159C0.5 9.03144 1.95959 11.0105 4.16937 12.1868L3.26713 15.791C3.18344 16.1152 3.54938 16.3717 3.84438 16.1748L8.14979 13.397C8.42616 13.4272 8.70998 13.4425 9 13.4425C13.6963 13.4425 17.5 10.6218 17.5 6.80159C17.5 3.32075 13.6963 0.5 9 0.5Z"
                          fill="black"
                        />
                      </svg>
                    </span>
                    카카오 로그인
                  </>
                )}
              </button>
            </div>

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
              className="text-primary hover:text-primary-dark text-sm transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
