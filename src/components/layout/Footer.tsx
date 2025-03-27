// src/components/layout/Footer.tsx
import { useState } from "react";
import { Mail, Instagram } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { alertState } from "@/store/collection";

export default function Footer() {
  const [isLoading] = useState(false);
  const setAlert = useSetRecoilState(alertState);

  const handleWithdrawal = () => {
    // 첫 번째 Alert: 탈퇴 확인 여부
    setAlert({
      type: "withdrawal",
      massage:
        "정말 탈퇴하시겠습니까?\n등록된 컬렉션 및 레퍼런스가 모두 삭제됩니다.",
      isVisible: true,
      ids: [],
      title: "",
    });
  };
  return (
    <footer className="bg-[#F9FAF9] dark:bg-dark-bg mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle separator */}
        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-6"></div>

        {/* First line: Logo and links */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          {/* Logo */}
          <div className="mb-4 sm:mb-0">
            <img
              src="/images/icon_with_text.svg"
              alt="RefHub"
              className="h-8"
            />
          </div>

          {/* Links - right aligned */}
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <a
              href="https://psychedelic-crustacean-955.notion.site/1bbfa429e6f7804d9782d2b439cb0a29"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              이용약관
            </a>
            <a
              href="https://psychedelic-crustacean-955.notion.site/1bbfa429e6f78078a633dac2653b3dec"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              개인정보처리방침
            </a>
            <button
              onClick={handleWithdrawal}
              disabled={isLoading}
              className="underline hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? "처리 중..." : "탈퇴하기"}
            </button>
          </div>
        </div>

        {/* Second line: Email/Instagram and copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          {/* Email and Instagram */}
          <div className="flex items-center gap-6 mb-4 sm:mb-0">
            <div className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
              <Mail className="w-4 h-4 mr-2" />
              <a href="mailto:refhub0@gmail.com" className="text-sm">
                refhub0@gmail.com
              </a>
            </div>

            <a
              href="https://www.instagram.com/_refhub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4 mr-2" />
              <span className="text-sm">refhub0</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-500 dark:text-gray-500">
            © 2025 Refhub. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
