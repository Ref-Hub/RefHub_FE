// src/components/reference/ReferenceCard.tsx
import React from "react";
import { Reference as ReferenceCardProps } from "../../types/reference";
import { EllipsisVertical, Users } from "lucide-react";

const ReferenceCard: React.FC<ReferenceCardProps> = ({
  shared,
  collectionTitle,
  referenceTitle,
  keywords,
  img,
  createdAt,
}) => {
  return (
    <div className="relative border border-gray-200 rounded-lg bg-white px-5">
      {/* 컬랙션제목 */}
      <EllipsisVertical className="w-6 h-6 absolute top-4 right-1.5 hover:cursor-pointer" />
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