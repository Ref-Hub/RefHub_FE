// src/store/auth.ts
import { atom } from 'recoil';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const userState = atom<User | null>({
  key: 'userState',
  default: null,
});

// 더미 사용자 데이터
export const DUMMY_USER = {
  id: '1',
  name: '홍길동',
  email: 'test@refhub.com',
};