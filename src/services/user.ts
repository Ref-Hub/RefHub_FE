// src/services/user.ts
import api from "@/utils/api";

export interface UserProfile {
  name: string;
  email: string;
  profileImage: string | null;
}

class UserService {
  // 사용자 프로필 정보 조회
  async getMyProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>("/api/users/my-page");
    return response.data;
  }

  // 프로필 이미지 업로드
  async uploadProfileImage(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.patch<{ message: string }>(
      "/api/users/profile-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // 프로필 이미지 삭제
  async deleteProfileImage(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      "/api/users/profile-image"
    );
    return response.data;
  }

  // 사용자 이름 변경
  async updateUserName(newName: string): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(
      "/api/users/user-name",
      { newName }
    );
    return response.data;
  }
}

export const userService = new UserService();
