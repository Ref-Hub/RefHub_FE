// src/services/auth.ts
import type { LoginForm, SignupForm, PasswordResetForm, AuthResponse } from '@/types/auth';
import { loginWithDummy, authUtils } from '@/store/auth';

class AuthService {
  // API 엔드포인트 설정
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  private isDevelopment = process.env.NODE_ENV === 'development';

  // 로그인
  async login(data: LoginForm): Promise<AuthResponse> {
    try {
      if (this.isDevelopment) {
        // 개발 환경에서는 더미 데이터 사용
        const user = await loginWithDummy(data);
        const dummyToken = 'dummy-token-' + Date.now();
        authUtils.setToken(dummyToken);
        return {
          accessToken: dummyToken,
          user,
        };
      }

      // 프로덕션 환경에서는 실제 API 호출
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();
      authUtils.setToken(result.accessToken);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // 회원가입
  async signup(data: SignupForm): Promise<AuthResponse> {
    try {
      if (this.isDevelopment) {
        // 개발 환경에서는 더미 회원가입 처리
        const mockUser = {
          id: Date.now().toString(),
          name: data.name,
          email: data.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const dummyToken = 'dummy-token-' + Date.now();
        authUtils.setToken(dummyToken);
        return {
          accessToken: dummyToken,
          user: mockUser,
        };
      }

      // 프로덕션 환경에서는 실제 API 호출
      const response = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const result = await response.json();
      authUtils.setToken(result.accessToken);
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // 비밀번호 재설정
  async resetPassword(data: PasswordResetForm): Promise<void> {
    try {
      if (this.isDevelopment) {
        // 개발 환경에서는 더미 처리
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }

      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // 토큰 관리는 authUtils로 위임
  getToken(): string | null {
    return authUtils.getToken();
  }

  removeToken(): void {
    authUtils.removeToken();
  }

  // 인증 상태 확인
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();