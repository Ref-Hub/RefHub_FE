// src/components/layout/MainHeader.tsx
import { Link, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import SearchBar from "../common/SearchBar";
import { DropState } from "@/store/collection";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export default function MainHeader() {
  const { logout } = useAuth(); // useAuth 훅에서 logout 함수 가져오기
  const location = useLocation();
  const [, setSort] = useRecoilState(DropState);

  // URL 경로에 따라 현재 타입 결정
  const getCurrentType = () => {
    if (location.pathname.includes("/collections")) return "collection";
    if (location.pathname.includes("/references")) return "reference";
    return "collection";
  };

  // SearchBar를 표시할지 결정하는 함수
  const shouldShowSearchBar = () => {
    // SearchBar를 숨길 경로 패턴들
    const hideSearchBarPatterns = [
      /\/collections\/[^/]+$/, // /collections/:id
      /\/references\/[^/]+$/, // /references/:id
      /\/references\/[^/]+\/edit$/, // /references/:id/edit
      /\/references\/new$/, // /references/new
    ];

    // 현재 경로가 위의 패턴들 중 하나와 일치하면 SearchBar를 숨김
    return !hideSearchBarPatterns.some((pattern) =>
      pattern.test(location.pathname)
    );
  };

  const handleLogout = async () => {
    // 수정된 코드: useAuth의 logout 함수 호출
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
        <div className="flex items-start justify-between sm:h-16 h-20 mt-4">
          <Link to="/" className="flex items-center" onClick={handleReset}>
            <img
              src="/images/icon_with_text.svg"
              alt="RefHub"
              className="h-8"
            />
          </Link>
          <nav className="flex w-full justify-center space-x-8 absolute left-1/2 sm:top-5 top-[70px] transform -translate-x-1/2">
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
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              로그아웃
            </button>
          </div>
        </div>
        <div>
          {shouldShowSearchBar() && <SearchBar type={getCurrentType()} />}
        </div>
      </div>
    </header>
  );
}
