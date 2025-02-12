import { useEffect, useState } from "react";
import { X, CircleX } from "lucide-react";
import { useRecoilState } from "recoil";
import { shareModalState } from "@/store/collection";
import { collectionService } from "@/services/collection";
import { SharedUser } from "@/types/collection";

const ShareModal: React.FC<{ collectionId: string }> = ({ collectionId }) => {
  const [, setIsOpen] = useRecoilState(shareModalState);
  const [isShare, setIsShare] = useState(false);
  const [email, setEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loading, setLoading] = useState(false);

  // 공유 사용자 목록 조회 (GET)
  const fetchSharedUsers = async () => {
    if (!collectionId) {
      console.error("collectionId가 없습니다!");
      return;
    }
    console.log("fetchSharedUsers() 요청 - Collection ID:", collectionId);

    try {
      setLoading(true);
      const response = await collectionService.getSharedUsers(collectionId);
      setSharedUsers(response);
      setIsShare(response.length > 0);
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
      alert("사용자 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  // 공유 사용자 추가 및 수정 (PATCH)
  const handleAddOrUpdateUser = async () => {
    if (!email.trim()) return;
    if (!collectionId) {
      alert("컬렉션 ID가 없습니다. 다시 시도해주세요.");
      return;
    }

    try {
      await collectionService.updateSharedUsers(collectionId, email);
      setEmail("");
      fetchSharedUsers();
    } catch (error) {
      console.error("사용자 추가 또는 수정 실패:", error);
      alert("사용자 추가 또는 수정 실패");
    }
  };

  // 공유 사용자 삭제 (DELETE)
  const handleRemoveUser = async (userId: string) => {
    if (!collectionId) return;

    try {
      await collectionService.deleteSharedUsers(collectionId, userId);
      fetchSharedUsers();
    } catch (error) {
      console.error("사용자 삭제 실패:", error);
      alert("사용자 삭제 실패");
    }
  };

  // 모달이 열릴 때 사용자 목록 조회
  useEffect(() => {
    if (collectionId) fetchSharedUsers();
  }, [collectionId]);

  return (
    <div className="flex fixed top-0 left-0 w-full h-full bg-black/60 z-20 items-center justify-center">
      <div className="flex flex-col items-center w-[520px] py-6 px-8 relative bg-[#f9faf9] rounded-2xl">
        <X
          className="absolute w-9 h-9 top-6 right-6 stroke-gray-700 cursor-pointer"
          onClick={() => setIsOpen({ isOpen: false, collectionId: "" })}
        />
        <p className="text-black text-2xl font-semibold">컬렉션 공유</p>

        <p className="text-base font-normal mt-8 text-center">
          이 컬렉션을 공유하고 함께 자료를 정리해보세요. <br />
          공유된 사용자 모두 자료를 추가, 삭제, 수정할 수 있어요.
        </p>

        {/* 공개/비공개 전환 버튼 */}
        <div
          className="w-full h-14 flex relative mt-8 items-center bg-gray-100 rounded-[50px] border border-gray-200 text-lg font-bold cursor-pointer"
          onClick={() => setIsShare((prev) => !prev)}
        >
          <div
            className={`w-[50%] h-12 bg-primary rounded-[50px] transform transition-transform duration-500 ${
              isShare ? "translate-x-56" : "translate-x-0.5"
            }`}
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

        {/* 공유 사용자 목록 */}
        {isShare && (
          <div className="mt-8 text-gray-700 text-lg font-semibold w-full">
            <p>컬렉션 멤버</p>
            {loading ? (
              <p className="text-gray-500 text-sm mt-4">로딩 중...</p>
            ) : sharedUsers.length === 0 ? (
              <p className="text-gray-500 text-sm mt-4">
                공유된 사용자가 없습니다.
              </p>
            ) : (
              <ul className="mt-4 w-full">
                {sharedUsers.map((user) => (
                  <li
                    key={user._id}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded-lg mb-2"
                  >
                    <p>{user.userId.name || user.userId.email}</p>
                    <button
                      className="text-red-500 text-sm font-semibold"
                      onClick={() => handleRemoveUser(user.userId._id)}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* 사용자 추가 입력 */}
            <div className="relative flex gap-2 mt-4 w-full justify-center">
              {email.length > 0 && (
                <CircleX
                  className="absolute top-5 right-24 w-6 h-6 fill-gray-700 stroke-white cursor-pointer"
                  onClick={() => setEmail("")}
                />
              )}
              <input
                type="text"
                placeholder="추가할 멤버 이메일 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2 px-4 bg-white text-base font-normal rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              />
              <button
                onClick={handleAddOrUpdateUser}
                disabled={email.length === 0}
                className="inline-block px-4 py-2 bg-primary rounded-lg text-white font-bold transition-colors duration-200 
               hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-500"
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
