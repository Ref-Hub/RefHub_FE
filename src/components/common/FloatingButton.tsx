//src/components/common/FloatingButton.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/contexts/useToast";
import { useRecoilState } from "recoil";
import { modalState, floatingModeState, alertState } from "@/store/collection";
import {
  EllipsisVertical,
  FolderPlus,
  ArrowLeftRight,
  Trash2,
  FilePlus,
} from "lucide-react";

interface FABProps {
  type: string;
}

const FloatingButton: React.FC<FABProps> = ({ type }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useRecoilState(modalState);
  const [mode, setMode] = useRecoilState(floatingModeState);
  const [alert, setAlert] = useRecoilState(alertState);

  useEffect(() => {
    setMode({ isMove: false, isDelete: false, checkItems: [], isShared: [] });
  }, [isOpen]);

  const handleCreateCollection = () => {
    setIsOpen(false);
    setModalOpen((prev) => ({ ...prev, isOpen: true, type: "create" }));
  };

  const handleMove = () => {
    setMode((prev) => ({ ...prev, isMove: !prev.isMove }));
  };

  const handleDelete = () => {
    if (!mode.isDelete) {
      showToast("삭제모드로 전환되었습니다.", "success");
      setMode((prev) => ({ ...prev, isDelete: !prev.isDelete }));
    } else {
      if (mode.checkItems.length > 0) {
        let text = "";
        if (mode.isShared.includes(true)) {
          type === "collection"
            ? (text = `공유 중인 컬렉션을 포함한 ${mode.checkItems.length}개의 컬렉션을 삭제하시겠습니까? 컬렉션 내 모든 레퍼런스가 삭제되며, \n복구할 수 없습니다.`)
            : (text = `공유 중인 레퍼런스를 포함한 ${mode.checkItems.length}개의 레퍼런스를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.`);
        } else {
          type === "collection"
            ? (text = `선택한 ${mode.checkItems.length}개의 컬렉션을 삭제하시겠습니까? \n컬렉션 내 모든 레퍼런스가 삭제되며, \n복구할 수 없습니다.`)
            : (text = `선택한 ${mode.checkItems.length}개의 레퍼런스를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`);
        }

        setAlert({
          ids: mode.checkItems,
          massage: text,
          isVisible: true,
          type: type,
        });
      } else {
        type === "collection"
          ? showToast("선택한 컬렉션이 없습니다.", "error")
          : showToast("선택한 레퍼런스가 없습니다.", "error");
      }
    }
  };

  const iconStyles =
    "w-16 h-16 p-4 rounded-full shadow-[0px_0px_10px_0px_rgba(0,0,0,0.08)] overflow-visible";

  return (
    <div className="fixed bottom-[7%] right-[7%] flex flex-col items-center gap-8 z-10">
      {isOpen && (
        <div className="flex flex-col items-center gap-3">
          <ActionButton
            icon={
              <FolderPlus className={`${iconStyles} stroke-primary bg-white`} />
            }
            label="컬렉션"
            time={1.2}
            onClick={handleCreateCollection}
          />
          <ActionButton
            icon={
              <FilePlus className={`${iconStyles} stroke-primary bg-white`} />
            }
            label="레퍼런스"
            time={0.9}
            onClick={() => navigate("/references/new")}
          />
          {type == "reference" && (
            <ActionButton
              icon={
                <ArrowLeftRight
                  className={`${
                    mode.isMove
                      ? "stroke-white bg-primary"
                      : "stroke-primary bg-white"
                  } ${iconStyles} `}
                />
              }
              label={mode.isMove ? "이동하기" : "컬렉션 이동"}
              time={0.6}
              onClick={handleMove}
            />
          )}
          <ActionButton
            icon={
              <Trash2
                className={`${
                  mode.isDelete
                    ? "stroke-white bg-[#f65063]"
                    : "stroke-[#f65063] bg-white"
                } ${iconStyles} `}
              />
            }
            label={mode.isDelete ? "삭제하기" : "삭제"}
            time={0.4}
            onClick={handleDelete}
          />
        </div>
      )}

      {/* FAB 버튼 */}
      <motion.button
        animate={{ rotate: isOpen ? 90 : 0 }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-primary text-white rounded-full shadow-lg flex"
      >
        <EllipsisVertical size={32} />
      </motion.button>
    </div>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  time: number;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  time,
  onClick,
}) => {
  return (
    <motion.button
      className="flex flex-col items-center gap-1 text-sm font-normal"
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: time, ease: "easeOut" }}
      whileHover={{
        scale: 1.1,
        transition: { duration: 0.2 },
      }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
};

export default FloatingButton;
