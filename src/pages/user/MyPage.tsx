// src/pages/user/MyPage.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userProfileState } from "@/store/user";
import { alertState } from "@/store/collection";
import { userService } from "@/services/user";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/useToast";
import { Edit, X as XIcon } from "lucide-react";
import Alert from "@/components/common/Alert";

const MyPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [userProfile, setUserProfile] = useRecoilState(userProfileState);
  const [alert, setAlert] = useRecoilState(alertState);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [originalName, setOriginalName] = useState(""); // 원래 이름 저장용
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 프로필 정보 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await userService.getMyProfile();

        if (!profileData || typeof profileData !== "object") {
          throw new Error("프로필 정보 형식이 올바르지 않습니다.");
        }

        setUserProfile(profileData);
        setNewName(profileData.name || "");
        setOriginalName(profileData.name || ""); // 원래 이름 저장
      } catch (error) {
        console.error("프로필 정보 로드 실패:", error);
        showToast("프로필 정보를 불러오는데 실패했습니다.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setUserProfile, showToast]);

  // 편집 모드로 진입할 때 input에 focus 주기
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  // 프로필 이미지 업로드
  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유형 검증 - 요구사항에 맞게 확장자 목록 업데이트
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(file.type)) {
      showToast(
        "JPG, PNG, GIF, WEBP 형식의 이미지만 첨부 가능합니다.",
        "error"
      );
      return;
    }

    // 파일 크기 제한 (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      showToast("10MB 이하 파일만 첨부 가능합니다.", "error");
      return;
    }

    try {
      setIsUploading(true);

      // 기존 이미지가 있는 경우, 백엔드에서 자동으로 삭제 후 첨부
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

      // 파일 입력 초기화 (같은 파일 재선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 프로필 이미지 삭제
  const handleDeleteProfileImage = async () => {
    try {
      // 이미지가 없는 경우 처리
      if (!userProfile?.profileImage) {
        showToast("삭제할 프로필 이미지가 없습니다.", "error");
        return;
      }

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

  // 이름 수정 핸들러
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 국문, 영어 외 문자 입력 불가 처리
    const value = e.target.value;
    const regex = /^[가-힣a-zA-Z\s]*$/;

    if (regex.test(value) || value === "") {
      setNewName(value);
    }
  };

  // 인풋 박스 초기화 (X 아이콘 클릭 시) - 텍스트 지우기
  const handleClearInput = () => {
    setNewName("");
    if (nameInputRef.current) {
      nameInputRef.current.focus(); // 포커스 유지
    }
  };

  // 이름 변경 저장
  const handleSaveName = async () => {
    // 입력값이 없을 경우 기존 이름으로 복원하고 편집 모드 종료 (토스트 없음)
    if (!newName.trim()) {
      setNewName(originalName);
      setIsEditingName(false);
      return;
    }

    // 이름이 변경되지 않은 경우: 편집 모드만 종료 (토스트 없음)
    if (newName === originalName) {
      setIsEditingName(false);
      return;
    }

    // 10글자 제한 - UI에 이미 설정되어 있지만 추가 검증
    if (newName.length > 10) {
      showToast("이름은 최대 10글자까지 입력 가능합니다.", "error");
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
        setOriginalName(newName); // 원래 이름 업데이트
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

  // 엔터 키 처리 (이름 수정 완료)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      // ESC 키 누르면 편집 모드 취소
      setIsEditingName(false);
      setNewName(originalName); // 원래 이름으로 복원
    }
  };

  return (
    <div className="flex flex-col items-center min-h-full overflow-hidden bg-[#F9FAF9]">
      {/* Alert 컴포넌트 */}
      {alert.isVisible && alert.type === "withdrawal" && (
        <Alert message={alert.massage} />
      )}

      {/* 전체 컨테이너 */}
      <div className="flex flex-col items-center w-full h-full py-4 flex-1">
        {/* 프로필 섹션 - 상단 여백 추가 */}
        <div className="flex flex-col items-center mt-12">
          {/* 프로필 이미지 */}
          <div className="relative">
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
              accept="image/jpeg,image/png,image/gif,image/webp"
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
              disabled={isUploading || !userProfile?.profileImage}
            >
              사진 삭제
            </button>
          </div>

          {/* 사용자 정보 섹션 */}
          <div className="mt-8 flex flex-col items-center">
            {/* 이름 편집 UI 개선 */}
            <div className="mb-4 flex items-center">
              {isEditingName ? (
                <div className="relative w-[300px] flex items-center">
                  <input
                    type="text"
                    value={newName}
                    onChange={handleNameChange}
                    className="w-full h-[50px] px-4 py-2 pr-10 border border-gray-300 rounded-[50px] focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={10}
                    ref={nameInputRef}
                    autoFocus
                    onKeyDown={handleKeyDown}
                    placeholder={originalName || "이름 입력"}
                  />
                  {/* X 아이콘 추가 - 텍스트 지우기 용도로 변경 */}
                  <button
                    onClick={handleClearInput}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="텍스트 지우기"
                  >
                    <XIcon size={18} />
                  </button>
                  {/* 저장 버튼 - 간격 축소 */}
                  <button
                    onClick={handleSaveName}
                    className="absolute -right-12 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold">
                    {userProfile?.name || "이름"}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-500 hover:text-primary"
                    aria-label="이름 수정"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* 이메일 */}
            <p className="text-gray-600">{userProfile?.email || "이메일"}</p>
          </div>
        </div>

        {/* 늘어나는 여백 */}
        <div className="flex-grow min-h-[410px]"></div>

        {/* 하단 버튼 섹션 */}
        <div className="w-full mt-auto mb-0 flex justify-center text-gray-700 text-sm">
          <button
            onClick={handlePasswordReset}
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
