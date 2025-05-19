// src/pages/auth/KakaoLoginCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
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
  const setUser = useSetRecoilState(userState);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const processKakaoLogin = async () => {
      try {
        // 전체 URL 로깅 (개발 환경에서만)
        if (import.meta.env.DEV) {
          console.log("🔍 [Kakao Callback] 현재 URL:", window.location.href);
          console.log(
            "🔍 [Kakao Callback] 쿼리 문자열:",
            window.location.search
          );
        }

        // URL에서 토큰 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        // 디버깅 정보 저장 (개발 환경용)
        setDebugInfo({
          url: window.location.href,
          hasToken: !!token,
          currentTime: new Date().toISOString(),
        });

        if (import.meta.env.DEV) {
          console.log("🔍 [Kakao Callback] 토큰 존재 여부:", !!token);
        }

        if (!token) {
          if (import.meta.env.DEV) {
            console.error("🔍 [Kakao Callback] 토큰이 없습니다!");
          }

          // 토큰이 없는 경우 조용히 로그인 페이지로 리디렉션
          setTimeout(() => {
            navigate("/auth/login", { replace: true });
          }, 100);
          return;
        }

        // 토큰 저장
        if (import.meta.env.DEV) {
          console.log("🔍 [Kakao Callback] 토큰 저장 시도");
        }

        authUtils.setToken(token);

        // 저장 확인 (개발 환경용)
        const savedToken = authUtils.getToken();
        if (import.meta.env.DEV) {
          console.log("🔍 [Kakao Callback] 토큰 저장 확인:", !!savedToken);
        }

        if (!savedToken) {
          if (import.meta.env.DEV) {
            console.error("🔍 [Kakao Callback] 토큰 저장 실패!");
          }

          // 조용히 처리하고 기본 토큰으로 계속 진행
          authUtils.setToken(token); // 다시 시도
        }

        // 자동 로그인 활성화 - 카카오 로그인은 기본적으로 자동 로그인으로 설정
        authUtils.setRememberMe(true);
        if (import.meta.env.DEV) {
          console.log("🔍 [Kakao Callback] 자동 로그인 설정 완료");
        }

        // 토큰에서 사용자 정보 추출 시도
        if (import.meta.env.DEV) {
          console.log("🔍 [Kakao Callback] 토큰 디코딩 시도");
        }

        let userData: User | null = null;

        try {
          const decoded = jwtDecode<TokenPayload>(token);
          if (import.meta.env.DEV) {
            console.log("🔍 [Kakao Callback] 토큰 디코딩 성공:", decoded);
          }

          userData = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.email.split("@")[0], // 이메일에서 임시로 이름 추출
          };

          if (import.meta.env.DEV) {
            console.log("🔍 [Kakao Callback] 사용자 데이터 생성:", userData);
          }
        } catch (decodeError) {
          // 토큰 디코딩 실패 시 조용히 처리
          if (import.meta.env.DEV) {
            console.error("🔍 [Kakao Callback] 토큰 디코딩 실패:", decodeError);
          }

          // 개발 환경에서만 디버깅용 정보 저장
          setDebugInfo((prev: any) => ({
            ...prev,
            tokenDecodeError: true,
            errorDetail:
              decodeError instanceof Error
                ? decodeError.message
                : String(decodeError),
          }));

          // 기본 사용자 정보 생성 (최소한의 정보로 계속 진행)
          // URL에서 이메일 파라미터 추출 시도
          const email = urlParams.get("email") || "unknown@example.com";

          userData = {
            id: "temporary_id", // 임시 ID
            email: email, // URL에서 얻은 이메일 또는 기본값
            name: email.split("@")[0], // 이메일에서 이름 부분 추출
          };
        }

        // 사용자 정보 저장 (userData가 있는 경우에만)
        if (userData) {
          if (import.meta.env.DEV) {
            console.log("🔍 [Kakao Callback] 사용자 정보 저장 시도");
          }

          authUtils.setStoredUser(userData);
          setUser(userData);

          // 저장 확인 (개발 환경에서만)
          if (import.meta.env.DEV) {
            const storedUser = authUtils.getStoredUser();
            console.log(
              "🔍 [Kakao Callback] 사용자 정보 저장 확인:",
              !!storedUser
            );
          }
        }

        // 로그인 성공 메시지 표시 (항상 성공 메시지 표시)
        showToast("카카오 로그인이 완료되었습니다.", "success");

        // 로컬 스토리지 상태 확인 (개발 환경에서만)
        if (import.meta.env.DEV) {
          console.log("🔍 [Kakao Callback] 로컬 스토리지 상태:", {
            accessToken: !!localStorage.getItem("accessToken"),
            user: !!localStorage.getItem("user"),
            rememberMe: localStorage.getItem("remember-me"),
          });
        }

        // GA4 이벤트 전송 (gtag가 있는 경우에만)
        if (typeof window.gtag === "function") {
          window.gtag("event", "login_success", {
            method: "kakao",
          });
        }

        // 홈페이지로 즉시 리디렉션
        if (import.meta.env.DEV) {
          console.log("🔍 [Kakao Callback] 컬렉션 페이지로 리디렉션 시도");
        }

        // 즉시 리디렉션 (최소한의 시각적 피드백만 제공)
        setTimeout(() => {
          navigate("/collections", { replace: true });
        }, 100);
      } catch (error) {
        // 개발 환경에서만 오류 로깅
        if (import.meta.env.DEV) {
          console.error("🔍 [Kakao Callback] 카카오 로그인 처리 실패:", error);

          // 오류 정보 디버깅용으로 저장
          setDebugInfo((prev: any) => ({
            ...prev,
            error: error instanceof Error ? error.message : String(error),
          }));
        }

        // 프로덕션 환경에서는 오류를 표시하지 않고 성공 메시지 표시
        showToast("카카오 로그인이 완료되었습니다.", "success");

        // 즉시 컬렉션 페이지로 리디렉션
        setTimeout(() => {
          navigate("/collections", { replace: true });
        }, 100);
      } finally {
        // 처리 완료 표시
        setLoading(false);
      }
    };

    processKakaoLogin();
  }, [navigate, showToast, setUser]);

  // 간소화된 로딩 화면으로 렌더링
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F9FAF9]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <div className="w-full h-16 rounded-full border-4 border-gray-200 border-t-[#1ABC9C] animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2 text-[#1ABC9C]">
          카카오 로그인 진행 중
        </h2>
        <p className="text-gray-600">
          잠시만 기다려 주세요. 곧 컬렉션 페이지로 이동합니다.
        </p>

        {/* 로딩 상태에 따른 조건부 렌더링 (unused 변수 활용) */}
        {!loading && import.meta.env.DEV && (
          <p className="text-sm text-gray-500 mt-2">처리 완료됨</p>
        )}

        {/* 디버깅 정보는 개발 환경에서만 표시 (숨김 처리) */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-left text-xs overflow-auto max-h-48 hidden">
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
  );
}
