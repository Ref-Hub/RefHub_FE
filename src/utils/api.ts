import axios from "axios";
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
      // 401 에러 시 토큰 리프레시 시도
      if (error.response?.status === 401) {
        try {
          const refreshToken = authUtils.getRefreshToken();
          if (refreshToken) {
            // 토큰 리프레시 시도
            const response = await axios.post(
              `${api.defaults.baseURL}/api/users/token`,
              { refreshToken },
              { withCredentials: true }
            );
            
            if (response.data.accessToken) {
              authUtils.setToken(response.data.accessToken);
              // 실패한 요청 재시도
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return axios(error.config);
              }
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          authUtils.clearAll();
          // 로그인 페이지로 리다이렉트 전에 약간의 지연을 줌
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