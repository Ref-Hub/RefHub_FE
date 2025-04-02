// src/utils/api.ts
import axios, { AxiosHeaders } from "axios";
import { authUtils } from "@/store/auth";
import { handleApiError } from "./errorHandler";

const api = axios.create({
  baseURL: "https://api.refhub.site",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true, // CORS 요청에 credential 포함
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData를 포함한 요청의 경우 Content-Type 헤더 삭제
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => handleApiError(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        try {
          const refreshToken = authUtils.getRefreshToken();
          if (refreshToken) {
            const response = await axios.post(
              `${api.defaults.baseURL}/api/users/token`,
              { refreshToken },
              { withCredentials: true }
            );

            if (response.data.accessToken) {
              authUtils.setToken(response.data.accessToken);
              if (error.config) {
                // 헤더 처리 수정 - AxiosHeaders 사용
                if (!error.config.headers) {
                  error.config.headers = new AxiosHeaders();
                }
                error.config.headers.set('Authorization', `Bearer ${response.data.accessToken}`);
                return axios(error.config);
              }
            }
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // 수정된 부분: 토스트 메시지 표시 후 리디렉션
          const event = new CustomEvent("auth-error", {
            detail: {
              message: "유효하지 않은 토큰입니다. 다시 로그인해주세요.",
            },
          });
          window.dispatchEvent(event);

          authUtils.clearAll();
          // 짧은 지연 후 리디렉션 실행
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 100);
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 413) {
        return handleApiError({
          ...error,
          response: {
            ...error.response,
            data: { error: "파일 크기가 제한을 초과했습니다." },
          },
        });
      }
      if (error.response?.status === 415) {
        return handleApiError({
          ...error,
          response: {
            ...error.response,
            data: { error: "지원하지 않는 파일 형식입니다." },
          },
        });
      }
    }
    return handleApiError(error);
  }
);

export default api;