// src/services/reference.ts
import api from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import type { GetReferenceParams } from "@/types/reference";
import { Reference as ReferenceCardProps, CreateReferenceResponse } from "@/types/reference";

interface ReferenceFile {
  type: 'link' | 'image' | 'pdf' | 'file';
  content: string;
  name?: string;
}

interface CreateReferenceRequest {
  collectionTitle: string;
  title: string;
  keywords?: string[];
  memo?: string;
  files: FormData;
}

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

  // 레퍼런스 생성
  async createReference({
    collectionTitle,
    title,
    keywords,
    memo,
    files
  }: CreateReferenceRequest): Promise<CreateReferenceResponse> {
    try {
      const formData = new FormData();
      formData.append('collectionTitle', collectionTitle);
      formData.append('title', title);
      
      if (keywords?.length) {
        formData.append('keywords', keywords.join(','));
      }
      
      if (memo) {
        formData.append('memo', memo);
      }

      // Append files from the provided FormData
      for (const [key, value] of files.entries()) {
        formData.append(key, value);
      }

      const response = await api.post<CreateReferenceResponse>('/api/references', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 파일 데이터 준비
  prepareFilesFormData(files: ReferenceFile[]): FormData {
    const formData = new FormData();
    let imageCount = 1;

    files.forEach(file => {
      if (file.type === 'link') {
        formData.append('links', file.content);
      } else if (file.type === 'image') {
        try {
          const images = JSON.parse(file.content);
          if (Array.isArray(images)) {
            images.forEach((image: { url: string }) => {
              const blobData = this.base64ToBlob(image.url);
              formData.append(`images${imageCount}`, blobData);
            });
            imageCount++;
          }
        } catch (_) {
          console.error('이미지 데이터 파싱 실패');
        }
      } else if (file.type === 'pdf') {
        const blobData = this.base64ToBlob(file.content);
        formData.append('files', blobData, file.name);
      } else {
        const blobData = this.base64ToBlob(file.content);
        formData.append('otherFiles', blobData, file.name);
      }
    });

    return formData;
  }

  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1] || '';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }
}

export const referenceService = new ReferenceService();