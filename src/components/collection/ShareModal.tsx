import { useEffect, useState } from "react";
import { X, CircleX } from "lucide-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { shareModalState, collectionState } from "@/store/collection";
import { collectionService } from "@/services/collection";
import { OwnerUser, SharedUser } from "@/types/collection";
import CreatorIcon from "@/assets/creator.svg";
import UserIcon from "@/assets/userIcon.svg";
import TrashIcon from "@/assets/TrashIcon.svg";
import { userState } from "@/store/auth";

const ShareModal: React.FC<{ collectionId: string }> = ({ collectionId }) => {
  const [, setIsOpen] = useRecoilState(shareModalState);
  const collectiondatas = useRecoilValue(collectionState);
  const [, setCollectionTitle] = useState("");
  const [isShare, setIsShare] = useState(false);
  const [email, setEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [creator, setCreator] = useState<OwnerUser | null>(null);
  const [loading, setLoading] = useState(false);
  const loginUser = useRecoilValue(userState);
  const [isOwner, setIsOwner] = useState(false);

  // 공유 사용자 목록 조회 (GET)
  const fetchSharedUsers = async () => {
    if (!collectionId) {
      console.error("collectionId가 없습니다!");
      return;
    }

    try {
      setLoading(true);
      const response = await collectionService.getSharedUsers(collectionId);
      setCreator(response.owner);
      setSharedUsers(response.sharing);
      setIsShare(response.sharing.length > 0);
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
      alert("사용자 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  // 공유 사용자 추가 및 수정 (PATCH)
  const handleAddOrUpdateUser = async (email: string, role?: string) => {
    if (!email.trim()) return;
    if (!collectionId) {
      alert("컬렉션 ID가 없습니다. 다시 시도해주세요.");
      return;
    }

    try {
      await collectionService.updateSharedUsers(collectionId, email, role);
      setEmail("");
      fetchSharedUsers();
    } catch (error) {
      console.error("사용자 추가 또는 수정 실패:", error);
      alert("사용자 추가 또는 수정 실패");
    } finally {
      fetchSharedUsers();
    }
  };

  // 공유 사용자 삭제 (DELETE)
  const handleRemoveUser = async (userId: string) => {
    if (!collectionId) return;
    try {
      await collectionService.deleteSharedUsers(collectionId, userId);
    } catch (error) {
      console.error("사용자 삭제 실패:", error);
      alert("사용자 삭제 실패");
    } finally {
      fetchSharedUsers();
    }
  };

  // 모달이 열릴 때 사용자 목록 조회
  useEffect(() => {
    if (collectionId) fetchSharedUsers();
    setCollectionTitle(
      collectiondatas.data.find((item) => item._id === collectionId)?.title ||
        ""
    );
    setIsOwner(loginUser?.email === creator?.email);
  }, [collectionId]);

  const handleShare = async () => {
    if (isShare) {
      setIsShare(false);
      try {
        await collectionService.setPrivate(collectionId);
      } catch (error) {
        console.error("사용자 삭제 실패:", error);
        alert("사용자 삭제 실패");
      }
      fetchSharedUsers();
    } else {
      setIsShare(true);
    }
  };

  return (
    <div className="flex fixed top-0 left-0 w-full h-full bg-black/60 z-20 items-center justify-center">
      <div className="flex flex-col items-center w-[520px] py-6 px-8 relative bg-[#f9faf9] rounded-2xl">
        {/* 닫기 버튼 */}
        <X
          className="absolute w-9 h-9 top-6 right-6 stroke-gray-700 cursor-pointer"
          onClick={() => setIsOpen({ isOpen: false, collectionId: "" })}
        />
        <p className="text-black text-2xl font-semibold">
          {isOwner ? "컬렉션 공유" : "공유된 컬렉션"}
        </p>

        <p className="text-base font-normal mt-8 text-center">
          {isOwner
            ? `이 컬렉션을 공유하고 함께 레퍼런스를 정리해보세요. \n멤버들과 컬렉션의 레퍼런스를 추가, 삭제, 수정할 수 있어요.`
            : `공유된 컬렉션에서 함께 레퍼런스를 정리해보세요. \n공유된 사용자 모두 레퍼런스를 추가, 삭제, 수정할 수 있어요.`}
        </p>

        {/* 공개/비공개 전환 버튼 */}
        {isOwner && (
          <div
            className="w-full h-14 flex relative mt-8 items-center bg-gray-100 rounded-[50px] border border-gray-200 text-lg font-bold cursor-pointer"
            onClick={() => handleShare()}
          >
            <div
              className={`w-[50%] h-12 bg-primary rounded-[50px] transform transition-transform duration-500 ${
                isShare ? "translate-x-56" : "translate-x-0.5"
              }`}
            />
            <p
              className={`absolute left-[85px] ${
                isShare ? "text-primary" : "text-white"
              }`}
            >
              나만보기
            </p>
            <p
              className={`absolute right-[85px] ${
                isShare ? "text-white" : "text-primary"
              }`}
            >
              공유하기
            </p>
          </div>
        )}

        {/* 공유 사용자 목록 */}
        {isShare && (
          <div className="mt-6 text-gray-700 text-lg font-semibold w-full">
            <p className="text-s text-gray-600 mb-2">컬렉션 멤버</p>
            {loading ? (
              <p className="text-gray-500 text-sm mt-4">로딩 중...</p>
            ) : (
              <div className="max-h-60 overflow-y-auto bg-gray-100 rounded-lg p-0">
                <ul className="w-full bg-gray-100 p-2 rounded-lg flex flex-col gap-2">
                  {/* 컬렉션 생성자*/}
                  {creator && (
                    <li className="flex justify-between gap-2.5 items-center bg-white py-2 px-4 rounded-lg">
                      <img
                        src={CreatorIcon}
                        alt="Creator"
                        className="w-7 h-7"
                      />
                      <span className="text-base text-black font-semibold w-12">
                        {creator.name}
                      </span>
                      <p className="text-base text-gray-700 font-normal flex-1">
                        {creator.email}
                      </p>
                    </li>
                  )}
                  {/* 추가된 사용자*/}
                  {sharedUsers.map((user) => (
                    <li
                      key={user._id}
                      className="flex justify-between gap-2.5 items-center bg-white py-2 px-4 rounded-lg"
                    >
                      <img src={UserIcon} alt="User" className="w-7 h-7" />
                      <p className="text-base text-black font-semibold w-12">
                        {user.userId.name || ""}
                      </p>
                      <p className="text-base text-gray-700 font-normal flex-1">
                        {user.userId.email}
                      </p>

                      {isOwner ? (
                        <div className="flex items-center">
                          <select
                            className="p-1 rounded-md bg-transparent outline-none"
                            value={user.role}
                            onChange={(e) =>
                              handleAddOrUpdateUser(
                                user.userId.email,
                                e.target.value
                              )
                            }
                          >
                            <option
                              value="viewer"
                              className="text-base text-gray-700"
                            >
                              viewer
                            </option>
                            <option
                              value="editor"
                              className="text-base text-gray-700"
                            >
                              editor
                            </option>
                          </select>
                          <button
                            onClick={() => handleRemoveUser(user.userId._id)}
                            className="ml-1"
                          >
                            <img
                              src={TrashIcon}
                              alt="Delete"
                              className="w-5 h-5 cursor-pointer"
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="text-base font-normal text-[#676967]">
                          {user.role}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 사용자 추가 입력 */}
            {isOwner ? (
              <div>
                <p className="text-s text-gray-600 mt-3">추가하기</p>
                <div className="relative flex gap-3 mt-4 w-full justify-center">
                  {email.length > 0 && (
                    <CircleX
                      className="absolute top-3 right-28 w-6 h-6 fill-gray-700 stroke-white cursor-pointer"
                      onClick={() => setEmail("")}
                    />
                  )}
                  <input
                    type="text"
                    placeholder="추가할 멤버의 이메일을 입력해 주세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-[80%] py-2 px-4 bg-white text-base font-normal rounded-lg border border-gray-200"
                    style={{
                      fontSize: "16px",
                      color: "#616161",
                      fontWeight: "bold",
                    }}
                  />
                  <button
                    onClick={() => handleAddOrUpdateUser(email)}
                    disabled={email.length === 0}
                    className="bg-primary w-[20%] px-4 py-2 rounded-lg text-white font-bold transition duration-300 ease-in-out hover:bg-primary-dark hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-500"
                  >
                    초대
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleRemoveUser(email)}
                className="bg-primary w-full px-4 py-2 mt-4 rounded-lg text-white font-bold transition duration-300 ease-in-out hover:bg-primary-dark active:bg-primary-darker"
              >
                나가기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
