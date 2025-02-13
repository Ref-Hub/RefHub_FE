import { useEffect, useState } from "react";
import { X, CircleX } from "lucide-react";
import { useRecoilState } from "recoil";
import { shareModalState } from "@/store/collection";
import { collectionService } from "@/services/collection";
import { SharedUser } from "@/types/collection";
import { useAuth } from "@/hooks/useAuth"; 
import CreatorIcon from "@/assets/creator.svg";
import UserIcon from "@/assets/userIcon.svg";
import TrashIcon from "@/assets/TrashIcon.svg";

const ShareModal: React.FC<{ collectionId: string }> = ({ collectionId }) => {
  const [, setIsOpen] = useRecoilState(shareModalState);
  const [isShare, setIsShare] = useState(false);
  const [email, setEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [creator, setCreator] = useState<SharedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ [key: string]: string }>({});
  
  const { user } = useAuth(); // user 정보를 가져옴

  // 공유 사용자 목록 조회 (GET)
  const fetchSharedUsers = async () => {
    if (!collectionId) {
      console.error("collectionId가 없습니다!");
      return;
    }

    try {
      setLoading(true);
      const response = await collectionService.getSharedUsers(collectionId);
      const members = response.filter((user) => user.role !== "editor");

      // creator를 user로 설정
      const creatorUser: SharedUser = {
        _id: user ? user.id : "default-id", // user의 id 또는 기본값
        userId: {
          _id: user ? user.id : "default-id", 
          name: user ? user.name : " 생성자", 
          email: user ? user.email : "default@example.com", 
        },
        role: "editor",
      };

      setCreator(creatorUser); 
      setSharedUsers(members);
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
      setSharedUsers((prevUsers) => prevUsers.filter((user) => user.userId._id !== userId));
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
        {/* 닫기 버튼 */}
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
          <p className={`absolute left-[85px] ${isShare ? "text-primary" : "text-white"}`}>나만보기</p>
          <p className={`absolute right-[85px] ${isShare ? "text-white" : "text-primary"}`}>공유하기</p>
        </div>

              {/* 공유 사용자 목록 */}
              {isShare && (
          <div className="mt-6 text-gray-700 text-lg font-semibold w-full">
            <p className="text-s text-gray-600">컬렉션 멤버</p>
            {loading ? (
              <p className="text-gray-500 text-sm mt-4">로딩 중...</p>
            ) : (
              <div className="max-h-60 overflow-y-auto bg-gray-100 rounded-lg p-0">
                <ul className="mt-0 w-full bg-gray-100 p-4 rounded-lg">
                  {/* 컬렉션 생성자*/}
                  {creator && (
                    <li className="flex justify-between items-center h-[10%] bg-white p-2 rounded-lg shadow-sm mb-2">
                      <div className="flex items-center gap-3">
                        <img src={CreatorIcon} alt="Creator" className="w-7 h-7" />
                        <div>
                          <span className="font-semibold text-gray-600">{creator.userId.name}</span>
                          <p className="text-sm text-gray-500">{creator.userId.email}</p>
                        </div>
                      </div>
                    </li>
                  )}
                  {/* 추가된 사용자*/}
                  {sharedUsers.map((user) => (
                    <li
                      key={user._id}
                      className="flex justify-between items-center bg-white p-2 rounded-lg mb-2 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img src={UserIcon} alt="User" className="w-7 h-7" />
                        <div>
                          <p className="font-semibold">{user.userId.name || user.userId.email}</p>
                          <p className="text-sm text-gray-500">{user.userId.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <select
                          className="p-1 rounded-md bg-transparent outline-none"
                          value={roles[user.userId._id] || "Viewer"}
                          onChange={(e) => setRoles((prev) => ({ ...prev, [user.userId._id]: e.target.value }))}
                        >
                          <option value="Viewer"  className="text-s text-gray-500" >Viewer</option>
                          <option value="Editor">Editor</option>
                        </select>
                        <button onClick={() => handleRemoveUser(user.userId._id)} className="ml-1">
                          <img src={TrashIcon} alt="Delete" className="w-5 h-5 cursor-pointer" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                </div>
            )}

            {/* 사용자 추가 입력 */}
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
                style={{ fontSize: '16px', color: '#616161', fontWeight: 'bold' }}
              />
            <button
              onClick={handleAddOrUpdateUser}
              className="bg-primary w-[20%] px-4 py-2 rounded-lg text-white font-bold transition duration-300 ease-in-out hover:bg-primary-dark active:bg-primary-darker" 
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