// src/components/collection/Modal.tsx
import { useState, useEffect } from "react";
import { X, CircleX } from "lucide-react";
import { useToast } from "@/contexts/useToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { modalState, collectionState } from "@/store/collection";
import { collectionService } from "@/services/collection";

const Modal: React.FC = () => {
  const types = {
    create: ["컬렉션 생성", "생성", "컬렉션의 제목을 입력해 주세요."],
    update: ["컬렉션 수정", "수정 완료"],
  };
  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const [inputValue, setInputValue] = useState("");
  const { showToast } = useToast();
  const collectiondata = useRecoilValue(collectionState);

  useEffect(() => {
    setInputValue(isOpen.type === "update" ? isOpen.title : "");
  }, [isOpen]);

  const handleClick = async () => {
    try {
      if (collectiondata?.data?.some((item) => item.title === inputValue)) {
        showToast("이미 동일한 이름의 컬렉션이 있습니다.", "error");
      } else if (isOpen.type === "create") {
        await collectionService.createCollection(inputValue);
        showToast("컬렉션이 생성되었습니다.", "success");
        setIsOpen((prev) => ({ ...prev, isOpen: false }));
      } else {
        await collectionService.updateCollection(isOpen.id, inputValue);
        showToast("컬렉션이 수정되었습니다.", "success");
        setIsOpen((prev) => ({ ...prev, isOpen: false }));
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("실패했습니다.", "error");
      }
    }
  };

  useEffect(() => {}, []);

  return (
    <div className="flex fixed top-0 left-0 w-full h-full bg-black/60 z-20 items-center justify-center">
      <div className="flex flex-col items-center w-[520px] h-[294px] py-6 px-8 relative bg-[#f9faf9] rounded-2xl">
        <X
          className="absolute w-9 h-9 top-6 right-6 stroke-gray-700 hover: cursor-pointer"
          onClick={() => setIsOpen((prev) => ({ ...prev, isOpen: false }))}
        />
        <p className="text-black text-2xl font-semibold">
          {isOpen.type === "create" ? types["create"][0] : types["update"][0]}
        </p>
        <p className="text-xl font-semibold mt-8 w-full">컬렉션 명</p>
        <div className="relative">
          {inputValue.length > 0 && (
            <CircleX
              className="absolute top-8 right-5 w-6 h-6 fill-gray-700 stroke-white hover: cursor-pointer"
              onClick={() => setInputValue("")}
            />
          )}
          <input
            type="text"
            placeholder={isOpen.type === "create" ? types["create"][2] : ""}
            value={inputValue}
            maxLength={20}
            onChange={(e) => setInputValue(e.target.value)}
            className=" w-[456px] mt-4 py-4 px-5 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          />
        </div>
        <button
          onClick={handleClick}
          disabled={inputValue.length === 0}
          className="w-full mt-6 p-3.5 flex justify-center bg-primary rounded-lg text-[#F9FAF9] text-lg font-bold transition-colors duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-500"
        >
          {isOpen.type === "create" ? types["create"][1] : types["update"][1]}
        </button>
      </div>
    </div>
  );
};

export default Modal;
