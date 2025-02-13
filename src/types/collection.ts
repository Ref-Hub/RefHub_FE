// src/types/collection.ts
export interface CollectionCard {
  _id: string;
  title: string;
  isShared: boolean;
  isFavorite: boolean;
  refCount: number;
  previewImages: string[];
}

export interface CollectionResponse extends CollectionCard {
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  data: CollectionCard[];
}

export interface GetCollectionParams {
  page: number;
  sortBy: string;
  search: string;
}

export interface SharedUser {
  collectionId: string;
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  role: string;
}

export interface OwnerUser {
  email: string;
  name: string;
  _id: string;
}

export interface SharedUsers {
  owner: OwnerUser;
  sharing: SharedUser[];
}
