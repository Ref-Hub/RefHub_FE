// src/components/collection/Collection.tsx
import React, { useState, useEffect, useRef } from "react";
import { CollectionCard as CollectionCardProps } from "../../types/collection";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  floatingModeState,
  modalState,
  alertState,
  DropState,
  shareModalState,
  FloatingState,
} from "@/store/collection";
import { collectionService } from "@/services/collection";
import { useToast } from "@/contexts/useToast";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Share2,
  EllipsisVertical,
  Users,
  PencilLine,
  Trash2,
} from "lucide-react";
import ImageGrid from "../common/ImageGrid";

const CollectionCard: React.FC<CollectionCardProps> = ({
  _id,
  title,
  refCount,
  previewImages,
  isFavorite,
  isShared,
  creator,
  viewer,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [modeValue, setModeValue] = useRecoilState(floatingModeState);
  const setDrop = useSetRecoilState(DropState);
  const setModalOpen = useSetRecoilState(modalState);
  const setAlert = useSetRecoilState(alertState);
  const setShareOpen = useSetRecoilState(shareModalState);
  const [imgs, setImgs] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(isFavorite);

  useEffect(() => {
    if (previewImages.length > 0) {
      // 중복 링크를 방지하기 위해 Set 사용
      const uniqueLinks = new Set<string>();

      previewImages.forEach((link) => {
        if (typeof link === "string" && !uniqueLinks.has(link)) {
          uniqueLinks.add(link);
          handleImg(link);
        }
      });
    }
  }, []);

  const handleImg = async (link: string) => {
    try {
      const data = await collectionService.getImage(link);
      // 중복 이미지 추가 방지
      setImgs((prev) => {
        // 이미 같은 URL이 있는지 확인
        if (prev.includes(data)) {
          return prev;
        }
        return [...prev, data];
      });
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("실패했습니다.", "error");
      }
    }
  };

  useEffect(() => {
    setIsChecked(false);
    setModeValue((prev) => ({ ...prev, checkItems: [] }));
  }, [modeValue.isMove, modeValue.isDelete]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setModeValue((prev) => ({
      ...prev,
      checkItems: prev.checkItems.includes(e.target.id)
        ? prev.checkItems.filter((i) => i !== e.target.id)
        : [...prev.checkItems, e.target.id],
    }));
  };

  const toggleStar = async (id: string) => {
    try {
      await collectionService.likeCollection(id);
      setFavorite((prev) => !prev);
      setAlert((prev) => ({ ...prev, isVisible: false }));
      showToast(
        favorite
          ? "즐겨찾기에서 제거되었습니다."
          : "즐겨찾기에 추가되었습니다.",
        "success"
      );
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("실패했습니다.", "error");
      }
    } finally {
      window.location.reload();
    }
  };

  const handleDelete = () => {
    let text = "";
    if (isShared) {
      text = `공유 중인 ${title} 컬렉션을 삭제하시겠습니까? \n컬렉션 내 모든 레퍼런스가 삭제되며, \n복구할 수 없습니다.`;
    } else if (refCount === 0) {
      text = `${title} 컬렉션을 삭제하시겠습니까?`;
    } else {
      text = `${title} 컬렉션을 삭제하시겠습니까? \n컬렉션 내 모든 레퍼런스가 삭제되며, \n복구할 수 없습니다.`;
    }
    setAlert({
      ids: [_id],
      massage: text,
      isVisible: true,
      type: "collection",
      title: "",
    });
  };

  const handleDetail = (event: React.MouseEvent) => {
    if (
      (event.target as HTMLElement).closest(".more-button") ||
      (event.target as HTMLElement).closest(".star") ||
      (event.target as HTMLElement).closest("input[type='checkbox']") ||
      (event.target as HTMLElement).closest("label") ||
      (event.target as HTMLElement).closest("li")
    ) {
      return;
    }

    if (modeValue.isMove || modeValue.isDelete) {
      setIsChecked(!isChecked);
      setModeValue((prev: FloatingState) => ({
        ...prev,
        checkItems: prev.checkItems.includes(_id)
          ? prev.checkItems.filter((i) => i !== _id)
          : [...prev.checkItems, _id],
      }));
    } else {
      setDrop({
        sortType: "latest",
        searchType: "all",
        searchWord: "",
        collections: [],
      });
      navigate(`/collections/${_id}`);
    }
  };

  return (
    <div
      data-testid="collection-card"
      className={`relative border border-gray-200 rounded-lg bg-white px-5 hover:cursor-pointer ${
        (modeValue.isMove || modeValue.isDelete) && viewer ? "opacity-50" : ""
      }`}
      onClick={(e) => handleDetail(e)}
    >
      {/* 체크박스 or 더보기 */}
      {modeValue.isMove || modeValue.isDelete ? (
        <>
          {!viewer && (
            <div>
              <input
                type="checkbox"
                id={_id}
                checked={isChecked}
                onChange={(e) => handleChange(e)}
                className="hidden"
              />
              <label
                htmlFor={_id}
                className={`w-5 h-5 absolute top-4 right-3 border-2 border-primary text-white flex items-center justify-center rounded cursor-pointer ${
                  isChecked ? "bg-primary" : "bg-white"
                }`}
              >
                {isChecked && "✔"}
              </label>
            </div>
          )}
        </>
      ) : (
        <div ref={addRef}>
          <EllipsisVertical
            className="more-button w-6 h-6 absolute top-4 right-1.5 hover:cursor-pointer hover:text-gray-600 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          />
          {isOpen && (
            <ul className="absolute top-12 right-1.5 gap-2 inline-flex flex-col bg-white border border-gray-100 rounded shadow-[0px_0px_10px_0px_rgba(0,0,0,0.05)] z-10">
              {!viewer && (
                <li
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 text-center rounded cursor-pointer hover:bg-gray-200"
                  onClick={() =>
                    setModalOpen({
                      id: _id,
                      title: title,
                      isOpen: true,
                      type: "update",
                    })
                  }
                >
                  <PencilLine className="w-5 h-5 stroke-primary" />
                  <p className="text-black text-sm font-normal">수정</p>
                </li>
              )}
              {creator && (
                <li
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 text-center rounded cursor-pointer hover:bg-gray-200"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-5 h-5 stroke-[#f65063]" />
                  <p className="text-black text-sm font-normal">삭제</p>
                </li>
              )}
              <li
                onClick={() =>
                  setShareOpen((prev) => ({
                    ...prev,
                    isOpen: true,
                    collectionId: _id,
                  }))
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 text-center rounded cursor-pointer hover:bg-gray-200"
              >
                <Share2 className="w-5 h-5 stroke-[#676967]" />
                <p className="text-black text-sm font-normal">공유</p>
              </li>
            </ul>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center mt-4 gap-1">
        <button
          onClick={() => toggleStar(_id)}
          aria-label="Toggle Star"
          className="star"
        >
          {favorite ? (
            <Star className="w-6 h-6  stroke-primary fill-primary" />
          ) : (
            <Star className="w-6 h-6" />
          )}
        </button>
        <h2 className="text-lg font-bold text-gray-800 flex-1 truncate hover:underline">
          {title}
        </h2>
        {isShared && <Users className="w-5 h-5 stroke-gray-700 mr-5" />}
      </div>

      {/* Reference Count */}
      <p className="text-gray-500 text-base font-medium mt-1.5">
        레퍼런스 {refCount}개
      </p>

      {/* 이미지 */}
      <div className="mb-2 py-5">
        <ImageGrid imgs={imgs} type="collection" />
      </div>
    </div>
  );
};

export default CollectionCard;
