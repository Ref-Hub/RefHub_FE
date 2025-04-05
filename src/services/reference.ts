// src/services/reference.ts
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
      // S3 URL인 경우, API 서버를 통해 이미지를 프록싱
      if (
        url.includes("s3.ap-northeast-2.amazonaws.com") ||
        url.includes("refhub-bucket")
      ) {
        // API 서버의 프록시 엔드포인트 사용
        const token = authUtils.getToken();
        const proxyUrl = `${
          this.baseUrl
        }/api/references/download?fileUrl=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`이미지 로드 실패: ${response.status}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }

      // S3가 아닌 다른 URL은 기존 방식대로 처리
      const token = authUtils.getToken();
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`이미지 로드 실패: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching image:", error);
      // 오류 발생 시 대체 이미지 반환 또는 원본 URL 유지
      return "/images/placeholder.png"; // 로컬 플레이스홀더 이미지 사용
    }
  }

  // URL 변환 함수 - 같은 방식으로 수정
  async transformUrl(url?: string): Promise<string> {
    if (!url) return "";

    // 로컬 개발 환경에서 S3 URL 처리
    if (
      window.location.hostname === "localhost" &&
      (url.includes("s3.ap-northeast-2.amazonaws.com") ||
        url.includes("refhub-bucket"))
    ) {
      try {
        return await this.fetchWithAuth(url);
      } catch (error) {
        console.error("S3 이미지 로드 실패:", error);
        return "/images/placeholder.png"; // 플레이스홀더 이미지 반환
      }
    }

    // S3 URL 처리
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
            // 파일명 디코딩 처리
            filename: attachment.filename
              ? decodeURIComponent(attachment.filename)
              : undefined,
            filenames: attachment.filenames
              ? attachment.filenames.map((name) => decodeURIComponent(name))
              : undefined,
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
    { collectionId, title, keywords, memo, files }: UpdateReferenceRequest
  ): Promise<ReferenceResponse> {
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

      console.log("Updating reference with data:", {
        id,
        collectionId,
        title,
        formDataKeys: [...files.keys()],
      });

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

    const normalizeAndEncodeFileName = (name: string): string => {
      const normalized = name.normalize("NFC"); // 한글 정규화 (중요!)
      const dotIndex = normalized.lastIndexOf(".");
      if (dotIndex === -1) return encodeURIComponent(normalized); // 확장자 없음

      const nameWithoutExt = normalized.substring(0, dotIndex);
      const ext = normalized.substring(dotIndex + 1);
      return `${encodeURIComponent(nameWithoutExt)}.${ext}`;
    };

    console.log("Files before processing:", files);

    // 기존 파일 경로를 저장할 배열
    const existingFilePaths: string[] = [];

    files.forEach((file) => {
      if (file.type === "link") {
        formData.append("links", file.content);
      } else if (file.type === "image") {
        try {
          const images = JSON.parse(file.content);
          if (Array.isArray(images)) {
            // 기존 이미지와 새 이미지 분리
            const existingImages = images.filter(
              (img) =>
                img.url &&
                (img.url.startsWith("http://") ||
                  img.url.startsWith("https://"))
            );
            const newImages = images.filter(
              (img) => img.url && img.url.startsWith("data:")
            );

            // 기존 이미지 처리 - 원본 파일 경로 사용
            if (existingImages.length > 0 && file.originalPath) {
              existingFilePaths.push(file.originalPath);
            }

            // 새 이미지 처리
            if (newImages.length > 0) {
              const imageFiles: File[] = [];

              for (const image of newImages) {
                try {
                  const blobData = this.base64ToBlob(image.url);
                  const originalName = image.name || `image${imageCount}.png`;
                  const encodedFileName =
                    normalizeAndEncodeFileName(originalName);

                  // Blob에서 File 객체 생성
                  const imageFile = new File([blobData], encodedFileName, {
                    type: blobData.type,
                  });

                  imageFiles.push(imageFile);
                } catch (error) {
                  console.error("이미지 처리 오류:", error);
                }
              }

              // 이미지 파일들을 FormData에 추가
              if (imageFiles.length > 0) {
                for (const imgFile of imageFiles) {
                  formData.append(`images${imageCount}`, imgFile);
                }
                imageCount++;
              }
            }
          }
        } catch (error) {
          console.error("이미지 데이터 파싱 실패:", error);
        }
      } else if (file.type === "pdf") {
        if (file.content.startsWith("data:")) {
          // 새 PDF 파일
          const blobData = this.base64ToBlob(file.content);
          const fileName = file.name || "document.pdf";
          const encodedFileName = normalizeAndEncodeFileName(fileName);
          formData.append("files", blobData, encodedFileName);
        } else if (
          file.content.startsWith("http://") ||
          file.content.startsWith("https://")
        ) {
          // 기존 PDF 파일 - 원본 경로 사용
          if (file.originalPath) {
            existingFilePaths.push(file.originalPath);
          } else {
            existingFilePaths.push(file.content);
          }
        }
      } else if (file.type === "file") {
        if (file.content.startsWith("data:")) {
          // 새 일반 파일
          const blobData = this.base64ToBlob(file.content);
          const fileName = file.name || "file";
          const encodedFileName = normalizeAndEncodeFileName(fileName);
          formData.append("otherFiles", blobData, encodedFileName);
        } else if (
          file.content.startsWith("http://") ||
          file.content.startsWith("https://")
        ) {
          // 기존 일반 파일 - 원본 경로 사용
          if (file.originalPath) {
            existingFilePaths.push(file.originalPath);
          } else {
            existingFilePaths.push(file.content);
          }
        }
      }
    });

    // 기존 파일 정보를 FormData에 추가
    if (existingFilePaths.length > 0) {
      formData.append("existingFiles", JSON.stringify(existingFilePaths));
      console.log("Existing files:", existingFilePaths);
    }

    // FormData에 들어간 모든 키 출력
    console.log("FormData keys:", [...formData.keys()]);

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
