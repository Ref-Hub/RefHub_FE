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

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// API 응답 타입
export interface AuthResponse {
  accessToken: string;
  user: User;
}