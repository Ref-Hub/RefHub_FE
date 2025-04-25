// src/components/common/Alert.tsx
import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { collectionService } from "@/services/collection";
import { referenceService } from "@/services/reference";
import { authService } from "@/services/auth";
import { useToast } from "@/contexts/useToast";
import { useNavigate } from "react-router-dom";
import {
  alertState,
  floatingModeState,
  modalState,
  shareModalState,
} from "@/store/collection";
import { userState, authUtils } from "@/store/auth";
import { useRecoilState, useSetRecoilState } from "recoil";

interface AlertProps {
  message: string;
}

const Alert: React.FC<AlertProps> = ({ message }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [alert, setAlert] = useRecoilState(alertState);
  const setMode = useSetRecoilState(floatingModeState);
  const setModal = useSetRecoilState(modalState);
  const setShareModal = useSetRecoilState(shareModalState);
  const setUser = useSetRecoilState(userState);

  const handleDelete = async () => {
    try {
      // 회원탈퇴 확인 케이스
      if (alert.type === "withdrawal") {
        try {
          // Alert 창 즉시 닫기
          setAlert((prev) => ({ ...prev, isVisible: false }));

          // 회원탈퇴 API 호출
          await authService.deleteUser();

          // 성공 시 로그인 정보 삭제
          authUtils.clearAll(); // 로컬 스토리지 정리
          setUser(null); // Recoil 상태 초기화

          // 두 번째 Alert 표시 (탈퇴 완료 알림)
          setAlert({
            type: "withdrawalComplete",
            massage:
              "탈퇴가 완료되었습니다.\n7일 이내 로그인 시 계정을 복구할 수 있습니다.",
            isVisible: true,
            ids: [],
            title: "",
          });
        } catch (error) {
          // 에러 처리
          if (error instanceof Error) {
            showToast(error.message, "error");
          } else {
            showToast("회원탈퇴 중 오류가 발생했습니다.", "error");
          }
        }

        // 더 이상 진행하지 않고 종료
        return;
      }

      // 회원탈퇴 완료 알림 케이스
      if (alert.type === "withdrawalComplete") {
        // Alert 창 닫기
        setAlert((prev) => ({ ...prev, isVisible: false }));

        // 즉시 로그인 페이지로 이동 - 완전한 페이지 새로고침을 통해 API 요청 방지
        window.location.href = "/auth/login";

        // 더 이상 진행하지 않고 종료
        return;
      }

      // 다른 케이스들 처리
      if (alert.type === "collection") {
        await collectionService.deleteCollection(alert.ids);
        showToast("삭제가 완료되었습니다.", "success");
      } else if (alert.type === "collectionDetail") {
        await collectionService.deleteCollection(alert.ids);
        showToast("삭제가 완료되었습니다.", "success");
        navigate(`/collections`);
      } else if (alert.type === "move") {
        await referenceService.moveReference(alert.ids, alert.title);
        showToast("컬렉션 이동이 완료되었습니다.", "success");
        setModal({ type: "", isOpen: false, id: "", title: "" });
      } else if (alert.type === "sharePrivate") {
        await collectionService.setPrivate(alert.ids[0]);
        setShareModal((prev) => ({ ...prev, isOpen: false, collectionId: "" }));
        showToast("나만 보기 설정이 되었습니다.", "success");
      } else if (alert.type === "shareRemove") {
        await collectionService.deleteSharedUsers(alert.ids[0], alert.ids[1]);
        showToast("삭제되었습니다.", "success");
      } else if (alert.type === "shareOut") {
        await collectionService.deleteSharedUsers(alert.ids[0], alert.ids[1]);
        setShareModal((prev) => ({ ...prev, isOpen: false, collectionId: "" }));
        navigate(`/collections`);
        showToast("컬렉션에서 나갔습니다.", "success");
      } else if (alert.type === "collectionDetailRemoveRef") {
        if (alert.ids.length === 1) {
          await referenceService.deleteReference(alert.ids[0]);
          showToast("삭제가 완료되었습니다.", "success");
        } else {
          await referenceService.deleteReferences(alert.ids);
          showToast("삭제가 완료되었습니다.", "success");
        }
      } else {
        if (alert.ids.length === 1) {
          await referenceService.deleteReference(alert.ids[0]);
          showToast("삭제가 완료되었습니다.", "success");

          // 상세 페이지에서 삭제한 경우 레퍼런스 목록으로 리디렉션
          if (
            window.location.pathname.includes(`/references/${alert.ids[0]}`)
          ) {
            navigate("/references");
          }
          // 그 외의 경우는 현재 페이지 유지 (리스트에서 삭제한 경우)
        } else {
          await referenceService.deleteReferences(alert.ids);
          showToast("삭제가 완료되었습니다.", "success");
        }
      }

      // Alert 창 닫기 및 상태 초기화
      setMode({
        isMove: false,
        isDelete: false,
        checkItems: [],
      });
      setAlert((prev) => ({ ...prev, isVisible: false, ids: [] }));
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("삭제에 실패했습니다.", "error");
      }
    }
  };

  // 두 번째 Alert (withdrawalComplete)에는 취소 버튼 없이 확인 버튼만 표시
  const showCancelButton = alert.type !== "withdrawalComplete";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/25 z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="px-6 rounded-2xl bg-[#f9faf9] w-full max-w-[404px] border border-gray-200 drop-shadow-lg"
      >
        <div className="flex flex-col items-center relative">
          <X
            className="absolute w-6 h-6 top-6 right-1 stroke-gray-700 hover:cursor-pointer hover:stroke-gray-900 transition-colors"
            onClick={() => setAlert((prev) => ({ ...prev, isVisible: false }))}
          />
          <p className="text-base font-normal mt-16 whitespace-pre-line text-center">
            {message}
          </p>
          <div className="flex gap-1 mt-8 mb-3 w-full">
            {showCancelButton && (
              <>
                <button
                  className="flex justify-center items-center w-[50%] h-[50px] px-6 py-4 rounded-lg text-gray-700 text-lg font-bold hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    setAlert((prev) => ({ ...prev, isVisible: false }))
                  }
                >
                  취소
                </button>
                <div className="w-[2px] h-[50px] bg-gray-200"></div>
              </>
            )}
            <button
              className={`flex justify-center items-center ${
                showCancelButton ? "w-[50%]" : "w-full"
              } h-[50px] px-6 py-4 rounded-lg text-primary text-lg font-bold hover:bg-gray-100 transition-colors`}
              onClick={handleDelete}
            >
              확인
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Alert;
