import { Reference as ReferenceCardProps } from "@/types/reference";

interface DataTableProps {
  items: ReferenceCardProps[];
}

const headers = [
  { title: "NO.", width: "6.8%" },
  { title: "컬렉션", width: "15%" },
  { title: "제목", width: "32%" },
  { title: "키워드", width: "24%" },
  { title: "등록 일시", width: "15%" },
];

export default function ReferenceList({ items = [] }: DataTableProps) {
  return (
    <table className="table-auto border-collapse w-full">
      <thead className="bg-gray-100 rounded-lg overflow-hidden">
        <tr className="rounded-lg">
          {headers.map((header) => (
            <th
              key={header.title}
              style={{ width: header.width }}
              className={`text-center text-black text-base font-semibold py-3.5 first:rounded-l-lg last:rounded-r-lg`}
            >
              {header.title} {/* 컬럼명 바인딩 */}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr
            key={index}
            className="text-center text-black text-base font-normal border-b border-[#dddddd] hover:bg-gray-200 hover:cursor-pointer"
          >
            <td className="py-3.5">{index + 1}</td>
            <td>{item.collectionTitle}</td>
            <td>{item.referenceTitle}</td>
            <td className="flex flex-row justify-center gap-1 my-3.5">
              {item.keywords?.map((word, index) => (
                <p
                  key={index}
                  className="px-1.5 py-1 bg-[#0a306c] rounded text-gray-100 text-xs font-medium"
                >
                  {word}
                </p>
              ))}
            </td>
            <td>{item.createdAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
