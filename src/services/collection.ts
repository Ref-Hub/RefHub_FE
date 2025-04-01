import api from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import type { GetCollectionParams, SharedUsers } from "@/types/collection";
import { CollectionResponse } from "@/types/collection";
import { authUtils } from "@/store/auth";

class CollectionService {
  // 목록 조회
  async getCollectionList(
    params?: GetCollectionParams
  ): Promise<CollectionResponse> {
    try {
      const response = await api.get(
        "/api/collections",
        params ? { params } : undefined
      );
      return response.data ?? { data: [] };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 컬렉션 생성
  async createCollection(title: string): Promise<CollectionResponse> {
    try {
      const response = await api.post("/api/collections", { title });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 컬렉션 수정
  async updateCollection(
    id: string,
    title: string
  ): Promise<CollectionResponse> {
    try {
      const response = await api.patch(`/api/collections/${id}`, { title });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 컬렉션 삭제
  async deleteCollection(ids: string[]): Promise<void> {
    try {
      await api.delete(`/api/collections`, {
        data: { collectionIds: ids },
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 컬렉션 즐겨찾기
  async likeCollection(id: string): Promise<void> {
    try {
      await api.patch(`/api/collections/${id}/favorite`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 공유 사용자 조회
  async getSharedUsers(collectionId: string): Promise<SharedUsers> {
    try {
      const response = await api.get(
        `/api/collections/${collectionId}/sharing/shared-users`,
        {}
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 공유 사용자 추가 및 수정
  async updateSharedUsers(
    collectionId: string,
    email: string,
    role?: string
  ): Promise<void> {
    try {
      const response = await api.patch(
        `/api/collections/${collectionId}/sharing/shared-users`,
        {
          email,
          role,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 공유 사용자 삭제
  async deleteSharedUsers(collectionId: string, userId: string): Promise<void> {
    try {
      await api.delete(
        `/api/collections/${collectionId}/sharing/shared-users/${userId}`,
        {}
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 컬렉션 나만 보기
  async setPrivate(collectionId: string): Promise<void> {
    try {
      const response = await api.patch(
        `/api/collections/${collectionId}/sharing/set-private`,
        {}
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  private baseUrl = "https://api.refhub.site";

  private async fetchWithAuth(url: string): Promise<string> {
    try {
      const token = authUtils.getToken();
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching image:", error);
      return url;
    }
  }

  // 미리보기 이미지 조회
  // src/services/collection.ts - getImage 함수 수정
  async getImage(url: string): Promise<string> {
    if (!url) return "";

    // S3 URL을 항상 fetchWithAuth로 처리
    if (
      url.includes("s3.ap-northeast-2.amazonaws.com") ||
      url.includes("refhub-bucket")
    ) {
      return await this.fetchWithAuth(url);
    }

    if (!url.includes("://")) {
      const fullUrl = `${this.baseUrl}${url}`;
      if (url.includes("/api/references/file/")) {
        return await this.fetchWithAuth(fullUrl);
      }
      return fullUrl;
    }

    if (url.includes("api.refhub.site")) {
      if (url.includes("/api/references/file/")) {
        return await this.fetchWithAuth(url);
      }
      return url;
    }

    if (url.includes("refhub.my")) {
      const newUrl = url.replace("refhub.my", "api.refhub.site");
      if (newUrl.includes("/api/references/file/")) {
        return await this.fetchWithAuth(newUrl);
      }
      return newUrl;
    }

    return url;
  }
}

export const collectionService = new CollectionService();
