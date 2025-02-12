import api from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import type { GetCollectionParams, SharedUser } from "@/types/collection";
import { CollectionResponse } from "@/types/collection";

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
  async getSharedUsers(collectionId: string): Promise<SharedUser[]> {
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
    role: "viewer" | "editor" = "viewer"
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

  // 미리보기 이미지 조회
  async getImage(collectionId: string): Promise<string> {
    try {
      const response = await api.get(`${collectionId}`, {
        responseType: "arraybuffer",
      });

      const binary = new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      );
      const base64String = btoa(binary);
      const mimeType = "image/jpeg";

      return `data:${mimeType};base64,${base64String}`;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const collectionService = new CollectionService();
