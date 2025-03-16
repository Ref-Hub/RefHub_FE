//src/components/common/Alert.tsx
import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { collectionService } from "@/services/collection";
import { referenceService } from "@/services/reference";
import { useToast } from "@/contexts/useToast";
import { useNavigate } from "react-router-dom";
import {
  alertState,
  floatingModeState,
  modalState,
  shareModalState,
} from "@/store/collection";
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

  const handleDelete = async () => {
    try {
      if (alert.type === "collection") {
        await collectionService.deleteCollection(alert.ids);
        showToast("삭제가 완료되었습니다.", "success");
      } else if (alert.type === "collectionDetail") {
        await collectionService.deleteCollection(alert.ids);
        showToast("삭제가 완료되었습니다.", "success");
        navigate(`/collections`);
      } else if (alert.type === "move") {
        console.log(`id: ${alert.ids}, title: ${alert.title}`);
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
          // Add navigation for single reference deletion
          navigate("/references");
        } else {
          await referenceService.deleteReferences(alert.ids);
          showToast("삭제가 완료되었습니다.", "success");
        }
      }
      setMode({
        isMove: false,
        isDelete: false,
        isShared: [],
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/25 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="px-6 rounded-2xl bg-[#f9faf9] w-[404px] border border-gray-200 drop-shadow-lg"
      >
        <div className="flex flex-col items-center relative">
          <X
            className="absolute w-6 h-6 top-6 right-1 stroke-gray-700 hover:cursor-pointer hover:stroke-gray-900 transition-colors"
            onClick={() => setAlert((prev) => ({ ...prev, isVisible: false }))}
          />
          <p className="text-base font-normal mt-16 whitespace-pre-line text-center">
            {message}
          </p>
          <div className="flex gap-1 mt-8 mb-3">
            <button
              className="flex justify-center items-center w-[172px] h-[50px] px-6 py-4 rounded-lg text-gray-700 text-lg font-bold hover:bg-gray-100 transition-colors"
              onClick={() =>
                setAlert((prev) => ({ ...prev, isVisible: false }))
              }
            >
              취소
            </button>
            <div className="w-[2px] h-[50px] bg-gray-200"></div>
            <button
              className="flex justify-center items-center w-[172px] h-[50px] px-6 py-4 rounded-lg text-primary text-lg font-bold hover:bg-gray-100 transition-colors"
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
