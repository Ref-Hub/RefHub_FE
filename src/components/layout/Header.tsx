// src/components/layout/Header.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

export default function Header() {
  const isLoggedIn = false; // TODO: 추후 인증 상태 관리로 변경

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              RefHub
            </Link>
            {isLoggedIn && (
              <nav className="ml-10 flex items-center space-x-4">
                <Link to="/collections" className="text-gray-700 hover:text-blue-600">
                  컬렉션
                </Link>
                <Link to="/references" className="text-gray-700 hover:text-blue-600">
                  레퍼런스
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Button variant="outline">
                  <Link to="/references/new">레퍼런스 추가</Link>
                </Button>
                <button
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => {
                    // TODO: 로그아웃 처리
                  }}
                >
                  로그아웃
                </button>
                <div className="w-8 h-8 rounded-full bg-gray-200">
                  {/* TODO: 프로필 이미지 */}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/auth/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  로그인
                </Link>
                <Button variant="primary">
                  <Link to="/auth/signup" className="text-white">
                    회원가입
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}