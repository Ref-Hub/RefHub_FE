import { useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { FilePlus, LayoutGrid, Text } from "lucide-react";
import Dropdown from "@/components/common/Dropdown";
import { DropState, modalState, alertState, collectionState } from "@/store/collection";
import ReferenceCard from "@/components/reference/ReferenceCard";
import ReferenceList from "@/components/reference/ReferenceList";
import FloatingButton from "@/components/common/FloatingButton";
import { referenceService } from "@/services/reference";
import { collectionService } from "@/services/collection";
import { useToast } from "@/contexts/useToast";
import { Reference as ReferenceCardProps } from "@/types/reference";
import Modal from "@/components/collection/Modal";
import Alert from "@/components/common/Alert";

export default function ReferenceListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [view, setView] = useState("card");
  const sort = useRecoilValue(DropState);
  const modal = useRecoilValue(modalState);
  const alert = useRecoilValue(alertState);
  const setCollections = useSetRecoilState(collectionState);
  const [isLoading, setIsLoading] = useState(true);
  const [referenceData, setReferenceData] = useState<ReferenceCardProps[]>([]);

  // 컬렉션 데이터 로드
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const collectionsData = await collectionService.getCollectionList();
        if (collectionsData?.data) {
          setCollections({ data: collectionsData.data });
        } else {
          setCollections({ data: [] });
        }
      } catch (error) {
        setCollections({ data: [] });
        if (error instanceof Error) {
          showToast(error.message, "error");
        } else {
          showToast("컬렉션 데이터를 불러오는데 실패했습니다.", "error");
        }
      }
    };

    loadCollections();
  }, [setCollections, showToast]);

  // 레퍼런스 데이터 로드
  useEffect(() => {
    const loadReferences = async () => {
      setIsLoading(true);
      try {
        const params = {
          sortBy: sort.sortType,
          search: sort.searchWord,
          collection: sort.collections,
          filterBy: sort.searchType,
          view: view,
          mode: "home",
        };

        const data = await referenceService.getReferenceList(params);
        setReferenceData(data || []);
      } catch (error) {
        if (error instanceof Error) {
          showToast(error.message, "error");
        } else {
          showToast("레퍼런스 데이터를 불러오는데 실패했습니다.", "error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadReferences();
  }, [sort, modal.isOpen, view, alert, showToast]);

  const handleCreate = () => {
    navigate("/references/new");
  };

  const viewStyles = (id: string) =>
    `w-[50px] h-[50px] p-[9px] rounded-full overflow-visible hover:cursor-pointer ${
      view === id
        ? "bg-primary stroke-gray-100"
        : "bg-white stroke-gray-700 border border-gray-200"
    }`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      {modal.isOpen && <Modal />}
      {alert.isVisible && <Alert message={alert.massage} />}
      {referenceData?.length > 0 && <FloatingButton type="reference" />}
      <div className="flex flex-col max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between mt-10 mb-6">
          <Dropdown type="array" />
          <div className="flex gap-2">
            <LayoutGrid
              className={viewStyles("card")}
              onClick={() => setView("card")}
            />
            <Text
              className={viewStyles("list")}
              onClick={() => setView("list")}
            />
          </div>
        </div>
        {referenceData.length > 0 ? (
          view === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {referenceData.map((data) => (
                <ReferenceCard
                  key={data._id}
                  _id={data._id}
                  createAndShare={data.createAndShare}
                  collectionId={data.collectionId}
                  title={data.title}
                  keywords={data.keywords}
                  previewURLs={data.previewURLs}
                  createdAt={data.createdAt}
                />
              ))}
            </div>
          ) : (
            <ReferenceList items={referenceData} />
          )
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-700 font-semibold text-2xl text-center mt-44 mb-6 whitespace-pre-line">
              {sort.searchWord.length > 0
                ? `검색 결과가 없어요.\n다른 검색어로 시도해 보세요!`
                : `아직 추가된 레퍼런스가 없어요.\n자료를 추가해보세요!`}
            </p>
            {sort.searchWord.length === 0 && (
              <button
                onClick={handleCreate}
                className="flex w-fit px-12 py-4 gap-3 rounded-full bg-primary hover:bg-primary-dark"
              >
                <FilePlus className="w-10 h-10 stroke-white" />
                <p className="text-white text-3xl font-bold">레퍼런스 추가</p>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}