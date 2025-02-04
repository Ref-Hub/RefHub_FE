// src/components/layout/AuthProvider.tsx
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { userState, authUtils } from "@/store/auth";
import { authService } from "@/services/auth";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "@/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useSetRecoilState(userState);

  useEffect(() => {
    // 토큰 유효성 검사 함수
    const isTokenValid = (token: string): boolean => {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const isValid = decoded.exp * 1000 > Date.now();
        console.log('Token validity check:', {
          expirationTime: new Date(decoded.exp * 1000),
          currentTime: new Date(),
          isValid
        });
        return isValid;
      } catch (error) {
        console.error('Token validation error:', error);
        return false;
      }
    };

    // API 요청 인터셉터 설정
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        console.log('API Error intercepted:', {
          status: error.response?.status,
          isRetry: originalRequest?._retry
        });

        if (error.response?.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = authUtils.getRefreshToken();
            if (!refreshToken) {
              throw new Error("Refresh token not found");
            }

            console.log('Attempting token refresh...');
            const { accessToken } = await authService.refreshToken(refreshToken);
            authUtils.setToken(accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            console.log('Token refresh successful, retrying original request');
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            authUtils.clearAll();
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // 초기 인증 상태 설정
    const initializeAuth = async () => {
      console.log('Starting auth initialization...');
      
      try {
        // localStorage에서 데이터 로드
        const token = authUtils.getToken();
        const refreshToken = authUtils.getRefreshToken();
        const storedUser = authUtils.getStoredUser();

        console.log('Auth data check:', {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          hasStoredUser: !!storedUser
        });

        // 인증 데이터가 없는 경우 초기화
        if (!token && !refreshToken && !storedUser) {
          console.log('No auth data found, clearing state');
          authUtils.clearAll();
          setUser(null);
          return;
        }

        // 토큰이 없지만 다른 데이터가 있는 경우
        if (!token && storedUser) {
          if (refreshToken) {
            try {
              console.log('No token but refresh token exists, attempting refresh');
              const { accessToken } = await authService.refreshToken(refreshToken);
              authUtils.setToken(accessToken);
              setUser(storedUser);
              console.log('Token refresh successful');
              return;
            } catch (refreshError) {
              console.error('Token refresh failed during initialization:', refreshError);
              throw refreshError;
            }
          } else {
            throw new Error("No valid authentication tokens available");
          }
        }

        // 토큰 유효성 검사
        if (token && !isTokenValid(token)) {
          if (refreshToken) {
            console.log('Token expired, attempting refresh...');
            const { accessToken } = await authService.refreshToken(refreshToken);
            authUtils.setToken(accessToken);
            setUser(storedUser);
            console.log('Token refresh successful during initialization');
          } else {
            throw new Error("Token expired and no refresh token available");
          }
        } else if (token && storedUser) {
          console.log('Valid token found, setting user state');
          setUser(storedUser);
        }

        console.log('Auth initialization completed successfully');
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authUtils.clearAll();
        setUser(null);
      }
    };

    // 초기화 실행
    initializeAuth();

    // 클린업 함수
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [setUser]);

  return <>{children}</>;
}