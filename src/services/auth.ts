// src/services/auth.ts
import type { 
  LoginForm, 
  SignupForm, 
  PasswordResetForm, 
  AuthResponse
} from '@/types/auth';
import api from '@/utils/api';
import { handleApiError } from '@/utils/errorHandler';
import { authUtils } from '@/store/auth';

class AuthService {
  // 인증번호 전송 (회원가입)
  async sendVerificationCode(name: string, email: string): Promise<void> {
    try {
      await api.post('/api/users/email', { name, email });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 회원가입
  async signup(data: SignupForm): Promise<void> {
    try {
      await api.post('/api/users/signup', {
        email: data.email,
        verificationCode: data.verificationCode,
        password: data.password,
        confirmPassword: data.passwordConfirm,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 로그인
  async login(data: LoginForm, autoLogin: boolean): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/users/login', {
        email: data.email,
        password: data.password,
        autoLogin,
      });

      // 토큰 저장
      const { accessToken, refreshToken } = response.data;
      if (accessToken) {
        authUtils.setToken(accessToken);
        if (refreshToken) {
          authUtils.setRefreshToken(refreshToken);
        }
        if (autoLogin) {
          authUtils.setRememberMe(true);
        }
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await api.post('/api/users/logout');
      authUtils.clearAll();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 비밀번호 재설정 인증번호 전송
  async sendPasswordResetCode(email: string): Promise<void> {
    try {
      await api.post('/api/users/password/email', { email });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 비밀번호 재설정
  async resetPassword(data: PasswordResetForm): Promise<void> {
    try {
      await api.post('/api/users/password/reset', {
        email: data.email,
        verificationCode: data.verificationCode,
        newPassword: data.newPassword,
        confirmPassword: data.newPasswordConfirm,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 토큰 갱신
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const response = await api.post<{ accessToken: string }>('/api/users/token', { 
        refreshToken 
      });
      
      const { accessToken } = response.data;
      if (accessToken) {
        authUtils.setToken(accessToken);
      }

      return response.data;
    } catch (error) {
      authUtils.clearAll();
      throw handleApiError(error);
    }
  }
}

export const authService = new AuthService();