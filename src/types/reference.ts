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
  shared?: boolean;
  creator?: boolean;
  editor?: boolean;
  viewer?: boolean;
  previewData?: string[];
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
  size: string;
  images?: string[];
  previewURL?: string;
  previewURLs?: string[];
  filenames?: string[];
  content?: string;
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
  existingKeywords?: string[]; // 추가
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
    collectionId: string;
    collectionTitle: string;
    referenceTitle: string;
    createdAt: string;
    keywords: string[];
    memo: string;
    attachments: Array<{
      type: "link" | "image" | "pdf" | "file";
      path: string;
      size: string; // "200KB", "2MB" 등으로 내려올 수 있으므로 number 대신 string
      // 단일 파일명 또는 다중 파일명을 모두 지원하도록 optional 프로퍼티 추가
      filename?: string;
      filenames?: string[];
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
