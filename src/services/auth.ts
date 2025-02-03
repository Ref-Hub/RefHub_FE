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
      const response = await api.post('/api/users/email', { name, email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 회원가입
  async signup(data: SignupForm): Promise<void> {
    try {
      const response = await api.post('/api/users/signup', {
        email: data.email,
        verificationCode: data.verificationCode,
        password: data.password,
        confirmPassword: data.passwordConfirm,
      });
      return response.data;
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

      console.log('Login API Response:', response.data); // 디버깅용 로그

      // response.data에서 토큰 추출
      const { accessToken, refreshToken } = response.data;

      // 토큰이 존재하는 경우에만 저장 처리
      if (accessToken) {
        authUtils.setToken(accessToken);
        
        if (refreshToken) {
          authUtils.setRefreshToken(refreshToken);
        }
        
        if (autoLogin) {
          authUtils.setRememberMe(true);
        }
      } else {
        console.error('No access token in response:', response.data);
        throw new Error('로그인 응답에 토큰이 없습니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      const response = await api.post('/api/users/logout');
      authUtils.clearAll();
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 비밀번호 재설정 인증번호 전송
  async sendPasswordResetCode(email: string): Promise<void> {
    try {
      const response = await api.post('/api/users/password/email', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 비밀번호 재설정
  async resetPassword(data: PasswordResetForm): Promise<void> {
    try {
      const response = await api.post('/api/users/password/reset', {
        email: data.email,
        verificationCode: data.verificationCode,
        newPassword: data.newPassword,
        confirmPassword: data.newPasswordConfirm,
      });
      return response.data;
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
      } else {
        throw new Error('토큰 갱신 응답에 새로운 액세스 토큰이 없습니다.');
      }

      return response.data;
    } catch (error) {
      authUtils.clearAll();
      throw handleApiError(error);
    }
  }
}

export const authService = new AuthService();