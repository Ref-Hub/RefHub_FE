// src/pages/reference/ReferenceListPage.tsx
import Dropdown from "@/components/common/Dropdown";
import { useState } from "react";
import { FilePlus, LayoutGrid, Text } from "lucide-react";
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
  {
    shared: true,
    collectionTitle: "컬렉션 이름",
    referenceTitle: "레퍼런스 제목",
    keywords: ["aa", "bb"],
    img: [test, test, test, test],
    createdAt: "2025.01.22",
  },
  {
    shared: false,
    collectionTitle: "컬렉션 이름",
    referenceTitle: "웹 UI",
    keywords: ["tag1", "tag2"],
    img: [test, test, test, test],
    createdAt: "2025.01.22",
  },
  {
    shared: false,
    collectionTitle: "코드잇",
    referenceTitle: "코드잇 부스트 레퍼런스",
    keywords: ["tag1", "tag2"],
    img: [test, test, test, test],
    createdAt: "2025.01.22",
  },
  {
    shared: true,
    collectionTitle: "컬렉션 이름",
    referenceTitle: "레퍼런스 제목",
    keywords: ["aa", "bb"],
    img: [test, test, test, test],
    createdAt: "2025.01.22",
  },
  {
    shared: false,
    collectionTitle: "컬렉션 이름",
    referenceTitle: "웹 UI",
    keywords: ["tag1", "tag2"],
    img: [test, test, test, test],
    createdAt: "2025.01.22",
  },
];

export default function ReferenceListPage() {
  const [sort, setSort] = useState("latest"); // 정렬
  const [view, setView] = useState("gallery"); // 보기타입
  const handleCreate = () => {
    //
  };

  const viewStyles = (id: string) =>
    `w-[50px] h-[50px] p-[9px] rounded-full overflow-visible hover:cursor-pointer ${
      view === id
        ? "bg-primary stroke-gray-100"
        : "bg-white stroke-gray-700 border border-gray-200"
    }`;

  return (
    <div className=" min-h-screen bg-[#F9FAF9] font-sans">
      <div className="flex flex-col max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between mt-10 mb-6">
          {/* 레퍼런스 정렬 드롭다운 */}
          <Dropdown type="array" setSort={setSort} />
          {/* 보기타입버튼 */}
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
        {sampleData ? (
          // 갤러리뷰
          view === "gallery" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {sampleData.map((data, index) => (
                <ReferenceCard
                  key={index}
                  id="1"
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
            // 리스트뷰
            <ReferenceList items={sampleData} />
          )
        ) : (
          // 러퍼런스 데이터 없음
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
