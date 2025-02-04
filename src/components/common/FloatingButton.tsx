import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { atom, useRecoilState } from "recoil";
import {
  EllipsisVertical,
  FolderPlus,
  ArrowLeftRight,
  Trash2,
  FilePlus,
} from "lucide-react";

export const modeState = atom({
  key: "floatingState",
  default: {
    isMove: false,
    isDelete: false,
    checkItems: [] as string[],
  },
});

interface FABProps {
  type?: string;
}

const FloatingButton: React.FC<FABProps> = ({ type }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useRecoilState(modeState);

  const handleCreateCollection = () => {
    //
  };

  const handleMove = () => {
    setMode((prev) => ({ ...prev, isMove: !prev.isMove }));
  };

  const handleDelete = () => {
    setMode((prev) => ({ ...prev, isDelete: !prev.isDelete }));
  };

  const iconStyles =
    "w-16 h-16 p-4 rounded-full shadow-[0px_0px_10px_0px_rgba(0,0,0,0.08)] overflow-visible";

  return (
    <div className="fixed bottom-[7%] right-[7%] flex flex-col items-center gap-8 z-10">
      {isOpen && (
        <div className="flex flex-col items-center gap-3 ">
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
