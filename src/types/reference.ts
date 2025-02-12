// src/types/reference.ts

// 파일 제한 상수
export const FILE_LIMITS = {
  MAX_TOTAL_FILES: 5,
  MAX_IMAGES_PER_GROUP: 5,
  MAX_IMAGE_GROUPS: 5,
  MAX_PDF_FILES: 5,
  MAX_OTHER_FILES: 5,
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif"] as const,
  ALLOWED_PDF_TYPE: "application/pdf" as const,
} as const;

// API 요청 관련 타입
export interface GetReferenceParams {
  sortBy?: "latest" | "oldest" | "sortAsc" | "sortDesc";
  page?: number;
  collection?: string | string[];
  filterBy?: "all" | "title" | "keyword";
  search?: string;
  view?: "card" | "list";
  mode?: "home" | "delete" | "move";
}

export interface CreateReferenceFile {
  id: string;
  type: "link" | "image" | "pdf" | "file";
  content: string;
  name?: string;
  groupIndex?: number;
}

export interface ImageFile {
  url: string;
  name?: string;
}

export interface ReferenceFileGroups {
  links?: string[];
  images1?: File[];
  images2?: File[];
  images3?: File[];
  images4?: File[];
  images5?: File[];
  files?: File[];
  otherFiles?: File[];
}

export interface UpdateReferenceRequest {
  collectionTitle: string;
  title: string;
  keywords?: string[];
  memo?: string;
  files: CreateReferenceFile[];
}

// API 응답 관련 타입
export interface ReferenceFile {
  _id: string;
  type: "link" | "image" | "pdf" | "file";
  path: string;
  size: number;
  images?: string[];
  previewURL?: string;
  previewURLs?: string[];
}

export interface Reference {
  _id: string;
  collectionId: string;
  collectionTitle: string;
  title: string;
  keywords: string[];
  memo: string;
  files: ReferenceFile[];
  createdAt: string;
  createAndShare?: boolean;
  viewer?: boolean;
  editor?: boolean;
}

export interface ReferenceListResponse {
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  data: Reference[];
  message?: string;
}

export interface ReferenceDetailResponse {
  message: string;
  referenceDetail: {
    collectionId: string;
    collectionTitle: string;
    referenceTitle: string;
    keywords: string[];
    memo: string;
    attachments: {
      type: "link" | "image" | "pdf" | "file";
      path: string;
      size: number;
      images?: string[];
      previewURL?: string;
      previewURLs?: string[];
    }[];
    createdAt: string;
  };
}

export interface CreateReferenceResponse {
  message: string;
  reference: {
    collectionId: string;
    title: string;
    keywords: string[];
    memo: string;
    files: {
      type: "link" | "image" | "pdf" | "file";
      path: string;
      size: number;
      images: string[];
      previewURL?: string;
      previewURLs?: string[];
      _id: string;
    }[];
    _id: string;
    createdAt: string;
    __v: number;
  };
}

export interface ReferenceResponse {
  message: string;
  reference: Reference;
}

// 파일 업로드 관련 타입
export interface FileUploadResponse {
  id: string;
  filename: string;
  contentType: string;
}

// 에러 응답 타입
export interface ErrorResponse {
  error: string;
  message?: string;
}

// 기존 타입 정의들 아래에 추가
export interface ReferenceApiError {
  error: string;
  message?: string;
  code?: string;
  status?: number;
}
