// src/store/user.ts
import { atom } from "recoil";
import { UserProfile } from "@/services/user";

export const userProfileState = atom<UserProfile | null>({
  key: "userProfileState",
  default: null,
});