// src/utils/api.ts
import axios from 'axios';
import { authUtils } from '@/store/auth';
import { handleApiError } from './errorHandler';

const api = axios.create({
  baseURL: 'https://api.refhub.site',
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
  (error) => handleApiError(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 인증 관련 에러 처리
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      authUtils.clearAll();
    }
    return handleApiError(error);
  }
);

export default api;