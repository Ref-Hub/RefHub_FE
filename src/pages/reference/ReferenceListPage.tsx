import { useState, useEffect, useRef } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { FilePlus, LayoutGrid, Text } from "lucide-react";
import Dropdown from "@/components/common/Dropdown";
import {
  DropState,
  modalState,
  alertState,
  collectionState,
} from "@/store/collection";
import ReferenceCard from "@/components/reference/ReferenceCard";
import ReferenceList from "@/components/reference/ReferenceList";
import FloatingButton from "@/components/common/FloatingButton";
import { referenceService } from "@/services/reference";
import { collectionService } from "@/services/collection";
import { useToast } from "@/contexts/useToast";
import Modal from "@/components/collection/Modal";
import Alert from "@/components/common/Alert";
import { Reference } from "@/types/reference";
import { CollectionResponse } from "@/types/collection";

// ReferenceCard와 리스트에서 공통으로 사용할 타입 정의
export interface ReferenceListItem {
  _id: string;
  isShared?: boolean;
  creator?: boolean;
  editor?: boolean;
  viewer?: boolean;
  collectionId: string;
  title: string;
  keywords?: string[];
  previewData?: string[];
  createdAt?: string;
  files: Array<{
    _id: string;
    type: string;
    path: string;
    size: number;
    previewURL?: string;
    previewURLs?: string[];
  }>;
}

export default function ReferenceListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [view, setView] = useState("card");
  const sort = useRecoilValue(DropState);
  const modal = useRecoilValue(modalState);
  const alert = useRecoilValue(alertState);
  const [collections, setCollections] = useRecoilState(collectionState);
  const [isLoading, setIsLoading] = useState(true);
  const [referenceData, setReferenceData] = useState<ReferenceListItem[]>([]);
  const alertPrevIsOpen = useRef<boolean>(alert.isVisible);
  const modalPrevIsOpen = useRef<boolean>(modal.isOpen);

  // 컬렉션 데이터 로드
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const collectionsData = await collectionService.getCollectionList();
        if (collectionsData?.data) {
          const collectionResponse: CollectionResponse = {
            currentPage: collectionsData.currentPage || 1,
            totalPages: collectionsData.totalPages || 1,
            totalItemCount: collectionsData.totalItemCount || 0,
            _id: collectionsData._id || "",
            title: collectionsData.title || "",
            isShared: collectionsData.isShared || false,
            isFavorite: collectionsData.isFavorite || false,
            refCount: collectionsData.refCount || 0,
            previewImages: collectionsData.previewImages || [],
            data: collectionsData.data,
          };
          setCollections(collectionResponse);
        } else {
          // 빈 상태의 CollectionResponse 객체 설정
          setCollections({
            currentPage: 1,
            totalPages: 1,
            totalItemCount: 0,
            _id: "",
            title: "",
            isShared: false,
            isFavorite: false,
            refCount: 0,
            previewImages: [],
            data: [],
          });
        }
      } catch (error) {
        // 에러 시 빈 상태의 CollectionResponse 객체 설정
        setCollections({
          currentPage: 1,
          totalPages: 1,
          totalItemCount: 0,
          _id: "",
          title: "",
          isShared: false,
          isFavorite: false,
          refCount: 0,
          previewImages: [],
          data: [],
        });
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

      const response = await referenceService.getReferenceList(params);

      if (!response.data) {
        console.log("No data in response");
        setReferenceData([]);
        return;
      }

      const transformedData: ReferenceListItem[] = response.data.map(
        (reference) => {
          const files = reference.files || [];

          return {
            _id: reference._id,
            isShared: reference.shared,
            shared: reference.shared,
            creator: reference.creator,
            editor: reference.editor,
            viewer: reference.viewer,
            collectionId: reference.collectionId,
            collectionTitle: collections.data.find(
              (item) => item._id === reference.collectionId
            )?.title,
            title: reference.title,
            keywords: reference.keywords,
            previewData: reference.previewData,
            createdAt: reference.createdAt,
            files: files.map((file) => ({
              _id: file._id || file.path,
              type: file.type,
              path: file.path,
              size: file.size,
              previewURL: file.previewURL,
              previewURLs: file.previewURLs,
            })),
          };
        }
      );

      setReferenceData(transformedData);
    } catch (error) {
      console.error("Error loading references:", error);
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("레퍼런스 데이터를 불러오는데 실패했습니다.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferences();
  }, [sort, view, showToast]);

  useEffect(() => {
    if (alertPrevIsOpen.current === true && alert.isVisible === false) {
      loadReferences();
    } else if (modalPrevIsOpen.current === true && modal.isOpen === false) {
      loadReferences();
    }

    alertPrevIsOpen.current = alert.isVisible;
    modalPrevIsOpen.current = modal.isOpen;
  }, [alert.isVisible, modal.isOpen]);

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
    <div className="font-sans">
      {modal.isOpen && <Modal type={modal.type} />}
      {alert.isVisible && <Alert message={alert.massage} />}
      {collections.data.length > 0 && (
        <FloatingButton type="reference" data={referenceData} />
      )}
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
                <ReferenceCard key={data._id} {...(data as Reference)} />
              ))}
            </div>
          ) : (
            <ReferenceList items={referenceData as Reference[]} />
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
                onClick={() => navigate("/references/new")}
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
