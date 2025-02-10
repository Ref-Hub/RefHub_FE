// src/services/collection.ts
import api from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import type { GetCollectionParams } from "@/types/collection";
import { CollectionResponse } from "@/types/collection";

class CollectionService {
  // 목록 조회
  async getCollectionList(
    params: GetCollectionParams
  ): Promise<CollectionResponse> {
    try {
      const response = await api.get("/api/collections", { params });
      return response.data ?? {};
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 컬렉션 생성
  async createCollection(title: string): Promise<void> {
    try {
      const response = await api.post("/api/collections", { title: title });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 컬렉션 수정
  async updateCollection(id: string, title: string): Promise<void> {
    try {
      const response = await api.patch(`/api/collections/${id}`, {
        title: title,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 컬렉션 삭제
  async deleteCollection(ids: string[]): Promise<void> {
    try {
      const response = await api.delete(`/api/collections`, {
        data: { collectionIds: ids },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 컬렉션 즐겨찾기
  async likeCollection(id: string): Promise<void> {
    try {
      const response = await api.patch(`/api/collections/${id}/favorite`, {});
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const collectionService = new CollectionService();
