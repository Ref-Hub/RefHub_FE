// src/components/collection/ShareModal.tsx
import { useState } from "react";
import { X, CircleX } from "lucide-react";
import { useRecoilState } from "recoil";
import { shareModalState } from "@/store/collection";

const ShareModal: React.FC = () => {
  const [, setIsOpen] = useRecoilState(shareModalState);
  const [isShare, setIsShare] = useState(false);
  const [email, setEmail] = useState("");

  const handleClick = async () => {
    //
  };

  return (
    <div className="flex fixed top-0 left-0 w-full h-full bg-black/60 z-20 items-center justify-center">
      <div className="flex flex-col items-center w-[520px] py-6 px-8 relative bg-[#f9faf9] rounded-2xl">
        <X
          className="absolute w-9 h-9 top-6 right-6 stroke-gray-700 hover: cursor-pointer"
          onClick={() => setIsOpen({ isOpen: false })}
        />
        <p className="text-black text-2xl font-semibold">컬렉션 공유</p>

        <p className="text-base font-normal mt-8 text-center">
          이 컬렉션을 공유하고 함께 자료를 정리해보세요. <br />
          공유된 사용자 모두 자료를 추가, 삭제, 수정할 수 있어요.
        </p>

        <div
          className={`w-full h-14 flex relative mt-8 items-center bg-gray-100 rounded-[50px] border border-gray-200 text-lg font-bold cursor-pointer`}
          onClick={() => setIsShare((prev) => !prev)}
        >
          <div
            className={`w-[50%] h-12 bg-primary rounded-[50px] transform transition-transform duration-500
        ${isShare ? "translate-x-56" : "translate-x-0.5"}`}
          />
          <p
            className={`absolute left-[85px] transition-colors ${
              isShare ? "text-primary" : "text-white"
            }`}
          >
            나만보기
          </p>
          <p
            className={`absolute right-[85px] transition-colors ${
              isShare ? "text-white" : "text-primary"
            }`}
          >
            공유하기
          </p>
        </div>

        {isShare && (
          <div className="mt-8 text-gray-700 text-lg font-semibold w-full">
            <p>컬렉션 멤버</p>
            <p>추가하기</p>
            <div className="relative flex gap-2">
              {email.length > 0 && (
                <CircleX
                  className="absolute top-5 right-24 w-6 h-6 fill-gray-700 stroke-white hover: cursor-pointer"
                  onClick={() => setEmail("")}
                />
              )}
              <input
                type="text"
                placeholder="추가할 멤버의 이메일을 입력해 주세요."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className=" w-[456px] mt-2 py-3 px-5 bg-white text-base font-normal rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              />
              <button
                onClick={handleClick}
                disabled={email.length === 0}
                className="w-[100px] mt-2 flex justify-center items-center bg-primary rounded-lg text-white font-bold transition-colors duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-500"
              >
                초대
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
