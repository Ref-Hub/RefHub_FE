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

  // src/services/reference.ts
  private async transformUrl(url?: string): Promise<string> {
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
  // src/services/reference.ts - updateReference 함수 수정
  async updateReference(
    id: string,
    { collectionId, title, keywords, memo, files }: UpdateReferenceRequest
  ): Promise<ReferenceResponse> {
    try {
      const formData = new FormData();
      formData.append("collectionId", collectionId); // collectionTitle 대신 collectionId 사용
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

  // src/services/reference.ts
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

    // 백엔드 분석: 실제 원본 파일 경로 추출 필요
    // 이미지 미리보기 URL에서 원본 파일 경로 추출
    const extractOriginalPath = (previewUrl: string): string => {
      // 프리뷰 이미지 URL -> 원본 이미지 URL 변환
      // 예: /previews/x-y-z-image.jpeg-preview.png -> /x-y-z-image.jpeg
      if (previewUrl.includes("-preview.png")) {
        const baseUrl =
          "https://refhub-bucket.s3.ap-northeast-2.amazonaws.com/";
        const fileName = previewUrl.split("/").pop();
        if (fileName) {
          const originalFileName = fileName.replace("-preview.png", "");
          return baseUrl + originalFileName;
        }
      }
      return previewUrl;
    };

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

            // 기존 이미지 처리 - 원본 파일 경로 추출하여 existingFilePaths에 추가
            existingImages.forEach((image) => {
              const originalPath = extractOriginalPath(image.url);
              existingFilePaths.push(originalPath);
            });

            // 새 이미지 처리
            if (newImages.length > 0) {
              newImages.forEach((image: { url: string; name?: string }) => {
                try {
                  const blobData = this.base64ToBlob(image.url);
                  const originalName = image.name || `image${imageCount}.png`;
                  const encodedFileName =
                    normalizeAndEncodeFileName(originalName);

                  formData.append(
                    `images${imageCount}`,
                    blobData,
                    encodedFileName
                  );
                } catch (error) {
                  console.error("이미지 처리 오류:", error);
                }
              });
              imageCount++;
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
          // 기존 PDF 파일
          const originalPath = extractOriginalPath(file.content);
          existingFilePaths.push(originalPath);
        }
      } else {
        // 일반 파일
        if (file.content.startsWith("data:")) {
          const blobData = this.base64ToBlob(file.content);
          const fileName = file.name || "file";
          const encodedFileName = normalizeAndEncodeFileName(fileName);
          formData.append("otherFiles", blobData, encodedFileName);
        } else if (
          file.content.startsWith("http://") ||
          file.content.startsWith("https://")
        ) {
          // 기존 일반 파일
          const originalPath = extractOriginalPath(file.content);
          existingFilePaths.push(originalPath);
        }
      }
    });

    // 백엔드가 기대하는 형식으로 기존 파일 정보 추가
    if (existingFilePaths.length > 0) {
      // existingFilePaths를 JSON 문자열로 변환하여 FormData에 추가
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
