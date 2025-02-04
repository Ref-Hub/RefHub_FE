// src/components/reference/ReferenceCard.tsx
import React, { useState, useEffect } from "react";
import { Reference as ReferenceCardProps } from "../../types/reference";
import { EllipsisVertical, Users, PencilLine, Trash2 } from "lucide-react";
import { modeState } from "../common/FloatingButton";
import { useRecoilState } from "recoil";

const ReferenceCard: React.FC<ReferenceCardProps> = ({
  id,
  shared,
  collectionTitle,
  referenceTitle,
  keywords,
  img,
  createdAt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modeValue, setMoveValue] = useRecoilState(modeState);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(false);
    setMoveValue((prev) => ({ ...prev, checkItems: [] }));
  }, [modeValue.isMove, modeValue.isDelete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setMoveValue((prev) => ({
      ...prev,
      checkItems: prev.checkItems.includes(e.target.id)
        ? prev.checkItems.filter((i) => i !== e.target.id)
        : [...prev.checkItems, e.target.id],
    }));
  };

  return (
    <div className="relative border border-gray-200 rounded-lg bg-white px-5">
      {/* 체크박스 or 더보기 */}
      {modeValue.isMove || modeValue.isDelete ? (
        <div>
          <input
            type="checkbox"
            id={id}
            checked={isChecked}
            onChange={(e) => handleChange(e)}
            className="hidden"
          />
          <label
            htmlFor={id}
            className={`w-5 h-5 absolute top-4 right-3 border-2 border-primary text-white flex items-center justify-center rounded cursor-pointer ${
              isChecked ? "bg-primary" : "bg-white"
            }`}
          >
            {isChecked && "✔"}
          </label>
        </div>
      ) : (
        <EllipsisVertical
          className="w-6 h-6 absolute top-4 right-1.5 hover:cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}
      {isOpen && (
        <ul className="absolute top-12 right-1.5 gap-2 inline-flex flex-col bg-white border border-gray-100 rounded shadow-[0px_0px_10px_0px_rgba(0,0,0,0.05)] z-10">
          <li className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 text-center rounded cursor-pointer hover:bg-gray-200">
            <PencilLine className="w-5 h-5 stroke-primary" />
            <p className="text-black text-sm font-normal">수정</p>
          </li>
          <li className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 text-center rounded cursor-pointer hover:bg-gray-200">
            <Trash2 className="w-5 h-5 stroke-[#f65063]" />
            <p className="text-black text-sm font-normal">삭제</p>
          </li>
        </ul>
      )}

      {/* 컬랙션제목 */}
      <h2 className="flex flex-row gap-2 items-center text-base font-normal text-gray-500 mt-4 mb-1">
        {shared && <Users className="w-5 h-5 stroke-gray-700" />}
        {collectionTitle}
      </h2>

      {/* 레퍼런스 제목 */}
      <p className="text-black text-lg font-bold mb-3 hover:cursor-pointer hover:underline">
        {referenceTitle}
      </p>

      {/* 키워드 */}
      <div className="flex flex-row gap-1 mb-3.5">
        {keywords?.map((word, index) => (
          <p
            key={index}
            className="px-1.5 py-1 bg-[#0a306c] rounded text-gray-100 text-xs font-medium"
          >
            {word}
          </p>
        ))}
      </div>

      {/* 이미지 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {img.slice(0, 4).map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Reference ${index + 1}`}
            className="object-contain w-[113px] h-[69.83px] rounded-sm"
          />
        ))}
      </div>

      {/* 생성날짜 */}
      <p className="text-right text-gray-500 text-xs font-normal mb-2">
        {createdAt}
      </p>
    </div>
  );
};

export default ReferenceCard;
