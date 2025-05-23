import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  modalState,
  DropState,
  collectionState,
  alertState,
  shareModalState,
  floatingModeState,
} from "@/store/collection";
import { collectionService } from "@/services/collection";
import FloatingButton from "@/components/common/FloatingButton";
import Dropdown from "@/components/common/Dropdown";
import CollectionCard from "@/components/collection/CollectionCard";
import { ApiError } from "@/utils/errorHandler";
import { FolderPlus } from "lucide-react";
import { useToast } from "@/contexts/useToast";
import Pagination from "@/components/collection/Pagination";
import Modal from "@/components/collection/Modal";
import Alert from "@/components/common/Alert";
import ShareModal from "@/components/collection/ShareModal";
import { CollectionResponse } from "@/types/collection";

const CollectionPage: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareCollection, setIsShareCollection] = useState(false);
  const sort = useRecoilValue(DropState);
  const [modal, setModal] = useRecoilState(modalState);
  const [modeValue] = useRecoilState(floatingModeState);
  const alert = useRecoilValue(alertState);
  const shareModal = useRecoilValue(shareModalState);
  const [collectionData, setCollectionData] =
    useRecoilState<CollectionResponse>(collectionState);
  const alertPrevIsOpen = useRef<boolean>(alert.isVisible);
  const modalPrevIsOpen = useRef<boolean>(modal.isOpen);
  const sharePrevIsOpen = useRef<boolean>(shareModal.isOpen);
  const [isFloatOpen, setIsFloatOpen] = useState(false);

  const fetchCollections = async () => {
    setIsLoading(true);
    const params = {
      page: currentPage,
      sortBy: sort.sortType,
      search: sort.searchWord,
    };

    try {
      const response = await collectionService.getCollectionList(params);
      setCollectionData(response);
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, "error");
      } else if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("컬렉션 가져오기를 실패했습니다.", "error");
      }

      // CollectionResponse 타입에 맞게 초기 상태 설정
      setCollectionData({
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [sort, currentPage, showToast, setCollectionData]);

  useEffect(() => {
    if (alertPrevIsOpen.current === true && alert.isVisible === false) {
      fetchCollections();
    } else if (modalPrevIsOpen.current === true && modal.isOpen === false) {
      fetchCollections();
    } else if (
      sharePrevIsOpen.current === true &&
      shareModal.isOpen === false
    ) {
      fetchCollections();
    }

    alertPrevIsOpen.current = alert.isVisible;
    modalPrevIsOpen.current = modal.isOpen;
    sharePrevIsOpen.current = shareModal.isOpen;
  }, [alert.isVisible, modal.isOpen, shareModal.isOpen]);

  const handleCreate = () => {
    setModal((prev) => ({ ...prev, isOpen: true, type: "create" }));
  };

  const handleFloating = (event: React.MouseEvent) => {
    if (!isFloatOpen) return;

    if (
      modeValue.isDelete &&
      (event.target as HTMLElement).closest('[data-testid="collection-card"]')
    ) {
      return;
    }

    if ((event.target as HTMLElement).closest('[data-testid="floating-btn"]')) {
      return;
    }

    setIsFloatOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="font-sans" onClick={(e) => handleFloating(e)}>
      {modal.isOpen && <Modal type={modal.type} />}
      {shareModal.isOpen && (
        <ShareModal collectionId={shareModal.collectionId} />
      )}
      {alert.isVisible && <Alert message={alert.massage} />}
      {collectionData?.data?.length > 0 && (
        <FloatingButton
          type="collection"
          data={collectionData.data}
          isOpen={isFloatOpen}
          setIsOpen={setIsFloatOpen}
        />
      )}

      <div className="flex flex-col max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between mt-10 mb-6">
          <Dropdown type="array" />
          <div
            className="flex items-center gap-1.5 cursor-pointer text-gray-500 hover:text-primary transition-colors"
            onClick={() => setIsShareCollection(!isShareCollection)}
          >
            <div
              className={`w-5 h-5 border-2 border-primary text-white flex items-center justify-center rounded cursor-pointer ${
                isShareCollection ? "bg-primary" : "bg-white"
              }`}
            >
              {isShareCollection && "✔"}
            </div>
            <p className="sm:text-base text-sm mb-1">공유 중인 컬렉션만 보기</p>
          </div>
        </div>

        {collectionData?.data?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {collectionData.data.map((collection) =>
                isShareCollection ? (
                  collection.isShared && (
                    <CollectionCard
                      key={collection._id}
                      _id={collection._id}
                      title={collection.title}
                      isFavorite={collection.isFavorite}
                      isShared={collection.isShared}
                      refCount={collection.refCount}
                      previewImages={collection.previewImages}
                      creator={collection.creator}
                      editor={collection.editor}
                      viewer={collection.viewer}
                    />
                  )
                ) : (
                  <CollectionCard
                    key={collection._id}
                    _id={collection._id}
                    title={collection.title}
                    isFavorite={collection.isFavorite}
                    isShared={collection.isShared}
                    refCount={collection.refCount}
                    previewImages={collection.previewImages}
                    creator={collection.creator}
                    editor={collection.editor}
                    viewer={collection.viewer}
                  />
                )
              )}
            </div>

            {collectionData.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={collectionData.totalPages}
                setPage={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-700 font-semibold text-2xl text-center mt-44 mb-6 whitespace-pre-line">
              {sort.searchWord.length > 0
                ? `검색 결과가 없어요.\n다른 검색어로 시도해 보세요!`
                : `아직 추가된 컬렉션이 없어요.\n새 컬렉션을 만들어 정리를 시작해보세요!`}
            </p>
            {sort.searchWord.length === 0 && (
              <button
                onClick={handleCreate}
                className="flex w-fit px-12 py-4 gap-3 rounded-full bg-primary hover:bg-primary-dark"
              >
                <FolderPlus className="w-10 h-10 stroke-white" />
                <p className="text-white text-3xl font-bold">컬렉션 생성</p>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
