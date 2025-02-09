// src/types/reference.ts
export interface Reference {
  _id: string;
  createAndShare: boolean;
  collectionId: string;
  title: string;
  keywords?: string[];
  memo?: string;
  previewURLs: string[];
  createdAt: string;
}

export interface GetReferenceParams {
  sortBy: string;
  collection: string | string[];
  view: string;
  mode: string;
}

export interface ReferenceFile {
  id: string;
  type: "link" | "pdf" | "image" | "other";
  url: string;
  name: string;
}

// 새로 추가되는 타입들
export interface CreateReferenceFile {
  id: string;
  type: 'link' | 'image' | 'pdf' | 'file';
  content: string;
  name?: string;
}

export interface CreateReferencePayload {
  collectionTitle: string;
  title: string;
  keywords?: string[];
  memo?: string;
  files: CreateReferenceFile[];
}

export interface CreateReferenceResponse {
  message: string;
  reference: Reference;
}

export interface ReferenceApiError {
  error: string;
  code?: string;
  status?: number;
}