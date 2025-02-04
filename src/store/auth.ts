// src/store/auth.ts
import { atom } from "recoil";
import type { User } from "@/types/auth";

export const userState = atom<User | null>({
  key: "userState",
  default: null,
});

// 로컬 스토리지 관련 유틸리티 함수
export const authUtils = {
  // 액세스 토큰 관련
  getToken: () => localStorage.getItem("accessToken"),
  setToken: (token: string) => localStorage.setItem("accessToken", token),
  removeToken: () => localStorage.removeItem("accessToken"),
  
  // 리프레시 토큰 관련
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token: string) => localStorage.setItem("refreshToken", token),
  removeRefreshToken: () => localStorage.removeItem("refreshToken"),
  
  // 유저 정보 관련
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
  setStoredUser: (user: User) => 
    localStorage.setItem("user", JSON.stringify(user)),
  removeStoredUser: () => 
    localStorage.removeItem("user"),
  
  // 로그인 상태 유지 관련
  setRememberMe: (remember: boolean) => 
    localStorage.setItem("remember-me", String(remember)),
  getRememberMe: () => 
    localStorage.getItem("remember-me") === "true",
  removeRememberMe: () => 
    localStorage.removeItem("remember-me"),
  
  // 초기화
  clearAll: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("remember-me");
  }
};