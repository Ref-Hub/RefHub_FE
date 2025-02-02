// src/utils/api.ts
import axios from 'axios';
import { authUtils } from '@/store/auth';
import { ERROR_MESSAGES, handleApiError } from './errorHandler';

const api = axios.create({
  baseURL: 'https://api.refhub.site',  // 새로운 백엔드 도메인으로 변경
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // /api prefix 제거 (새로운 도메인에서는 불필요)
    if (config.url?.startsWith('/api/')) {
      config.url = config.url.substring(4);
    }

    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    if (!response.data) {
      console.error('Empty response data:', response);
      throw new Error(ERROR_MESSAGES.DEFAULT);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.error || error.response.data?.message;

        switch (status) {
          case 401:
            authUtils.clearAll(); // 인증 에러시 로컬 스토리지 클리어
            throw new Error(errorMessage || ERROR_MESSAGES.UNAUTHORIZED);
          case 403:
            throw new Error(errorMessage || ERROR_MESSAGES.FORBIDDEN);
          case 404:
            throw new Error(errorMessage || ERROR_MESSAGES.NOT_FOUND);
          case 422:
            throw new Error(errorMessage || ERROR_MESSAGES.VALIDATION_ERROR);
          case 500:
            throw new Error(errorMessage || ERROR_MESSAGES.SERVER_ERROR);
          default:
            throw new Error(errorMessage || ERROR_MESSAGES.DEFAULT);
        }
      }

      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    throw handleApiError(error);
  }
);

export default api;