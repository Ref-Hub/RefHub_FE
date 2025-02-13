// src/utils/api.ts
import axios from "axios";
import { authUtils } from "@/store/auth";
import { handleApiError } from "./errorHandler";

const api = axios.create({
  baseURL: "https://api.refhub.site",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 10초
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData를 포함한 요청의 경우 Content-Type 헤더 삭제
    // axios가 자동으로 multipart/form-data와 적절한 boundary를 설정
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
  (error) => {
    // 파일 업로드 관련 에러 처리
    if (axios.isAxiosError(error)) {
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
      // 인증 관련 에러 처리
      if (error.response?.status === 401) {
        authUtils.clearAll();
      }
    }
    return handleApiError(error);
  }
);

export default api;
