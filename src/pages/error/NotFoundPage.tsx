// src/pages/error/NotFoundPage.tsx
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authUtils } from '@/store/auth';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const isAuthenticated = authUtils.getToken();
  
  useEffect(() => {
    // 인증 상태에 따라 적절한 페이지로 리다이렉트
    if (isAuthenticated) {
      navigate('/collections', { replace: true });
    } else {
      navigate('/auth/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 즉시 리다이렉트 처리
  return isAuthenticated 
    ? <Navigate to="/collections" replace /> 
    : <Navigate to="/auth/login" replace />;
}