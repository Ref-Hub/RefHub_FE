// src/components/layout/Footer.tsx
import { Mail, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Footer() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleWithdrawal = () => {
    // Show confirmation modal before proceeding with account deletion
    if (window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // Call API to delete account
      // Then logout
      logout();
      navigate('/auth/login');
    }
  };

  return (
    <footer className="bg-[#F9FAF9] dark:bg-dark-bg mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle separator - just a light line instead of a border */}
        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-6"></div>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          {/* Logo and contact info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 mr-2" />
              <a href="mailto:refhub0@gmail.com" className="text-sm hover:text-primary transition-colors">
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
              <span className="text-sm">@_refhub</span>
            </a>
          </div>

          {/* Links */}
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
              className="underline hover:text-red-500 transition-colors"
            >
              탈퇴하기
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-xs text-center text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} RefHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}