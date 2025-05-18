// src/pages/user/MyPage.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // useLocation 추가
import { useRecoilState } from "recoil"; // useSetRecoilState 제거
import { userProfileState } from "@/store/user";
import { alertState } from "@/store/collection";
import { userService } from "@/services/user";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/useToast";
import { Edit } from "lucide-react";
import Alert from "@/components/common/Alert"; // Alert 컴포넌트 임포트 추가

const MyPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [userProfile, setUserProfile] = useRecoilState(userProfileState);
  const [alert, setAlert] = useRecoilState(alertState);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 정보 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await userService.getMyProfile();
        setUserProfile(profileData);
        setNewName(profileData.name || "");
      } catch (error) {
        console.error("프로필 정보 로드 실패:", error);
        showToast("프로필 정보를 불러오는데 실패했습니다.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setUserProfile, showToast]);

  // 프로필 이미지 업로드
  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await userService.uploadProfileImage(file);

      // 프로필 정보 다시 로드
      const updatedProfile = await userService.getMyProfile();
      setUserProfile(updatedProfile);

      showToast("프로필 이미지가 변경되었습니다.", "success");
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
      showToast("이미지 업로드에 실패했습니다.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // 프로필 이미지 삭제
  const handleDeleteProfileImage = async () => {
    try {
      await userService.deleteProfileImage();

      // 프로필 정보 다시 로드
      const updatedProfile = await userService.getMyProfile();
      setUserProfile(updatedProfile);

      showToast("프로필 이미지가 삭제되었습니다.", "success");
    } catch (error) {
      console.error("프로필 이미지 삭제 실패:", error);
      showToast("이미지 삭제에 실패했습니다.", "error");
    }
  };

  // 이름 변경 저장
  const handleSaveName = async () => {
    if (!newName.trim()) {
      showToast("이름을 입력해주세요.", "error");
      return;
    }

    // 한글, 영문자만 허용 (백엔드 검증과 동일하게)
    const regex = /^[가-힣a-zA-Z]+$/;
    if (!regex.test(newName) || newName.length > 10) {
      showToast(
        "이름은 한글, 영문자만 사용 가능하며 10자 이내여야 합니다.",
        "error"
      );
      return;
    }

    try {
      await userService.updateUsername(newName);

      // 프로필 정보 업데이트
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          name: newName,
        });
      }

      setIsEditingName(false);
      showToast("이름이 변경되었습니다.", "success");
    } catch (error) {
      console.error("이름 변경 실패:", error);
      showToast("이름 변경에 실패했습니다.", "error");
    }
  };

  const handlePasswordReset = () => {
    // 세션 스토리지에 플래그 설정
    sessionStorage.setItem("fromMyPage", "true");
    // navigate로 이동하되 state에 fromMyPage 표시
    navigate("/auth/reset-password", { state: { fromMyPage: true } });
  };

  // 탈퇴하기
  const handleWithdrawal = () => {
    setAlert({
      type: "withdrawal",
      massage:
        "정말 탈퇴하시겠습니까?\n등록된 컬렉션 및 레퍼런스가 모두 삭제됩니다.",
      isVisible: true,
      ids: [],
      title: "",
    });
  };

  // 파일 선택 다이얼로그 열기
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center min-h-full overflow-hidden bg-[#F9FAF9]">
      {/* Alert 컴포넌트 추가 */}
      {alert.isVisible && alert.type === "withdrawal" && (
        <Alert message={alert.massage} />
      )}

      {/* 전체 컨테이너: 상하 패딩 줄이고 flex-1 추가 */}
      <div className="flex flex-col items-center w-full h-full py-4 flex-1">
        {/* 프로필 섹션 */}
        <div className="flex flex-col items-center">
          {/* 프로필 이미지 */}
          <div className="relative mt-4">
            {isLoading ? (
              <div className="w-[160px] h-[160px] rounded-full bg-gray-200 animate-pulse"></div>
            ) : (
              <div className="w-[160px] h-[160px] rounded-full border-[2px] border-gray-200 overflow-hidden">
                {userProfile?.profileImage ? (
                  <img
                    src={userProfile.profileImage}
                    alt="프로필"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/default-profile.svg";
                    }}
                  />
                ) : (
                  <img
                    src="/images/default-profile.svg"
                    alt="기본 프로필"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfileImageUpload}
              accept="image/jpeg, image/png, image/jpg"
              className="hidden"
            />
          </div>

          {/* 이미지 버튼 */}
          <div className="mt-3 text-sm flex items-center text-gray-700">
            <button
              onClick={openFileDialog}
              className="hover:text-primary transition-colors"
              disabled={isUploading}
            >
              사진 변경
            </button>
            <span className="mx-2 text-gray-300">|</span>
            <button
              onClick={handleDeleteProfileImage}
              className="hover:text-primary transition-colors"
            >
              사진 삭제
            </button>
          </div>

          {/* 사용자 정보 섹션 */}
          <div className="mt-8 flex flex-col items-center">
            {/* 이름 */}
            <div className="mb-4 flex items-center">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-[300px] h-[50px] px-4 py-2 border border-gray-300 rounded-[50px] focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={10}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-primary hover:text-primary-dark"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(userProfile?.name || "");
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold">
                    {userProfile?.name || "name"}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-500 hover:text-primary"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* 이메일 */}
            <p className="text-gray-600">{userProfile?.email || "email"}</p>
          </div>
        </div>

        {/* 늘어나는 여백 - 이메일과 하단 버튼 사이에 공간 확보 (min-height 추가) */}
        <div className="flex-grow min-h-[410px]"></div>

        {/* 하단 버튼 섹션 - 수정된 부분 */}
        <div className="w-full mt-auto mb-0 flex justify-center text-gray-700 text-sm">
          <button
            onClick={handlePasswordReset} // 수정된 핸들러 사용
            className="hover:text-primary transition-colors"
          >
            비밀번호 재설정
          </button>
          <span className="mx-2 text-gray-300">|</span>
          <button
            onClick={logout}
            className="hover:text-primary transition-colors"
          >
            로그아웃
          </button>
          <span className="mx-2 text-gray-300">|</span>
          <button
            onClick={handleWithdrawal}
            className="hover:text-primary transition-colors"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
