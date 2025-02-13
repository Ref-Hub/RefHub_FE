// src/utils/errorHandler.ts
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/auth";
import type { ReferenceApiError } from "@/types/reference";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
  SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNAUTHORIZED: "로그인이 필요한 서비스입니다.",
  FORBIDDEN: "접근 권한이 없습니다.",
  NOT_FOUND: "요청하신 리소스를 찾을 수 없습니다.",
  VALIDATION_ERROR: "입력값을 확인해주세요.",
  DEFAULT: "알 수 없는 오류가 발생했습니다.",
  FILE_SIZE_EXCEEDED: "파일 크기가 제한을 초과했습니다.",
  INVALID_FILE_TYPE: "지원하지 않는 파일 형식입니다.",
  FILE_UPLOAD_FAILED: "파일 업로드에 실패했습니다.",
  MAX_FILES_EXCEEDED: "최대 파일 개수를 초과했습니다.",
} as const;

export const handleApiError = (error: unknown): never => {
  console.error("API Error:", error);

  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data as
      | ApiErrorResponse
      | ReferenceApiError;
    let message: string;

    // API에서 반환하는 실제 에러 메시지를 우선적으로 사용
    if (errorData) {
      if (typeof errorData === "string") {
        message = errorData;
      } else if ("error" in errorData) {
        message = errorData.error;
      } else {
        // 상태 코드별 기본 에러 메시지
        switch (status) {
          case 401:
            message = ERROR_MESSAGES.UNAUTHORIZED;
            break;
          case 403:
            message = ERROR_MESSAGES.FORBIDDEN;
            break;
          case 404:
            message = ERROR_MESSAGES.NOT_FOUND;
            break;
          case 413:
            message = ERROR_MESSAGES.FILE_SIZE_EXCEEDED;
            break;
          case 415:
            message = ERROR_MESSAGES.INVALID_FILE_TYPE;
            break;
          case 422:
            message = ERROR_MESSAGES.VALIDATION_ERROR;
            break;
          case 500:
            message = ERROR_MESSAGES.SERVER_ERROR;
            break;
          default:
            message = error.message || ERROR_MESSAGES.DEFAULT;
        }
      }
      throw new ApiError(message, status, error.code);
    }
  }

  if (error instanceof Error) {
    throw new ApiError(error.message, 500);
  }

  throw new ApiError(ERROR_MESSAGES.DEFAULT, 500);
};
