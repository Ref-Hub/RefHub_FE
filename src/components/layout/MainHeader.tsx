// src/components/layout/MainHeader.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userState } from '@/store/auth';

export default function MainHeader() {
  const navigate = useNavigate();
  const [, setUser] = useRecoilState(userState);

  const handleLogout = () => {
    setUser(null);
    navigate('/auth/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img src="/assets/images/logo-icon.png" alt="RefHub" className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold text-primary">RefHub</span>
          </Link>

          {/* 중앙 네비게이션 */}
          <nav className="flex items-center space-x-8">
            <Link 
              to="/collections" 
              className="text-gray-600 hover:text-primary text-base font-medium"
            >
              나의 컬렉션
            </Link>
            <Link 
              to="/references" 
              className="text-gray-600 hover:text-primary text-base font-medium"
            >
              전체 레퍼런스
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              to="/references/new"
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
            >
              레퍼런스 추가
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}