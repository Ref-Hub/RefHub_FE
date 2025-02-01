// src/components/layout/AuthProvider.tsx
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { userState, authUtils } from "@/store/auth";
import { authService } from "@/services/auth"; // 추가
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "@/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useSetRecoilState(userState);

  useEffect(() => {
    // 토큰 만료 시간을 체크하는 함수
    const checkTokenExpiration = (token: string) => {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.exp * 1000 - Date.now() <= 10 * 60 * 1000;
      } catch {
        return true;
      }
    };

    // API 요청 인터셉터 설정
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = authUtils.getRefreshToken();
            if (!refreshToken) {
              throw new Error("No refresh token");
            }

            const { accessToken } = await authService.refreshToken(refreshToken);
            authUtils.setToken(accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return axios(originalRequest);
          } catch (refreshError) {
            authUtils.clearAll();
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // 초기 인증 상태 설정
    const initializeAuth = () => {
      const token = authUtils.getToken();
      const refreshToken = authUtils.getRefreshToken();
      const storedUser = authUtils.getStoredUser();

      if (token && refreshToken && storedUser) {
        if (checkTokenExpiration(token) && authUtils.getRememberMe()) {
          authService.refreshToken(refreshToken).catch(() => {
            authUtils.clearAll();
            setUser(null);
          });
        }
        setUser(storedUser);
      } else {
        authUtils.clearAll();
        setUser(null);
      }
    };

    initializeAuth();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [setUser]);

  return <>{children}</>;
}