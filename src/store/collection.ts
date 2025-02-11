import { atom } from "recoil";
import { CollectionResponse } from "@/types/collection";

interface ModalState {
  type: string;
  isOpen: boolean;
  id: string;
  title: string;
}

interface ShareModalState {
  isOpen: boolean;
}

interface DropdownState {
  sortType: string;
  searchType: string;
  searchWord: string;
  collections: string[];
}

interface FloatingState {
  isMove: boolean;
  isDelete: boolean;
  isShared: boolean[];
  checkItems: string[];
}

interface AlertState {
  type: string;
  massage: string;
  ids: string[];
  isVisible: boolean;
  title: string;
}

export const modalState = atom<ModalState>({
  key: "modalState",
  default: {
    type: "",
    isOpen: false,
    id: "",
    title: "",
  },
});

export const shareModalState = atom<ShareModalState>({
  key: "shareModalState",
  default: { isOpen: false },
});

export const DropState = atom<DropdownState>({
  key: "DropdownState",
  default: {
    sortType: "latest",
    searchType: "all",
    searchWord: "",
    collections: [],
  },
});

export const floatingModeState = atom<FloatingState>({
  key: "floatingState",
  default: {
    isMove: false,
    isDelete: false,
    isShared: [],
    checkItems: [],
  },
});

export const collectionState = atom<{ data: CollectionResponse["data"] }>({
  key: "collectionState",
  default: {
    data: [],
  },
});

export const alertState = atom<AlertState>({
  key: "alertState",
  default: {
    type: "collection",
    massage: "",
    ids: [],
    isVisible: false,
    title: "",
  },
});
