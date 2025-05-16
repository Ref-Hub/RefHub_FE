// src/components/common/ProfileDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProfileDropdownProps {
  profileImageUrl?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ profileImageUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // 프로필 이미지 URL 또는 기본 이미지
  const profileImage = profileImageUrl || "/images/default-profile.svg";

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 마이페이지로 이동
  const handleMyPageClick = () => {
    navigate("/mypage");
    setIsOpen(false);
  };

  // 로그아웃 처리
  const handleLogoutClick = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-200"
      >
        <img 
          src={profileImage} 
          alt="프로필" 
          className="w-full h-full object-cover"
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border z-20">
          <div className="py-2">
            <button
              onClick={handleMyPageClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover"
            >
              <User className="mr-2 h-4 w-4" />
              마이페이지
            </button>
            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;