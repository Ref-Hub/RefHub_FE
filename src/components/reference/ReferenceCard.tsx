import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Reference } from "../../types/reference";
import {
  EllipsisVertical,
  Users,
  PencilLine,
  Trash2,
  Image,
} from "lucide-react";
import {
  floatingModeState,
  collectionState,
  alertState,
  FloatingState,
} from "@/store/collection";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { collectionService } from "@/services/collection";
import { useToast } from "@/contexts/useToast";

const ReferenceCard: React.FC<
  Pick<
    Reference,
    | "_id"
    | "shared"
    | "creator"
    | "editor"
    | "viewer"
    | "title"
    | "keywords"
    | "previewData"
    | "createdAt"
    | "collectionTitle"
  >
> = ({
  _id,
  shared,
  viewer,
  title,
  keywords = [],
  previewData = [],
  createdAt,
  collectionTitle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const date = new Date(createdAt);
  const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`;
  const collectionData = useRecoilValue(collectionState);
  const [modeValue, setModeValue] = useRecoilState(floatingModeState);
  const setAlert = useSetRecoilState(alertState);
  const [isChecked, setIsChecked] = useState(false);
  const [imgs, setImgs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const moreRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(keywords.length);

  const calculateVisibleTags = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    let totalWidth = 0;
    let lastVisibleIndex = keywords.length;

    for (let i = 0; i < keywords.length; i++) {
      const tagWidth = tagRefs.current[i]?.offsetWidth || 60;
      totalWidth += tagWidth + 4;

      const moreWidth = moreRef.current?.offsetWidth || 30;
      if (totalWidth + moreWidth > containerWidth) {
        lastVisibleIndex = i;
        break;
      }
    }
    setVisibleCount(lastVisibleIndex);
  }, [keywords]);

  useEffect(() => {
    calculateVisibleTags();
    window.addEventListener("resize", calculateVisibleTags);
    return () => window.removeEventListener("resize", calculateVisibleTags);
  }, [calculateVisibleTags]);

  useEffect(() => {
    if (previewData.length > 0) {
      previewData.map((link) => {
        if (typeof link === "string") {
          handleImg(link);
        }
      });
    }
  }, []);

  const handleImg = async (link: string) => {
    try {
      const data = await collectionService.getImage(link);
      setImgs((prev) => [...prev, data]);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("이미지 로딩 실패했습니다.", "error");
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
    setModeValue((prev: FloatingState) => ({
      ...prev,
      checkItems: prev.checkItems.includes(e.target.id)
        ? prev.checkItems.filter((i) => i !== e.target.id)
        : [...prev.checkItems, e.target.id],
    }));
  };

  const handleDelete = () => {
    const text = shared
      ? `${
          collectionTitle || "선택한"
        } 컬렉션의 다른 사용자와 공유 중인 ${title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`
      : `${title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`;

    location.pathname.includes("/collections")
      ? setAlert({
          ids: [_id],
          massage: text,
          isVisible: true,
          type: "collectionDetailRemoveRef",
          title: title,
        })
      : setAlert({
          ids: [_id],
          massage: text,
          isVisible: true,
          type: "reference",
          title: title,
        });

    setIsOpen(false);
  };

  const handleEdit = () => {
    navigate(`/references/${_id}/edit`);
    setIsOpen(false);
  };

  const handleReferenceClick = (event: React.MouseEvent) => {
    if (
      (event.target as HTMLElement).closest(".more-button") ||
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
      navigate(`/references/${_id}`);
    }
  };

  if (!collectionData?.data?.length) {
    return (
      <div className="relative border border-gray-200 rounded-lg bg-white px-5">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mt-4 mb-1"></div>
          <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
          <div className="flex gap-2 mb-3.5">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-[152px] bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24 ml-auto mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="reference-card"
      className="relative border border-gray-200 rounded-lg bg-white px-5 hover:cursor-pointer"
      onClick={(e) => handleReferenceClick(e)}
    >
      {!viewer &&
        (modeValue.isMove || modeValue.isDelete ? (
          <div>
            <input
              type="checkbox"
              id={_id}
              checked={isChecked}
              onChange={handleChange}
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
        ) : (
          <div ref={addRef}>
            <EllipsisVertical
              className="more-button w-6 h-6 absolute top-4 right-1.5 hover:cursor-pointer hover:text-gray-600 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            />
            {isOpen && (
              <ul className="absolute top-12 right-1.5 gap-2 inline-flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px] z-10">
                <li>
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <PencilLine className="w-4 h-4 stroke-primary" />
                    <span>수정</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 stroke-[#f65063]" />
                    <span>삭제</span>
                  </button>
                </li>
              </ul>
            )}
          </div>
        ))}

      <h2 className="flex flex-row gap-2 items-center text-base font-normal text-gray-500 mt-4 mb-1 mr-4">
        {shared && <Users className="w-5 h-5 stroke-gray-700" />}
        <p className="flex-1 truncate">{collectionTitle || "불러오는 중..."}</p>
      </h2>

      <p className="text-black text-lg font-bold mb-3 flex-1 truncate hover:underline">
        {title}
      </p>

      <div ref={containerRef} className="flex flex-wrap gap-1.5 mb-3.5 min-h-6">
        {keywords.slice(0, visibleCount).map((word, index) => (
          <span
            key={`${word}-${index}`}
            ref={(el) => (tagRefs.current[index] = el)}
            className="px-2 py-1 bg-[#0a306c] rounded text-gray-100 text-xs font-medium"
          >
            {word}
          </span>
        ))}
        {visibleCount < keywords.length && (
          <span
            ref={moreRef}
            className="px-2 py-1 bg-[#0a306c] rounded text-gray-100 text-xs font-medium"
          >
            +{keywords.length - visibleCount}
          </span>
        )}
      </div>

      <div className="mb-2 min-h-[152px]">
        {imgs.length === 1 && (
          <img
            src={imgs[0]}
            className="w-full h-[152px] object-contain rounded-lg"
          />
        )}
        {(imgs ?? []).length > 1 && (
          <div className="grid grid-cols-2 gap-2">
            {imgs.slice(0, 4).map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`Preview ${index + 1}`}
                className="object-contain w-[113px] h-[69.83px] rounded-lg"
              />
            ))}
          </div>
        )}
        {imgs.length === 0 && (
          <div className="bg-gray-100 w-full h-[152px] py-4 flex justify-center rounded-lg flex-col items-center gap-5">
            <Image className="w-[80px] h-[80px] stroke-primary" />
          </div>
        )}
      </div>

      <p className="text-right text-gray-500 text-xs font-normal mb-2">
        {formattedDate}
      </p>
    </div>
  );
};

export default ReferenceCard;
