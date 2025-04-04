// src/components/layout/MainHeader.tsx
import { Link, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import SearchBar from "../common/SearchBar";
import { DropState } from "@/store/collection";
// import { ThemeToggle } from "@/components/common/ThemeToggle"; - 주석 처리된 상태 유지
import { useAuth } from "@/hooks/useAuth";

export default function MainHeader() {
  const { logout } = useAuth();
  const location = useLocation();
  const [, setSort] = useRecoilState(DropState);

  const getCurrentType = () => {
    if (location.pathname.includes("/collections")) return "collection";
    if (location.pathname.includes("/references")) return "reference";
    return "collection";
  };

  const shouldShowSearchBar = () => {
    const hideSearchBarPatterns = [
      /\/collections\/[^/]+$/, // /collections/:id
      /\/references\/[^/]+$/, // /references/:id
      /\/references\/[^/]+\/edit$/, // /references/:id/edit
      /\/references\/new$/, // /references/new
    ];

    return !hideSearchBarPatterns.some((pattern) =>
      pattern.test(location.pathname)
    );
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleReset = () => {
    setSort({
      sortType: "latest",
      searchType: "all",
      searchWord: "",
      collections: [],
    });
  };

  return (
    <header className="bg-white dark:bg-dark-bg shadow-sm rounded-bl-[48px] rounded-br-[48px] shadow-[0px_4px_10px_0px_rgba(181,184,181,0.10)] dark:shadow-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* PC 버전 헤더 - flexbox를 사용하여 3등분 레이아웃 구성 */}
        <div className="hidden sm:flex items-center h-16 mt-4">
          {/* 왼쪽 영역: 로고 */}
          <div className="flex-1">
            <Link to="/" className="flex items-center" onClick={handleReset}>
              <img
                src="/images/icon_with_text.svg"
                alt="RefHub"
                className="h-8"
              />
            </Link>
          </div>
          
          {/* 중앙 영역: 네비게이션 */}
          <div className="flex-1 flex justify-center space-x-8">
            <Link
              to="/collections"
              className={`text-xl ${
                getCurrentType() === "collection"
                  ? "text-primary dark:text-primary font-bold"
                  : "text-gray-600 dark:text-gray-300 font-medium"
              }`}
              onClick={handleReset}
            >
              나의 컬렉션
            </Link>
            <Link
              to="/references"
              className={`text-xl ${
                getCurrentType() === "reference"
                  ? "text-primary dark:text-primary font-bold"
                  : "text-gray-600 dark:text-gray-300 font-medium"
              }`}
              onClick={handleReset}
            >
              전체 레퍼런스
            </Link>
          </div>
          
          {/* 오른쪽 영역: 로그아웃 버튼 */}
          <div className="flex-1 flex justify-end">
            {/* <ThemeToggle /> - 주석 처리된 상태 유지 */}
            <button
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 모바일 버전 레이아웃 - 기존 코드 유지 */}
        <div className="flex flex-col sm:hidden">
          {/* 모바일: 로고와 버튼 */}
          <div className="flex justify-between items-center w-full pt-4">
            <Link to="/" className="flex items-center" onClick={handleReset}>
              <img
                src="/images/icon_with_text.svg"
                alt="RefHub"
                className="h-8"
              />
            </Link>

            {/* 모바일 전용: 우측 버튼 */}
            <div className="flex items-center space-x-4">
              {/* <ThemeToggle /> - 주석 처리된 상태 유지 */}
              <button
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 모바일 전용: 하단 네비게이션 */}
          <nav className="flex justify-center space-x-8 mt-4 mb-2">
            <Link
              to="/collections"
              className={`text-xl ${
                getCurrentType() === "collection"
                  ? "text-primary dark:text-primary font-bold"
                  : "text-gray-600 dark:text-gray-300 font-medium"
              }`}
              onClick={handleReset}
            >
              나의 컬렉션
            </Link>
            <Link
              to="/references"
              className={`text-xl ${
                getCurrentType() === "reference"
                  ? "text-primary dark:text-primary font-bold"
                  : "text-gray-600 dark:text-gray-300 font-medium"
              }`}
              onClick={handleReset}
            >
              전체 레퍼런스
            </Link>
          </nav>
        </div>

        {/* SearchBar 컴포넌트 - 변경 없음 */}
        {shouldShowSearchBar() && (
          <div className="mt-2 sm:mt-0">
            <SearchBar type={getCurrentType()} />
          </div>
        )}
      </div>
    </header>
  );
}