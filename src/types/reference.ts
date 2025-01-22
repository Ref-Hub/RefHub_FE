// src/types/reference.ts
export interface Reference {
  id?: string;
  shared: boolean;
  collectionTitle: string;
  referenceTitle: string;
  keywords?: string[];
  memo?: string;
  img: string[];
  //files?: ReferenceFile[];
  //collectionId: string;
  createdAt: string;
  //updatedAt: string;
}

export interface ReferenceFile {
  id: string;
  type: "link" | "pdf" | "image" | "other";
  url: string;
  name: string;
}
