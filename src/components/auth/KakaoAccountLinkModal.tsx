// src/components/auth/KakaoAccountLinkModal.tsx
import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import { authService } from "@/services/auth";
import { userState, authUtils } from "@/store/auth";
import { useSetRecoilState } from "recoil";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload, User } from "@/types/auth";

interface KakaoAccountLinkModalProps {
  email: string;
  name: string;
  profileImage?: string;
  onClose: () => void;
}

const KakaoAccountLinkModal: React.FC<KakaoAccountLinkModalProps> = ({
  email,
  name,
  profileImage,
  onClose,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setUser = useSetRecoilState(userState);
  const [isLoading, setIsLoading] = React.useState(false);

  // 카카오 계정 연동 처리 함수
  const handleLinkAccount = async () => {
    try {
      setIsLoading(true);

      // 카카오 계정 연동 API 호출
      const { token, message } = await authService.linkKakaoAccount(
        email,
        name,
        profileImage
      );

      // 토큰에서 사용자 정보 추출
      const decoded = jwtDecode<TokenPayload>(token);
      const userData: User = {
        id: decoded.id,
        email: decoded.email,
        name: name || decoded.email.split("@")[0],
      };

      // 토큰 저장 및 사용자 정보 저장
      authUtils.setToken(token);
      authUtils.setStoredUser(userData);
      authUtils.setRememberMe(true); // 카카오 로그인은 자동 로그인으로 설정
      setUser(userData);

      // 성공 메시지 표시
      showToast(message || "카카오 계정 연동이 완료되었습니다.", "success");

      // 모달 닫기
      onClose();

      // GA4 이벤트 전송 (gtag가 있는 경우에만)
      if (typeof window.gtag === "function") {
        window.gtag("event", "kakao_account_linked", {
          method: "kakao",
        });
      }

      // 컬렉션 페이지로 리디렉션
      navigate("/collections", { replace: true });
    } catch (error) {
      console.error("카카오 계정 연동 실패:", error);

      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("카카오 계정 연동에 실패했습니다.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 계속 로그인 없이 취소하는 경우
  const handleCancel = () => {
    onClose();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6 mx-4"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* 카카오 로고 */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#FEE500] w-14 h-14 rounded-full flex items-center justify-center">
            <svg
              width="28"
              height="26"
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
          </div>
        </div>

        {/* 제목 */}
        <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
          카카오 계정 연동
        </h3>

        {/* 설명 */}
        <p className="text-center text-gray-600 mb-6">
          <span className="font-semibold text-gray-800">{email}</span> 계정이
          이미 존재합니다.
          <br />
          카카오 계정으로 통합하시겠습니까?
        </p>

        {/* 계정 정보 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="프로필"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-sm">
                    {name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800">{name}</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleLinkAccount}
            disabled={isLoading}
            className="w-full py-3 bg-[#FEE500] hover:bg-[#F4DC00] text-[#191919] font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#191919]"
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
            ) : (
              <svg
                className="w-5 h-5 mr-2"
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
            )}
            카카오 계정으로 통합하기
          </button>

          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            취소
          </button>
        </div>

        {/* 안내 메시지 */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          계정을 통합하면 기존 계정의 모든 데이터는 유지되며,
          <br />
          이후 카카오 로그인으로 RefHub를 이용할 수 있습니다.
        </p>
      </motion.div>
    </div>
  );
};

export default KakaoAccountLinkModal;
