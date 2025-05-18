// src/services/user.ts
import api from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";

interface UserProfile {
  name: string;
  email: string;
  profileImage: string | null;
}

class UserService {
  // 마이페이지 사용자 정보 조회
  async getMyProfile(): Promise<UserProfile> {
    try {
      const response = await api.get("/api/users/my-page");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 사용자 이름 변경
  async updateUsername(newName: string): Promise<{ message: string }> {
    try {
      const response = await api.patch("/api/users/user-name", { newName });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 프로필 이미지 업로드
  async uploadProfileImage(file: File): Promise<{ message: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.patch("/api/users/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 프로필 이미지 삭제
  async deleteProfileImage(): Promise<{ message: string }> {
    try {
      const response = await api.delete("/api/users/profile-image");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const userService = new UserService();
