// src/components/layout/AuthHeader.tsx
import { Link } from 'react-router-dom';

export default function AuthHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="/src/assets/images/icon_with_text.svg" 
              alt="RefHub" 
              className="h-8" 
            />
          </Link>
          <Link 
            to="/auth/login"
            className="text-gray-600 hover:text-primary"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}