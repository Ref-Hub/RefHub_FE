//src/components/common/Alert.tsx
import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { collectionService } from "@/services/collection";
import { referenceService } from "@/services/reference";
import { useToast } from "@/contexts/useToast";
import { alertState, floatingModeState } from "@/store/collection";
import { useRecoilState } from "recoil";

interface AlertProps {
  message: string;
}

const Alert: React.FC<AlertProps> = ({ message }) => {
  const { showToast } = useToast();
  const [alert, setAlert] = useRecoilState(alertState);
  const [mode, setMode] = useRecoilState(floatingModeState);

  const handleDelete = async () => {
    try {
      if (alert.type === "collection") {
        await collectionService.deleteCollection(alert.ids);
      } else {
        if (alert.ids.length === 1) {
          await referenceService.deleteReference(alert.ids[0]);
        } else {
          await referenceService.deleteReferences(alert.ids);
        }
      }
      showToast("삭제가 완료되었습니다.", "success");
      setMode((prev) => ({
        ...prev,
        isDelete: false,
        isShared: [],
        checkItems: [],
      }));
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
    <div className="flex fixed top-14 w-screen justify-center z-50">
      <motion.div
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`px-6 rounded-2xl bg-[#f9faf9] w-[404px] border border-gray-200 drop-shadow-lg`}
      >
        <div className="flex flex-col items-center relative">
          <X
            className="absolute w-6 h-6 top-6 right-1 stroke-gray-700 hover:cursor-pointer"
            onClick={() => setAlert((prev) => ({ ...prev, isVisible: false }))}
          />
          <p className="text-base font-normal mt-16 whitespace-pre-line text-center">
            {message}
          </p>
          <div className="flex gap-1 mt-8 mb-3">
            <button
              className="flex justify-center items-center w-[172px] h-[50px] px-6 py-4 rounded-lg text-gray-700 text-lg font-bold hover:bg-gray-100"
              onClick={() =>
                setAlert((prev) => ({ ...prev, isVisible: false }))
              }
            >
              취소
            </button>
            <div className="w-[2px] h-[50px] bg-gray-200"></div>
            <button
              className="flex justify-center items-center w-[172px] h-[50px] px-6 py-4 rounded-lg text-primary text-lg font-bold hover:bg-gray-100"
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
