import { AxiosError } from "axios";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ERROR_MESSAGES = {
  // 계정 관련 오류 메시지
  ACCOUNT: {
    INVALID_CREDENTIALS: "계정 정보가 올바르지 않습니다. 다시 시도해주세요.",
    NOT_FOUND: "등록되지 않은 계정입니다. 회원가입을 진행해주세요.",
    PASSWORD_FORMAT: "계정 정보가 올바르지 않습니다. 다시 시도해주세요.", // 문구 통일
  },
  // 기술적 오류 메시지
  TECHNICAL: {
    NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
    SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    UNAUTHORIZED: "로그인이 필요한 서비스입니다.",
    FORBIDDEN: "접근 권한이 없습니다.",
    NOT_FOUND: "요청하신 리소스를 찾을 수 없습니다.",
    DEFAULT: "알 수 없는 오류가 발생했습니다.",
    FILE_SIZE_EXCEEDED: "파일 크기가 제한을 초과했습니다.",
    INVALID_FILE_TYPE: "지원하지 않는 파일 형식입니다.",
    VALIDATION_ERROR: "입력값을 확인해주세요.",
  },
};

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return new AppError(message, statusCode, error.response?.data?.code);
  }

  if (error instanceof AppError) {
    return error;
  }

  return new AppError("An unexpected error occurred", 500);
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof AxiosError && !error.response;
};

export const isServerError = (error: unknown): boolean => {
  return error instanceof AxiosError && (error.response?.status ?? 0) >= 500;
};

export const isClientError = (error: unknown): boolean => {
  return (
    error instanceof AxiosError &&
    (error.response?.status ?? 0) >= 400 &&
    (error.response?.status ?? 0) < 500
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
