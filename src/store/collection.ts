// src/store/collection.ts
import { atom } from "recoil";
import { CollectionResponse } from "@/types/collection";

export const modalState = atom({
  key: "modalState",
  default: { type: "", isOpen: false, id: "", title: "" },
});

export const DropState = atom({
  key: "DropdownState",
  default: {
    sortType: "latest",
    searchType: "all",
    searchWord: "",
    //checkItems: [] as string[],
    collections: [] as string[],
  },
});

export const floatingModeState = atom({
  key: "floatingState",
  default: {
    isMove: false,
    isDelete: false,
    isShared: [] as boolean[], // 공유 여부
    checkItems: [] as string[], //삭제 혹은 이동할 레퍼런스들
  },
});

export const collectionState = atom({
  key: "collectionState",
  default: {} as CollectionResponse,
});

export const alertState = atom({
  key: "alertState",
  default: {
    type: "collection",
    massage: "",
    ids: [] as string[], // 삭제할 아이디
    isVisible: false,
  },
});
