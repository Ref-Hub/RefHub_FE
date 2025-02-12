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
    const isTokenValid = (token: string): boolean => {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.exp * 1000 > Date.now();
      } catch (error) {
        console.error("Token validation error:", error);
        return false;
      }
    };

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = authUtils.getRefreshToken();
            if (!refreshToken) {
              throw new Error("Refresh token not found");
            }

            const { accessToken } = await authService.refreshToken(refreshToken);
            authUtils.setToken(accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            authUtils.clearAll();
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    const initializeAuth = async () => {
      try {
        const token = authUtils.getToken();
        const refreshToken = authUtils.getRefreshToken();
        const storedUser = authUtils.getStoredUser();

        if (!token && !refreshToken && !storedUser) {
          authUtils.clearAll();
          setUser(null);
          return;
        }

        if (!token && storedUser) {
          if (refreshToken) {
            try {
              const { accessToken } = await authService.refreshToken(refreshToken);
              authUtils.setToken(accessToken);
              setUser(storedUser);
              return;
            } catch (refreshError) {
              console.error("Token refresh failed during initialization:", refreshError);
              throw refreshError;
            }
          } else {
            throw new Error("No valid authentication tokens available");
          }
        }

        if (token && !isTokenValid(token)) {
          if (refreshToken) {
            const { accessToken } = await authService.refreshToken(refreshToken);
            authUtils.setToken(accessToken);
            setUser(storedUser);
          } else {
            throw new Error("Token expired and no refresh token available");
          }
        } else if (token && storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
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