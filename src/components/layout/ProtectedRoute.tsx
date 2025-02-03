import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState, authUtils } from '@/store/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useRecoilValue(userState);
  const token = authUtils.getToken();
  
  if (!user && !token) {
    console.log('Protected route: No auth, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}