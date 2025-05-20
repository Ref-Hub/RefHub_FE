// src/types/auth.ts

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  verificationCode: string;
  password: string;
  passwordConfirm: string;
}

export interface PasswordResetForm {
  email: string;
  verificationCode: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface VerifyCodeForm {
  email: string;
  verificationCode: string;
}

// 카카오 연동 관련 타입
export interface KakaoLinkRequest {
  email: string;
  name: string;
  profileImage?: string;
}

export interface KakaoLinkResponse {
  message: string;
  token: string;
}

// API 요청 타입들
export interface VerifySignupRequest {
  email: string;
  verificationCode: string;
}

export interface SignupRequest {
  verifiedEmail: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// API 응답 타입들
export interface ApiResponse {
  message: string;
}

export interface AuthResponse extends ApiResponse {
  accessToken: string;
  refreshToken?: string;
  autoLogin: boolean;
}

export interface ApiErrorResponse {
  error: string;
}

// Token 관련 타입
export interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}
