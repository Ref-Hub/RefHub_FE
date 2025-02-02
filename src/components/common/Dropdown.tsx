import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DropdownProps {
  type: "array" | "searchType";
  setSort: (sortType: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ type, setSort }) => {
  const options = {
    array: [
      // 레퍼런스 정렬
      { en: "latest", ko: "최신순" },
      { en: "earliest", ko: "오래된순" },
      { en: "ascending", ko: "오름차순" },
      { en: "descending", ko: "내림차순" },
    ],
    searchType: [
      // 검색타입
      { en: "all", ko: "전체 검색" },
      { en: "title", ko: "제목" },
      { en: "keyword", ko: "키워드" },
    ],
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[type][0].ko);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option: { en: string; ko: string }) => {
    setSort(option.en);
    setSelectedOption(option.ko);
    setIsOpen(false);
  };

  return (
    <div className="relative text-base">
      <div
        className={`flex items-center gap-2 pl-5 pr-4 py-[13px] cursor-pointer text-gray-700 font-normal`}
        onClick={toggleDropdown}
      >
        {selectedOption}
        {isOpen ? (
          <ChevronUp className="w-6 h-6 stroke-gray-700" />
        ) : (
          <ChevronDown className="w-6 h-6 stroke-gray-700" />
        )}
      </div>
      {isOpen && (
        <ul className="absolute w-full gap-2 bg-white border border-gray-200 rounded-lg shadow-[0px_0px_10px_0px_rgba(181,184,181,0.20)] z-10">
          {options[type].map((option, index) => (
            <li
              key={index}
              className="px-4 py-2 text-gray-700 text-center cursor-pointer hover:text-primary hover:font-semibold"
              onClick={() => handleSelect(option)}
            >
              {option.ko}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
