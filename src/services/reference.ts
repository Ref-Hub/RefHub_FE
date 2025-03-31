import api from "@/utils/api";
import { authUtils } from "@/store/auth";
import { handleApiError } from "@/utils/errorHandler";
import type {
  GetReferenceParams,
  Reference,
  CreateReferenceFile,
  CreateReferenceResponse,
  UpdateReferenceRequest,
  ReferenceResponse,
  ReferenceDetailResponse,
  ReferenceListResponse,
} from "@/types/reference";

class ReferenceService {
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

  private async transformUrl(url?: string): Promise<string> {
    if (!url) return "";

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

  // 레퍼런스 목록 조회
  async getReferenceList(
    params: GetReferenceParams
  ): Promise<ReferenceListResponse> {
    try {
      const response = await api.get<ReferenceListResponse>("/api/references", {
        params,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 단일 레퍼런스 조회
  async getReference(id: string): Promise<Reference> {
    try {
      const response = await api.get<ReferenceDetailResponse>(
        `/api/references/${id}`
      );
      const { referenceDetail } = response.data;

      return {
        _id: id,
        collectionId: referenceDetail.collectionId,
        collectionTitle: referenceDetail.collectionTitle,
        createdAt: referenceDetail.createdAt,
        title: referenceDetail.referenceTitle,
        keywords: referenceDetail.keywords || [],
        memo: referenceDetail.memo || "",
        files: await Promise.all(
          referenceDetail.attachments.map(async (attachment) => ({
            _id: attachment.path,
            type: attachment.type,
            path: attachment.path,
            size: attachment.size,
            images: attachment.images,
            previewURL: attachment.previewURL
              ? await this.transformUrl(attachment.previewURL)
              : undefined,
            previewURLs: attachment.previewURLs
              ? await Promise.all(
                  attachment.previewURLs.map((url) => this.transformUrl(url))
                )
              : undefined,
          }))
        ),
      };
    } catch (error) {
      console.error("getReference API Error:", error);
      throw handleApiError(error);
    }
  }

  // 레퍼런스 이동
  async moveReference(ids: string[], title: string): Promise<void> {
    try {
      const response = await api.patch(`/api/references`, {
        referenceIds: ids,
        newCollection: title,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 레퍼런스 생성
  async createReference({
    collectionId,
    title,
    keywords,
    memo,
    files,
  }: UpdateReferenceRequest): Promise<CreateReferenceResponse> {
    try {
      const formData = new FormData();
      formData.append("collectionId", collectionId);
      formData.append("title", title);

      if (keywords?.length) {
        formData.append("keywords", keywords.join(" "));
      }

      if (memo) {
        formData.append("memo", memo);
      }

      // Append files from the provided FormData
      for (const [key, value] of files.entries()) {
        formData.append(key, value);
      }

      const response = await api.post<CreateReferenceResponse>(
        "/api/references/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 레퍼런스 수정
  async updateReference(
    id: string,
    { collectionTitle, title, keywords, memo, files }: UpdateReferenceRequest
  ): Promise<ReferenceResponse> {
    try {
      const formData = new FormData();
      formData.append("collectionTitle", collectionTitle);
      formData.append("title", title);

      if (keywords?.length) {
        formData.append("keywords", keywords.join(" "));
      }

      if (memo) {
        formData.append("memo", memo);
      }

      // Append files from the provided FormData
      for (const [key, value] of files.entries()) {
        formData.append(key, value);
      }

      const response = await api.patch<ReferenceResponse>(
        `/api/references/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 레퍼런스 삭제
  async deleteReference(id: string): Promise<void> {
    try {
      await api.delete(`/api/references/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 레퍼런스 여러개 삭제
  async deleteReferences(ids: string[]): Promise<void> {
    try {
      await api.delete("/api/references", {
        data: { referenceIds: ids },
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 파일 데이터 준비
  prepareFilesFormData(files: CreateReferenceFile[]): FormData {
    const formData = new FormData();
    let imageCount = 1;

    files.forEach((file) => {
      if (file.type === "link") {
        formData.append("links", file.content);
      } else if (file.type === "image") {
        try {
          const images = JSON.parse(file.content);
          if (Array.isArray(images)) {
            images.forEach((image: { url: string }) => {
              const blobData = this.base64ToBlob(image.url);
              formData.append(`images${imageCount}`, blobData);
            });
            imageCount++;
          }
        } catch (error) {
          console.error("이미지 데이터 파싱 실패:", error);
        }
      } else if (file.type === "pdf") {
        const blobData = this.base64ToBlob(file.content);
        formData.append("files", blobData, file.name);
      } else {
        const blobData = this.base64ToBlob(file.content);
        formData.append("otherFiles", blobData, file.name);
      }
    });

    return formData;
  }

  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(";base64,");
    const contentType = parts[0].split(":")[1] || "";
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
