// src/pages/auth/KakaoLoginCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil"; // useRecoilState에서 변경
import { userState, authUtils } from "@/store/auth";
import { useToast } from "@/contexts/useToast";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload, User } from "@/types/auth";

// window.gtag에 대한 전역 타입 정의
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

export default function KakaoLoginCallback() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setUser = useSetRecoilState(userState); // useRecoilState에서 변경
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const processKakaoLogin = async () => {
      try {
        // 전체 URL 로깅
        console.log("🔍 [Kakao Callback] 현재 URL:", window.location.href);
        console.log("🔍 [Kakao Callback] 쿼리 문자열:", window.location.search);

        setIsProcessing(true);

        // URL에서 토큰 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        // 디버깅 정보 저장
        setDebugInfo({
          url: window.location.href,
          hasToken: !!token,
          currentTime: new Date().toISOString(),
        });

        console.log("🔍 [Kakao Callback] 토큰 존재 여부:", !!token);

        if (!token) {
          console.error("🔍 [Kakao Callback] 토큰이 없습니다!");
          throw new Error("로그인 정보가 없습니다");
        }

        // 토큰 저장
        console.log("🔍 [Kakao Callback] 토큰 저장 시도");
        authUtils.setToken(token);

        // 저장 확인
        const savedToken = authUtils.getToken();
        console.log("🔍 [Kakao Callback] 토큰 저장 확인:", !!savedToken);

        if (!savedToken) {
          console.error("🔍 [Kakao Callback] 토큰 저장 실패!");
          throw new Error("토큰 저장에 실패했습니다");
        }

        // 자동 로그인 활성화 - 카카오 로그인은 기본적으로 자동 로그인으로 설정
        authUtils.setRememberMe(true);
        console.log("🔍 [Kakao Callback] 자동 로그인 설정 완료");

        // 토큰에서 사용자 정보 추출 시도
        console.log("🔍 [Kakao Callback] 토큰 디코딩 시도");
        let userData: User | null = null;

        try {
          const decoded = jwtDecode<TokenPayload>(token);
          console.log("🔍 [Kakao Callback] 토큰 디코딩 성공:", decoded);

          userData = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.email.split("@")[0], // 이메일에서 임시로 이름 추출
          };

          console.log("🔍 [Kakao Callback] 사용자 데이터 생성:", userData);
        } catch (decodeError) {
          console.error("🔍 [Kakao Callback] 토큰 디코딩 실패:", decodeError);
          throw new Error("토큰에서 사용자 정보를 추출할 수 없습니다");
        }

        // 사용자 정보 저장
        if (userData) {
          console.log("🔍 [Kakao Callback] 사용자 정보 저장 시도");
          authUtils.setStoredUser(userData);
          setUser(userData);

          // 저장 확인
          const storedUser = authUtils.getStoredUser();
          console.log(
            "🔍 [Kakao Callback] 사용자 정보 저장 확인:",
            !!storedUser
          );

          if (!storedUser) {
            console.error("🔍 [Kakao Callback] 사용자 정보 저장 실패!");
            throw new Error("사용자 정보 저장에 실패했습니다");
          }
        }

        // 로그인 성공 메시지 표시
        console.log("🔍 [Kakao Callback] 로그인 성공 메시지 표시");
        showToast("카카오 로그인이 완료되었습니다.", "success");

        // 로컬 스토리지 상태 확인
        console.log("🔍 [Kakao Callback] 로컬 스토리지 상태:", {
          accessToken: !!localStorage.getItem("accessToken"),
          user: !!localStorage.getItem("user"),
          rememberMe: localStorage.getItem("remember-me"),
        });

        // 홈페이지로 리디렉션
        console.log("🔍 [Kakao Callback] 컬렉션 페이지로 리디렉션 시도");

        // 지연 후 리디렉션 (상태가 완전히 업데이트될 시간을 주기 위해)
        setTimeout(() => {
          navigate("/collections", { replace: true });
        }, 500);

        // GA4 이벤트 전송 (gtag가 있는 경우에만)
        if (typeof window.gtag === "function") {
          window.gtag("event", "login_success", {
            method: "kakao",
          });
        }
      } catch (error) {
        console.error("🔍 [Kakao Callback] 카카오 로그인 처리 실패:", error);
        setError(
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다"
        );
        showToast("카카오 로그인 처리 중 오류가 발생했습니다.", "error");

        // 3초 후 로그인 페이지로 리디렉션
        setTimeout(() => {
          navigate("/auth/login", { replace: true });
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processKakaoLogin();
  }, [navigate, showToast, setUser]);

  // 디버깅을 위한 컴포넌트 렌더링
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">
                카카오 로그인 처리 중...
              </h2>
              <p className="text-gray-600 mb-4">잠시만 기다려 주세요.</p>
            </>
          ) : error ? (
            <>
              <div className="text-red-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">로그인 오류</h2>
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-gray-500 mb-4">
                잠시 후 로그인 페이지로 이동합니다...
              </p>
            </>
          ) : (
            <>
              <div className="text-green-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">로그인 성공!</h2>
              <p className="text-gray-600 mb-4">
                컬렉션 페이지로 이동합니다...
              </p>
            </>
          )}

          {/* 디버깅 정보 표시 (개발 모드에서만) */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-left text-xs overflow-auto max-h-48">
              <p className="font-semibold mb-1">디버깅 정보:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              <p className="font-semibold mt-2 mb-1">로컬 스토리지:</p>
              <pre>
                {JSON.stringify(
                  {
                    accessToken: !!localStorage.getItem("accessToken"),
                    user: localStorage.getItem("user") ? "있음" : "없음",
                    rememberMe: localStorage.getItem("remember-me"),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
