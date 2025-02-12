import { useNavigate } from "react-router-dom";
import { Reference as ReferenceCardProps } from "@/types/reference";
import {
  collectionState,
  alertState,
  floatingModeState,
} from "@/store/collection";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import { EllipsisVertical, PencilLine, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DataTableProps {
  items: ReferenceCardProps[];
}

const headers = [
  { title: "NO.", width: "5%" },
  { title: "컬렉션", width: "15%" },
  { title: "제목", width: "35%" },
  { title: "키워드", width: "25%" },
  { title: "등록 일시", width: "15%" },
  { title: "", width: "5%" },
];

export default function ReferenceList({ items = [] }: DataTableProps) {
  const navigate = useNavigate();
  const collectionData = useRecoilValue(collectionState);
  const setAlert = useSetRecoilState(alertState);
  const [modeValue, setModeValue] = useRecoilState(floatingModeState);
  const [isTotal, setIsTotal] = useState(false);
  const [isChecked, setIsChecked] = useState(Array(items.length).fill(false));
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLTableDataCellElement | null }>(
    {}
  );

  useEffect(() => {
    setIsChecked(Array(items.length).fill(false));
  }, [modeValue.isDelete, modeValue.isMove]);

  useEffect(() => {
    collectionData.data.length === modeValue.checkItems.length
      ? setIsTotal(true)
      : setIsTotal(false);
  }, [modeValue.checkItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openMenuId &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId]?.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    isShared: boolean
  ) => {
    if (e.target.id === "total") {
      if (isTotal) {
        setIsTotal(false);
        setIsChecked((prev) => prev.map(() => false));
        setModeValue((prev) => ({
          ...prev,
          isShared: [],
          checkItems: [],
        }));
      } else {
        setIsTotal(true);
        setIsChecked((prev) => prev.map(() => true));
        setModeValue((prev) => ({
          ...prev,
          isShared: collectionData.data.map((item) => item.isShared),
          checkItems: collectionData.data.map((item) => item._id),
        }));
      }
    } else {
      setIsChecked((prev) => {
        const newState = [...prev];
        newState[index] = e.target.checked;
        return newState;
      });
      setModeValue((prev) => ({
        ...prev,
        isShared: [...prev.isShared, isShared],
        checkItems: prev.checkItems.includes(e.target.id)
          ? prev.checkItems.filter((i) => i !== e.target.id)
          : [...prev.checkItems, e.target.id],
      }));
    }
  };

  const handleRowClick = (id: string, event: React.MouseEvent) => {
    if (
      (event.target as HTMLElement).closest(".more-button") ||
      (event.target as HTMLElement).closest("input[type='checkbox']") ||
      (event.target as HTMLElement).closest("label")
    ) {
      return;
    }
    navigate(`/references/${id}`);
  };

  const handleDelete = (item: ReferenceCardProps) => {
    const collectionTitle = collectionData.data.find(
      (i) => i._id === item.collectionId
    )?.title;

    const text = item.createAndShare
      ? `${collectionTitle} 컬렉션의 다른 사용자와 공유 중인 ${item.title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`
      : `${item.title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`;

    setAlert({
      ids: [item._id],
      massage: text,
      isVisible: true,
      type: "reference",
      title: "",
    });
    setOpenMenuId(null);
  };

  const handleEdit = (id: string) => {
    navigate(`/references/${id}/edit`);
    setOpenMenuId(null);
  };

  return (
    <table className="table-auto border-collapse w-full">
      <thead className="bg-gray-100">
        <tr>
          {(modeValue.isMove || modeValue.isDelete) && (
            <th className="w-[5%] pl-3">
              <div>
                <input
                  type="checkbox"
                  id={"total"}
                  checked={isTotal}
                  onChange={(e) => handleChange(e, 0, false)}
                  className="hidden"
                />
                <label
                  htmlFor={"total"}
                  className={`w-5 h-5 border-2 border-primary text-white flex items-center justify-center rounded cursor-pointer ${
                    isTotal ? "bg-primary" : "bg-white"
                  }`}
                >
                  {isTotal && "✔"}
                </label>
              </div>
            </th>
          )}
          {headers.map((header) => (
            <th
              key={header.title}
              style={{ width: header.width }}
              className="text-center text-black text-base font-semibold py-4 first:rounded-l-lg last:rounded-r-lg"
            >
              {header.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr
            key={index}
            onClick={(e) => handleRowClick(item._id, e)}
            className="text-center text-black text-base font-normal border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
          >
            {(modeValue.isMove || modeValue.isDelete) && (
              <td className="pl-3">
                <div>
                  <input
                    type="checkbox"
                    id={item._id}
                    checked={isChecked[index]}
                    onChange={(e) =>
                      handleChange(e, index, item.createAndShare || false)
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor={item._id}
                    className={`w-5 h-5 border-2 border-primary text-white flex items-center justify-center rounded cursor-pointer ${
                      isChecked[index] ? "bg-primary" : "bg-white"
                    }`}
                  >
                    {isChecked[index] && "✔"}
                  </label>
                </div>
              </td>
            )}
            <td className="py-4">{index + 1}</td>
            <td className="py-4 px-2 truncate">
              {collectionData.data.find((i) => i._id === item.collectionId)
                ?.title || null}
            </td>
            <td className="py-4 px-4 text-center truncate">{item.title}</td>
            <td className="py-4">
              <div className="flex flex-wrap justify-center gap-1.5 px-2">
                {item.keywords?.map((word, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#0a306c] rounded text-gray-100 text-xs font-medium whitespace-nowrap"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </td>
            <td className="py-4">{`${new Date(item.createdAt).getFullYear()}.${(
              new Date(item.createdAt).getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}.${new Date(item.createdAt)
              .getDate()
              .toString()
              .padStart(2, "0")}`}</td>
            <td
              className="relative py-4"
              ref={(el) => (menuRefs.current[item._id] = el)}
            >
              <div className="more-button flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === item._id ? null : item._id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                >
                  <EllipsisVertical className="w-5 h-5 text-gray-600" />
                </button>
                {openMenuId === item._id && (
                  <div className="absolute top-full right-0 mt-1 z-10">
                    <ul className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]">
                      <li>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item._id);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <PencilLine className="w-4 h-4 stroke-primary" />
                          <span>수정</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <Trash2 className="w-4 h-4 stroke-[#f65063]" />
                          <span>삭제</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
