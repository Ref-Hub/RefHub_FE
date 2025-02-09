// src/components/layout/MainHeader.tsx
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState } from "@/store/auth";
import SearchBar from "../common/SearchBar";
import { useState } from "react";

export default function MainHeader() {
  const navigate = useNavigate();
  const [type, setType] = useState("collection");
  const [, setUser] = useRecoilState(userState);

  const handleLogout = () => {
    setUser(null);
    navigate("/auth/login");
  };

  const typeStyles = (id: string) =>
    `text-xl ${
      type === id ? "text-primary font-bold" : "text-gray-600 font-medium"
    }`;

  return (
    <header className="bg-white shadow-sm rounded-bl-[48px] rounded-br-[48px] shadow-[0px_4px_10px_0px_rgba(181,184,181,0.10)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setType("collection")}
          >
            <img
              src="/src/assets/images/icon_with_text.svg"
              alt="RefHub"
              className="h-8"
            />
          </Link>

          <nav className="flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              onClick={() => setType("collection")}
              to="/collections"
              className={typeStyles("collection")}
            >
              나의 컬렉션
            </Link>
            <Link
              onClick={() => setType("reference")}
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
          <SearchBar type={type} />
        </div>
      </div>
    </header>
  );
}
