import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState } from "@/store/auth";
import SearchBar from "../common/SearchBar";

export default function MainHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setUser] = useRecoilState(userState);

  // URL 경로에 따라 현재 타입 결정
  const getCurrentType = () => {
    if (location.pathname.includes('/collections')) return 'collection';
    if (location.pathname.includes('/references')) return 'reference';
    return 'collection'; // 기본값
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/auth/login");
  };

  const typeStyles = (id: string) =>
    `text-xl ${
      getCurrentType() === id ? "text-primary font-bold" : "text-gray-600 font-medium"
    }`;

  return (
    <header className="bg-white shadow-sm rounded-bl-[48px] rounded-br-[48px] shadow-[0px_4px_10px_0px_rgba(181,184,181,0.10)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center"
          >
            <img 
              src="/images/icon_with_text.svg" 
              alt="RefHub" 
              className="h-8"
            />
          </Link>
          <nav className="flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/collections"
              className={typeStyles("collection")}
            >
              나의 컬렉션
            </Link>
            <Link
              to="/references"
              className={typeStyles("reference")}
            >
              전체 레퍼런스
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              로그아웃
            </button>
          </div>
        </div>
        <div>
          <SearchBar type={getCurrentType()} />
        </div>
      </div>
    </header>
  );
}