// src/components/collection/Modal.tsx
import { useState } from "react";
import { X, CircleX, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/contexts/useToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { modalState, collectionState, alertState } from "@/store/collection";
import { collectionService } from "@/services/collection";

interface ModalProps {
  type: string;
}

const Modal: React.FC<ModalProps> = ({ type }) => {
  const types: { [key: string]: string[] } = {
    create: ["컬렉션 생성", "생성", "컬렉션의 제목을 입력해 주세요."],
    update: ["컬렉션 수정", "수정 완료"],
    move: ["컬렉션 이동", "이동"],
  };
  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const [alert, setAlert] = useRecoilState(alertState);
  const [dropOpen, setdropOpen] = useState({
    open: false,
    value: "컬렉션을 선택해주세요.",
  });
  const { showToast } = useToast();
  const collectiondata = useRecoilValue(collectionState);

  const handleClick = async () => {
    try {
      if (type !== "move") {
        if (collectiondata?.data?.some((item) => item.title === isOpen.title)) {
          showToast("이미 동일한 이름의 컬렉션이 있습니다.", "error");
        } else if (isOpen.type === "create") {
          await collectionService.createCollection(isOpen.title);
          showToast("컬렉션이 생성되었습니다.", "success");
          setIsOpen((prev) => ({ ...prev, isOpen: false }));
        } else {
          await collectionService.updateCollection(isOpen.id, isOpen.title);
          showToast("컬렉션이 수정되었습니다.", "success");
          setIsOpen((prev) => ({ ...prev, isOpen: false }));
        }
      } else {
        setAlert((prev) => ({
          ...prev,
          type: "move",
          massage: "선택한 레퍼런스의 컬렉션을 이동하시겠습니까?",
          isVisible: true,
          title: dropOpen.value,
        }));
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("실패했습니다.", "error");
      }
    }
  };

  return (
    <div className="flex fixed top-0 left-0 w-full h-full bg-black/60 z-20 items-center justify-center">
      <div className="flex flex-col items-center w-[520px] h-[294px] py-6 px-8 relative bg-[#f9faf9] rounded-2xl">
        <X
          className="absolute w-9 h-9 top-6 right-6 stroke-gray-700 hover: cursor-pointer"
          onClick={() => setIsOpen((prev) => ({ ...prev, isOpen: false }))}
        />
        <p className="text-black text-2xl font-semibold">{types[type][0]}</p>
        {type !== "move" ? (
          <p className="text-xl font-semibold mt-8 w-full">컬렉션 명</p>
        ) : (
          <p className="text-base font-normal mt-8">{`선택한 ${alert.ids.length}개의 레퍼런스를 옮길 컬렉션을 선택해주세요.`}</p>
        )}
        {type !== "move" ? (
          <div className="relative">
            {isOpen.title.length > 0 && (
              <CircleX
                className="absolute top-8 right-5 w-6 h-6 fill-gray-700 stroke-white hover: cursor-pointer"
                onClick={() => setIsOpen((prev) => ({ ...prev, title: "" }))}
              />
            )}
            <input
              type="text"
              placeholder={isOpen.type === "create" ? types["create"][2] : ""}
              value={isOpen.title}
              maxLength={20}
              onChange={(e) =>
                setIsOpen((prev) => ({ ...prev, title: e.target.value }))
              }
              className=" w-[456px] mt-4 py-4 px-5 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            />
          </div>
        ) : (
          <div className="relative text-base bg-white rounded-lg border border-gray-200 w-full mt-8">
            <div
              className={`flex items-center justify-between pl-5 pr-4 py-[13px] cursor-pointer text-gray-700 font-normal`}
              onClick={() =>
                setdropOpen((prev) => ({ ...prev, open: !prev.open }))
              }
              tabIndex={0}
            >
              {dropOpen.value}
              {dropOpen.open ? (
                <ChevronUp className="w-6 h-6 stroke-gray-700" />
              ) : (
                <ChevronDown className="w-6 h-6 stroke-gray-700" />
              )}
            </div>
            {dropOpen.open && (
              <ul className="flex flex-col absolute w-full bg-white p-4 gap-4 border border-gray-200 rounded-lg shadow-[0px_0px_10px_0px_rgba(181,184,181,0.20)] z-10">
                {collectiondata.data.map((option, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700 text-base font-nomal cursor-pointer hover:text-primary hover:font-semibold"
                    onClick={() =>
                      setdropOpen({ open: false, value: option.title })
                    }
                  >
                    {option.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button
          onClick={handleClick}
          disabled={
            type !== "move"
              ? isOpen.title.length === 0
              : dropOpen.value === "컬렉션을 선택해주세요."
          }
          className="w-full mt-6 p-3.5 flex justify-center bg-primary rounded-lg text-[#F9FAF9] text-lg font-bold transition-colors duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-500"
        >
          {types[type][1]}
        </button>
      </div>
    </div>
  );
};

export default Modal;