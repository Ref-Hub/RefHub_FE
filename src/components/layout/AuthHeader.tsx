// src/components/layout/AuthHeader.tsx
import { Link } from "react-router-dom";

export default function AuthHeader() {
  return (
    <header className="bg-white dark:bg-dark-bg shadow-sm dark:shadow-dark-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img
              src="/images/icon_with_text.svg"
              alt="RefHub"
              className="h-8"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/auth/login"
              className="text-gray-600 dark:text-gray-300 hover:text-primary"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
