// src/components/layout/AuthNavigationHandler.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/auth';

export function AuthNavigationHandler() {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  return null;
}