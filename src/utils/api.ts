// src/utils/api.ts
import axios from 'axios';
import { authUtils } from '@/store/auth';
import { ERROR_MESSAGES, handleApiError } from './errorHandler';

const api = axios.create({
  baseURL: 'https://refhub.site',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
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
  (response) => response.data,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      const status = error.response?.status;
      switch (status) {
        case 401:
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        case 403:
          throw new Error(ERROR_MESSAGES.FORBIDDEN);
        case 404:
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        case 422:
          throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
        case 500:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        default:
          return handleApiError(error);
      }
    }

    return handleApiError(error);
  }
);

export default api;