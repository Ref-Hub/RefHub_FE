//src/components/common/FloatingButton.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/contexts/useToast";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  modalState,
  floatingModeState,
  alertState,
  shareModalState,
} from "@/store/collection";
import {
  EllipsisVertical,
  FolderPlus,
  ArrowLeftRight,
  Trash2,
  FilePlus,
  Share2,
} from "lucide-react";

interface FABProps {
  type: string;
  isData?: boolean;
}

const FloatingButton: React.FC<FABProps> = ({ type, isData }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const setModalOpen = useSetRecoilState(modalState);
  const [mode, setMode] = useRecoilState(floatingModeState);
  const setAlert = useSetRecoilState(alertState);
  const setShareOpen = useSetRecoilState(shareModalState);

  useEffect(() => {
    setMode({ isMove: false, isDelete: false, checkItems: [], isShared: [] });
  }, [isOpen]);

  const handleCreateCollection = () => {
    setIsOpen(false);
    setModalOpen((prev) => ({
      ...prev,
      isOpen: true,
      type: "create",
      title: "",
    }));
  };

  const handleMove = () => {
    if (!mode.isMove) {
      showToast("이동모드로 전환되었습니다.", "success");
      setMode((prev) => ({ ...prev, isMove: true, isDelete: false }));
    } else {
      if (mode.checkItems.length > 0) {
        setAlert({
          type: "move",
          massage: "선택한 레퍼런스의 컬렉션을 이동하시겠습니까?",
          ids: mode.checkItems,
          isVisible: false,
          title: "",
        });
        setModalOpen((prev) => ({
          ...prev,
          isOpen: true,
          type: "move",
          title: "",
        }));
      } else {
        showToast("선택한 레퍼런스가 없습니다.", "error");
      }
    }
  };

  const handleDelete = () => {
    if (!mode.isDelete) {
      showToast("삭제모드로 전환되었습니다.", "success");
      setMode((prev) => ({ ...prev, isDelete: true, isMove: false }));
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

        type === "collectionDetail"
          ? setAlert({
              ids: mode.checkItems,
              massage: text,
              isVisible: true,
              type: "collectionDetailRemoveRef",
              title: "",
            })
          : setAlert({
              ids: mode.checkItems,
              massage: text,
              isVisible: true,
              type: type,
              title: "",
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
          {type != "collectionDetail" && (
            <ActionButton
              icon={
                <FolderPlus
                  className={`${iconStyles} stroke-primary bg-white`}
                />
              }
              label="컬렉션"
              time={1.2}
              onClick={handleCreateCollection}
            />
          )}

          <ActionButton
            icon={
              <FilePlus className={`${iconStyles} stroke-primary bg-white`} />
            }
            label="레퍼런스"
            time={0.9}
            onClick={() => navigate("/references/new")}
          />
          {type === "collectionDetail" && (
            <ActionButton
              icon={
                <Share2 className={`${iconStyles} stroke-primary bg-white`} />
              }
              label="컬렉션 공유"
              time={1.2}
              onClick={() =>
                setShareOpen((prev) => ({ ...prev, isOpen: true }))
              }
            />
          )}
          {type != "collection" && (
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
              disabled={!isData}
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
            disabled={!isData}
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
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  time,
  onClick,
  disabled,
}) => {
  return (
    <motion.button
      className="flex flex-col items-center gap-1 text-sm font-normal disabled:!opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
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
