// src/store/auth.ts
import { atom } from "recoil";
import type { User, LoginForm } from "@/types/auth";

export const userState = atom<User | null>({
  key: "userState",
  default: null,
});

// 더미 유저 데이터
const DUMMY_USERS: (User & { password: string })[] = [
  {
    id: "1",
    name: "테스트",
    email: "test@refhub.com",
    password: "password123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 더미 로그인 함수
export const loginWithDummy = async (data: LoginForm): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = DUMMY_USERS.find(
    (u) => u.email === data.email && u.password === data.password
  );

  if (!user) {
    throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// 로컬 스토리지 관련 유틸리티 함수
export const authUtils = {
  // 토큰 관련
  getToken: () => localStorage.getItem("token"),
  setToken: (token: string) => localStorage.setItem("token", token),
  removeToken: () => localStorage.removeItem("token"),
  
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("remember-me");
  }
};