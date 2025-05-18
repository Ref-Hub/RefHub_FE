// src/store/user.ts
import { atom } from "recoil";

export interface UserProfile {
  name: string;
  email: string;
  profileImage?: string | null;
}

export const userProfileState = atom<UserProfile | null>({
  key: "userProfileState",
  default: null,
});
