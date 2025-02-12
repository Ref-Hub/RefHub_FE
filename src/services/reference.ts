// src/services/reference.ts

import api from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import { FILE_LIMITS } from "@/types/reference";
import type {
 GetReferenceParams,
 Reference,
 CreateReferenceResponse,
 UpdateReferenceRequest,
 ReferenceResponse,
 ReferenceDetailResponse,
 ReferenceListResponse,
 ImageFile,
 ReferenceFileGroups,
} from "@/types/reference";

class ReferenceService {
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
       files: referenceDetail.attachments.map((attachment) => ({
         _id: attachment.path,
         type: attachment.type,
         path: attachment.path,
         size: attachment.size,
         images: attachment.images,
         previewURL: attachment.previewURL,
         previewURLs: attachment.previewURLs,
       })),
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
   collectionTitle,
   title,
   keywords,
   memo,
   files,
 }: UpdateReferenceRequest): Promise<CreateReferenceResponse> {
   try {
     console.log("createReference 시작:", { files });
     const formData = new FormData();
     formData.append("collectionTitle", collectionTitle);
     formData.append("title", title);

     if (keywords?.length) {
       formData.append("keywords", keywords.join(" "));
     }

     if (memo) {
       formData.append("memo", memo);
     }

     // 파일 그룹화
     const fileGroups: ReferenceFileGroups = {
       links: [],
       images1: [],
       images2: [],
       images3: [],
       images4: [],
       images5: [],
       files: [],
       otherFiles: [],
     };

     // 파일 분류
     for (const file of files) {
       if (file.type === "link") {
         const link = file.content;
         if (link.startsWith("http://") || link.startsWith("https://")) {
           fileGroups.links!.push(link);
         }
         continue;
       }

       if (file.type === "image") {
         const groupIndex = file.groupIndex || 1;
         if (groupIndex < 1 || groupIndex > FILE_LIMITS.MAX_IMAGE_GROUPS) continue;

         try {
           const images = JSON.parse(file.content) as ImageFile[];
           if (!Array.isArray(images)) continue;

           const imageGroup = `images${groupIndex}` as keyof ReferenceFileGroups;
           for (const image of images) {
             if (!image.url) continue;
             const blobData = this.base64ToBlob(image.url);
             const imageFile = new File(
               [blobData],
               image.name || `image${Date.now()}.jpg`,
               { type: blobData.type }
             );
             if (!fileGroups[imageGroup]) {
               fileGroups[imageGroup] = [];
             }
             (fileGroups[imageGroup] as File[]).push(imageFile);
           }
         } catch (error) {
           console.error("이미지 처리 실패:", error);
         }
         continue;
       }

       if (file.type === "pdf") {
         try {
           const blobData = this.base64ToBlob(file.content);
           const pdfFile = new File(
             [blobData],
             file.name || `pdf_${Date.now()}.pdf`,
             { type: FILE_LIMITS.ALLOWED_PDF_TYPE }
           );
           if (fileGroups.files) {
             fileGroups.files.push(pdfFile);
           }
         } catch (error) {
           console.error("PDF 파일 처리 실패:", error);
         }
         continue;
       }

       if (file.type === "file") {
         try {
           const blobData = this.base64ToBlob(file.content);
           const otherFile = new File(
             [blobData],
             file.name || `file_${Date.now()}`,
             { type: blobData.type }
           );
           if (fileGroups.otherFiles) {
             fileGroups.otherFiles.push(otherFile);
           }
         } catch (error) {
           console.error("파일 처리 실패:", error);
         }
       }
     }

     // FormData에 파일 추가
     fileGroups.links?.forEach((link: string) => {
       formData.append("links", link);
     });

     for (let i = 1; i <= FILE_LIMITS.MAX_IMAGE_GROUPS; i++) {
       const imageGroup = fileGroups[`images${i}` as keyof ReferenceFileGroups] as File[];
       if (imageGroup?.length) {
         imageGroup.forEach(file => {
           formData.append(`images${i}`, file);
         });
       }
     }

     fileGroups.files?.forEach((file: File) => {
       formData.append("files", file);
     });

     fileGroups.otherFiles?.forEach((file: File) => {
       formData.append("otherFiles", file);
     });

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
     console.error("createReference 에러:", error);
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

     // 파일 그룹화 로직
     const fileGroups: ReferenceFileGroups = {
       links: [],
       images1: [],
       images2: [],
       images3: [],
       images4: [],
       images5: [],
       files: [],
       otherFiles: [],
     };

     // 파일 분류
     for (const file of files) {
       if (file.type === "link") {
         const link = file.content;
         if (link.startsWith("http://") || link.startsWith("https://")) {
           fileGroups.links!.push(link);
         }
         continue;
       }

       if (file.type === "image") {
         const groupIndex = file.groupIndex || 1;
         if (groupIndex < 1 || groupIndex > FILE_LIMITS.MAX_IMAGE_GROUPS) continue;

         try {
           const images = JSON.parse(file.content) as ImageFile[];
           if (!Array.isArray(images)) continue;

           const imageGroup = `images${groupIndex}` as keyof ReferenceFileGroups;
           for (const image of images) {
             if (!image.url) continue;
             const blobData = this.base64ToBlob(image.url);
             const imageFile = new File(
               [blobData],
               image.name || `image${Date.now()}.jpg`,
               { type: blobData.type }
             );
             if (!fileGroups[imageGroup]) {
               fileGroups[imageGroup] = [];
             }
             (fileGroups[imageGroup] as File[]).push(imageFile);
           }
         } catch (error) {
           console.error("이미지 처리 실패:", error);
         }
         continue;
       }

       if (file.type === "pdf") {
         try {
           const blobData = this.base64ToBlob(file.content);
           const pdfFile = new File(
             [blobData],
             file.name || `pdf_${Date.now()}.pdf`,
             { type: FILE_LIMITS.ALLOWED_PDF_TYPE }
           );
           if (fileGroups.files) {
             fileGroups.files.push(pdfFile);
           }
         } catch (error) {
           console.error("PDF 파일 처리 실패:", error);
         }
         continue;
       }

       if (file.type === "file") {
         try {
           const blobData = this.base64ToBlob(file.content);
           const otherFile = new File(
             [blobData],
             file.name || `file_${Date.now()}`,
             { type: blobData.type }
           );
           if (fileGroups.otherFiles) {
             fileGroups.otherFiles.push(otherFile);
           }
         } catch (error) {
           console.error("파일 처리 실패:", error);
         }
       }
     }

     // FormData에 파일 추가
     fileGroups.links?.forEach((link: string) => {
       formData.append("links", link);
     });

     for (let i = 1; i <= FILE_LIMITS.MAX_IMAGE_GROUPS; i++) {
       const imageGroup = fileGroups[`images${i}` as keyof ReferenceFileGroups] as File[];
       if (imageGroup?.length) {
         imageGroup.forEach(file => {
           formData.append(`images${i}`, file);
         });
       }
     }

     fileGroups.files?.forEach((file: File) => {
       formData.append("files", file);
     });

     fileGroups.otherFiles?.forEach((file: File) => {
       formData.append("otherFiles", file);
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