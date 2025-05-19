// src/pages/auth/KakaoLoginCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { authUtils } from "@/store/auth";
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
  const { setUser } = useAuth();

  useEffect(() => {
    const processKakaoLogin = async () => {
      try {
        // URL에서 토큰 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
          throw new Error("로그인 정보가 없습니다");
        }

        // 토큰 저장
        authUtils.setToken(token);

        // 토큰에서 사용자 정보 추출
        const decoded = jwtDecode<TokenPayload>(token);
        const userData: User = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.email.split("@")[0], // 이메일에서 임시로 이름 추출
        };

        // 사용자 정보 설정
        authUtils.setStoredUser(userData);
        setUser(userData);

        // 로그인 성공 메시지 표시
        showToast("카카오 로그인이 완료되었습니다.", "success");

        // 홈페이지로 리디렉션
        navigate("/collections", { replace: true });

        // GA4 이벤트 전송 (gtag가 있는 경우에만)
        if (typeof window.gtag === "function") {
          window.gtag("event", "login_success", {
            method: "kakao",
          });
        }
      } catch (error) {
        console.error("카카오 로그인 처리 실패:", error);
        showToast("카카오 로그인 처리 중 오류가 발생했습니다.", "error");
        navigate("/auth/login", { replace: true });
      }
    };

    processKakaoLogin();
  }, [navigate, showToast, setUser]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">카카오 로그인 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
}
