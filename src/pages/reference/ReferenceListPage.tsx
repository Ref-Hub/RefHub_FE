// src/pages/reference/ReferenceListPage.tsx
import { useState, useMemo } from "react";
import { FilePlus, LayoutGrid, Text } from "lucide-react";
import Dropdown from "@/components/common/Dropdown";
import ReferenceCard from "@/components/reference/ReferenceCard";
import ReferenceList from "@/components/reference/ReferenceList";
import test from "@/assets/images/icon.svg";

const sampleData = [
  {
    shared: false,
    collectionTitle: "코드잇",
    referenceTitle: "코드잇 부스트 레퍼런스",
    keywords: ["tag1", "tag2"],
    img: [test, test, test, test],
    createdAt: "2025.01.22",
  },
  // ... 나머지 샘플 데이터
];

export default function ReferenceListPage() {
  const [view, setView] = useState("gallery");
  const [sort, setSort] = useState("latest");

  const sortedData = useMemo(() => {
    return sort === "latest" 
      ? [...sampleData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [...sampleData];
  }, [sort]);

  const handleCreate = () => {
    // TODO: 구현 예정
  };

  const viewStyles = (id: string) =>
    `w-[50px] h-[50px] p-[9px] rounded-full overflow-visible hover:cursor-pointer ${
      view === id
        ? "bg-primary stroke-gray-100"
        : "bg-white stroke-gray-700 border border-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-[#F9FAF9] font-sans">
      <div className="flex flex-col max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between mt-10 mb-6">
          <Dropdown type="array" setSort={setSort} />
          <div className="flex gap-2">
            <LayoutGrid
              className={viewStyles("gallery")}
              onClick={() => setView("gallery")}
            />
            <Text
              className={viewStyles("list")}
              onClick={() => setView("list")}
            />
          </div>
        </div>
        {sortedData.length > 0 ? (
          view === "gallery" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {sortedData.map((data, index) => (
                <ReferenceCard
                  key={index}
                  shared={data.shared}
                  collectionTitle={data.collectionTitle}
                  referenceTitle={data.referenceTitle}
                  keywords={data.keywords}
                  img={data.img}
                  createdAt={data.createdAt}
                />
              ))}
            </div>
          ) : (
            <ReferenceList items={sortedData} />
          )
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-700 font-semibold text-2xl text-center mt-44 mb-6">
              아직 추가된 레퍼런스가 없어요. <br /> 자료를 추가해보세요!
            </p>
            <button
              onClick={handleCreate}
              className="flex w-fit px-12 py-4 gap-3 rounded-full bg-primary hover:bg-primary-dark"
            >
              <FilePlus className="w-10 h-10 stroke-white" />
              <p className="text-white text-3xl font-bold">레퍼런스 생성</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}