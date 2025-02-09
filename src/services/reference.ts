// src/services/reference.ts
import api from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import type { GetReferenceParams } from "@/types/reference";
import { Reference as ReferenceCardProps } from "@/types/reference";

class ReferenceService {
  // 레퍼런스 목록 조회
  async getReferenceList(
    params: GetReferenceParams
  ): Promise<ReferenceCardProps[]> {
    try {
      const response = await api.get("/api/references", { params });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 레퍼런스 삭제
  async deleteReference(id: string): Promise<void> {
    try {
      const response = await api.delete(`/api/references/${id}`, {});
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 레퍼런스 여러개 삭제
  async deleteReferences(ids: string[]): Promise<void> {
    try {
      const response = await api.delete(`/api/references`, {
        data: { referenceIds: ids },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const referenceService = new ReferenceService();
