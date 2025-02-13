// src/types/reference.ts

// 기본 Reference 인터페이스
export interface Reference {
  _id: string;
  collectionId: string;
  collectionTitle?: string; // 추가
  title: string;
  keywords?: string[];
  memo?: string;
  files: ReferenceFile[];
  createAndShare?: boolean;
  previewURLs?: { type: string; url: string }[];
  createdAt: string;
}

// API 조회 파라미터
export interface GetReferenceParams {
  sortBy: string;
  collection: string | string[];
  view: string;
  mode: string;
}

// 파일 관련 타입들
export interface ReferenceFile {
  _id: string;
  type: "link" | "image" | "pdf" | "file";
  path: string;
  size: number;
  images?: string[];
  previewURL?: string;
  previewURLs?: string[];
}

// 레퍼런스 생성/수정 시 사용되는 파일 타입
export interface CreateReferenceFile {
  id: string;
  type: "link" | "image" | "pdf" | "file";
  content: string;
  name?: string;
}

// 레퍼런스 생성/수정 요청 페이로드
export interface UpdateReferenceRequest {
  collectionTitle: string;
  title: string;
  keywords?: string[];
  memo?: string;
  files: FormData;
}

// API 응답 타입들
export interface ReferenceResponse {
  message: string;
  reference: Reference;
}

export interface CreateReferenceResponse {
  message: string;
  reference: Reference;
}

export interface ReferenceDetailResponse {
  message: string;
  referenceDetail: {
    collectionId: string; // 추가
    collectionTitle: string;
    referenceTitle: string;
    createdAt: string;
    keywords: string[];
    memo: string;
    attachments: Array<{
      type: "link" | "image" | "pdf" | "file";
      path: string;
      size: number;
      images?: string[];
      previewURL?: string;
      previewURLs?: string[];
    }>;
  };
}

// 에러 관련 타입
export interface ReferenceApiError {
  error: string;
  code?: string;
  status?: number;
}

// 리스트 조회 응답 타입
export interface ReferenceListResponse {
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  data: Reference[];
  message?: string;
}
