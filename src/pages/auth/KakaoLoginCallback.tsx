// src/pages/auth/KakaoLoginCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { userState, authUtils } from "@/store/auth";
import { useToast } from "@/contexts/useToast";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload, User } from "@/types/auth";
import KakaoAccountLinkModal from "@/components/auth/KakaoAccountLinkModal";
import AccountRecoveryModal from "@/components/auth/AccountRecoveryModal"; // 👈 추가

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
  const [, setLoading] = useState(true);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false); // 👈 복구 모달 상태 추가
  const [linkModalData, setLinkModalData] = useState<{
    show: boolean;
    email: string;
    name: string;
    profileImage?: string;
  }>({
    show: false,
    email: "",
    name: "",
    profileImage: "",
  });

  // 👈 복구 모달 확인 핸들러 추가
  const handleRecoveryModalConfirm = () => {
    setShowRecoveryModal(false);
    showToast("카카오 로그인이 완료되었습니다.", "success");
    navigate("/collections", { replace: true });
  };

  useEffect(() => {
    const processKakaoLogin = async () => {
      try {
        // URL에서 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const linkRequired = urlParams.get("link") === "true";
        const recovered = urlParams.get("recovered") === "true"; // 👈 복구 상태 파라미터 추가

        // 계정 연동이 필요한 경우
        if (linkRequired) {
          const email = urlParams.get("email") || "";
          const name = urlParams.get("name") || "";
          const profileImage = urlParams.get("profileImage") || undefined;

          if (email) {
            setLinkModalData({
              show: true,
              email,
              name: decodeURIComponent(name),
              profileImage: profileImage
                ? decodeURIComponent(profileImage)
                : undefined,
            });
            setLoading(false);
            return;
          }
        }

        // 일반 카카오 로그인 처리 (토큰이 있는 경우)
        if (token) {
          // 토큰 저장
          authUtils.setToken(token);

          // 자동 로그인 활성화 - 카카오 로그인은 기본적으로 자동 로그인으로 설정
          authUtils.setRememberMe(true);

          // 토큰에서 사용자 정보 추출
          try {
            const decoded = jwtDecode<TokenPayload>(token);
            const userData: User = {
              id: decoded.id,
              email: decoded.email,
              name: decoded.email.split("@")[0], // 이메일에서 임시로 이름 추출
            };

            // 사용자 정보 저장
            authUtils.setStoredUser(userData);
            setUser(userData);
          } catch (decodeError) {
            console.error("토큰 디코딩 실패:", decodeError);
          }

          // GA4 이벤트 전송
          if (typeof window.gtag === "function") {
            window.gtag("event", "login_success", {
              method: "kakao",
            });
          }

          // 👈 복구 상태 체크
          if (recovered) {
            setShowRecoveryModal(true);
          } else {
            // 로그인 성공 메시지 표시
            showToast("카카오 로그인이 완료되었습니다.", "success");

            // 홈페이지로 리디렉션
            setTimeout(() => {
              navigate("/collections", { replace: true });
            }, 100);
          }
        } else {
          // 토큰이 없는 경우
          console.error("카카오 로그인 처리 실패: 토큰이 없습니다");

          // 토큰이 없고 연동 요청도 아닌 경우 로그인 페이지로 리디렉션
          if (!linkRequired) {
            showToast("로그인 처리 중 오류가 발생했습니다.", "error");
            setTimeout(() => {
              navigate("/auth/login", { replace: true });
            }, 100);
          }
        }
      } catch (error) {
        console.error("카카오 로그인 처리 실패:", error);

        showToast("로그인 처리 중 오류가 발생했습니다.", "error");

        // 오류 발생 시 로그인 페이지로 리디렉션
        setTimeout(() => {
          navigate("/auth/login", { replace: true });
        }, 100);
      } finally {
        setLoading(false);
      }
    };

    processKakaoLogin();
  }, [navigate, showToast, setUser]);

  // 연동 모달 닫기 핸들러
  const handleCloseModal = () => {
    setLinkModalData({ show: false, email: "", name: "", profileImage: "" });
    navigate("/auth/login", { replace: true });
  };

  // 👈 복구 모달이 표시되는 경우
  if (showRecoveryModal) {
    return (
      <AccountRecoveryModal 
        isOpen={showRecoveryModal}
        onConfirm={handleRecoveryModalConfirm}
      />
    );
  }

  // 계정 연동 팝업이 표시되는 경우 로딩 화면을 표시하지 않음
  if (linkModalData.show) {
    return (
      <KakaoAccountLinkModal
        email={linkModalData.email}
        name={linkModalData.name}
        profileImage={linkModalData.profileImage}
        onClose={handleCloseModal}
      />
    );
  }

  // 로딩 화면 표시
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
      </div>
    </div>
  );
}
