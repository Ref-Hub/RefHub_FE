// src/services/auth.ts
import type { LoginForm, SignupForm, PasswordResetForm, LoginResponse } from '@/types/auth';
import api from '@/utils/api';
import { handleApiError } from '@/utils/errorHandler';
import { authUtils } from '@/store/auth';

class AuthService {
 async sendVerificationCode(name: string, email: string): Promise<void> {
   try {
     const response = await api.post("/users/email", { name, email });
     return response.data;
   } catch (error) {
     throw handleApiError(error);
   }
 }

 async signup(data: SignupForm): Promise<void> {
   try {
     const response = await api.post("/users/signup", {
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

 async login(data: LoginForm, autoLogin: boolean): Promise<LoginResponse> {
   try {
     const response = await api.post<LoginResponse>("/users/login", {
       email: data.email,
       password: data.password,
       autoLogin,
     });

     if (response.data.accessToken) {
       authUtils.setToken(response.data.accessToken);
       if (response.data.refreshToken) {
         authUtils.setRefreshToken(response.data.refreshToken);
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

 async logout(): Promise<void> {
   try {
     await api.post("/users/logout");
     authUtils.clearAll();
   } catch (error) {
     throw handleApiError(error);
   }
 }

 async sendPasswordResetCode(email: string): Promise<void> {
   try {
     const response = await api.post("/users/password/email", { email });
     return response.data;
   } catch (error) {
     throw handleApiError(error);
   }
 }

 async resetPassword(data: PasswordResetForm): Promise<void> {
   try {
     const response = await api.post("/users/password/reset", {
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

 async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
   try {
     const response = await api.post<{ accessToken: string }>(
       "/users/token",
       { refreshToken }
     );

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