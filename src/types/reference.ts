// src/types/reference.ts
export interface Reference {
  _id: string;
  createAndShare: boolean;
  collectionId: string;
  title: string;
  keywords?: string[];
  memo?: string;
  previewURLs: string[];
  //files?: ReferenceFile[];
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
