// src/utils/errorHandler.ts
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/auth';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const data = error.response?.data as ApiErrorResponse;
    
    // API에서 반환하는 에러 메시지 사용
    const message = data?.error || error.message || '알 수 없는 오류가 발생했습니다.';
    
    throw new ApiError(message, status);
  }
  
  if (error instanceof Error) {
    throw new ApiError(error.message, 500);
  }
  
  throw new ApiError('알 수 없는 오류가 발생했습니다.', 500);
};

// 공통 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  UNAUTHORIZED: '로그인이 필요한 서비스입니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청하신 리소스를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력값을 확인해주세요.',
  DEFAULT: '알 수 없는 오류가 발생했습니다.',
} as const;