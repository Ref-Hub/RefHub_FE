// src/types/collection.ts
export interface Collection {
  id: string;
  name: string;
  isHidden: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceCardProps {
  title: string;
  referenceCount: number;
  images: string[];
}
