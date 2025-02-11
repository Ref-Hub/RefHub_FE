import api from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import type { GetCollectionParams } from "@/types/collection";
import { CollectionResponse } from "@/types/collection";

class CollectionService {
  // 목록 조회
  async getCollectionList(
    params?: GetCollectionParams
  ): Promise<CollectionResponse> {
    try {
      const response = await api.get("/api/collections", params ? { params } : undefined);
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
  async updateCollection(id: string, title: string): Promise<CollectionResponse> {
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
}

export const collectionService = new CollectionService();