// src/components/layout/AuthProvider.tsx
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { userState, authUtils } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useSetRecoilState(userState);

  useEffect(() => {
    const initializeAuth = () => {
      if (authUtils.getRememberMe()) {
        const storedUser = authUtils.getStoredUser();
        const token = authUtils.getToken();
        
        if (storedUser && token) {
          setUser(storedUser);
        } else {
          // 토큰이나 유저 정보 중 하나라도 없으면 초기화
          authUtils.clearAll();
        }
      }
    };

    initializeAuth();
  }, [setUser]);

  return <>{children}</>;
}