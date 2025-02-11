import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Reference as ReferenceCardProps } from "../../types/reference";
import { EllipsisVertical, Users, PencilLine, Trash2 } from "lucide-react";
import {
  floatingModeState,
  collectionState,
  alertState,
} from "@/store/collection";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import folder from "@/assets/images/folder.svg";

const ReferenceCard: React.FC<ReferenceCardProps> = ({
  _id,
  createAndShare,
  collectionId,
  title,
  keywords,
  previewURLs,
  createdAt,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const collectionData = useRecoilValue(collectionState);
  const collectionTitle =
    collectionData.data.find((item) => item._id === collectionId)?.title ||
    null;
  const [modeValue, setModeValue] = useRecoilState(floatingModeState);
  const setAlert = useSetRecoilState(alertState);
  const [isChecked, setIsChecked] = useState(false);

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
      isShared: [...prev.isShared, createAndShare],
      checkItems: prev.checkItems.includes(e.target.id)
        ? prev.checkItems.filter((i) => i !== e.target.id)
        : [...prev.checkItems, e.target.id],
    }));
  };

  const handleDelete = () => {
    const text = createAndShare
      ? `${collectionTitle} 컬렉션의 다른 사용자와 공유 중인 ${title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`
      : `${title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`;

    setAlert({
      ids: [_id],
      massage: text,
      isVisible: true,
      type: "reference",
    });
    setIsOpen(false);
  };

  const handleEdit = () => {
    navigate(`/references/${_id}/edit`);
    setIsOpen(false);
  };

  const handleTitleClick = () => {
    navigate(`/references/${_id}`);
  };

  return (
    <div className="relative border border-gray-200 rounded-lg bg-white px-5">
      {modeValue.isMove || modeValue.isDelete ? (
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
      ) : (
        <div ref={addRef}>
          <EllipsisVertical
            className="w-6 h-6 absolute top-4 right-1.5 hover:cursor-pointer hover:text-gray-600 transition-colors"
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
      )}

      <h2 className="flex flex-row gap-2 items-center text-base font-normal text-gray-500 mt-4 mb-1 mr-4">
        {createAndShare && <Users className="w-5 h-5 stroke-gray-700" />}
        <p className="flex-1 truncate">{collectionTitle}</p>
      </h2>

      <p 
        onClick={handleTitleClick}
        className="text-black text-lg font-bold mb-3 flex-1 truncate hover:cursor-pointer hover:underline"
      >
        {title}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {keywords?.map((word, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-[#0a306c] rounded text-gray-100 text-xs font-medium"
          >
            {word}
          </span>
        ))}
      </div>

      <div className="mb-2 min-h-[152px]">
        {previewURLs?.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {previewURLs.slice(0, 4).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Preview ${index + 1}`}
                className="object-contain w-[113px] h-[69.83px] rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 w-full py-4 flex justify-center rounded-lg flex-col items-center gap-5">
            <img src={folder} alt="Empty folder" className="w-[54%]" />
            <p className="text-gray-700 text-sm font-normal">
              아직 레퍼런스가 없어요.
            </p>
          </div>
        )}
      </div>

      <p className="text-right text-gray-500 text-xs font-normal mb-2">
        {createdAt}
      </p>
    </div>
  );
};

export default ReferenceCard;