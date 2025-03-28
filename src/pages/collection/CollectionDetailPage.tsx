import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { useToast } from "@/contexts/useToast";
import { FilePlus, LayoutGrid, Text, Users } from "lucide-react";
import FloatingButton from "@/components/common/FloatingButton";
import { referenceService } from "@/services/reference";
import { Reference } from "@/types/reference";
import {
  DropState,
  modalState,
  collectionState,
  alertState,
  shareModalState,
  floatingModeState,
} from "@/store/collection";
import { useRecoilValue, useRecoilState } from "recoil";
import Dropdown from "@/components/common/Dropdown";
import ReferenceCard from "@/components/reference/ReferenceCard";
import ReferenceList from "@/components/reference/ReferenceList";
import Modal from "@/components/collection/Modal";
import Alert from "@/components/common/Alert";
import ShareModal from "@/components/collection/ShareModal";
import { collectionService } from "@/services/collection";
import { ReferenceListItem } from "../reference/ReferenceListPage";

export default function CollectionDetailPage() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [view, setView] = useState("card");
  const sort = useRecoilValue(DropState);
  const shareModal = useRecoilValue(shareModalState);
  const [alert, setAlert] = useRecoilState(alertState);
  const [collectionDatas, setCollectionDatas] = useRecoilState(collectionState);
  const [modeValue] = useRecoilState(floatingModeState);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useRecoilState(modalState);
  const [referenceData, setReferenceData] = useState<ReferenceListItem[]>([]);
  const alertPrevIsOpen = useRef<boolean>(alert.isVisible);
  const modalPrevIsOpen = useRef<boolean>(modal.isOpen);
  const [isFloatOpen, setIsFloatOpen] = useState(false);

  // collectionData를 useMemo로 관리
  const collectionData = useMemo(
    () => collectionDatas.data.find((item) => item._id === collectionId),
    [collectionDatas.data, collectionId]
  );

  // 데이터 페칭을 하나의 useEffect로 통합
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 컬렉션 데이터 가져오기
      const collectionParams = {
        page: 1,
        sortBy: sort.sortType,
        search: sort.searchWord,
      };
      const collectionResponse = await collectionService.getCollectionList(
        collectionParams
      );
      setCollectionDatas(collectionResponse);

      // 레퍼런스 데이터 가져오기
      const params = {
        sortBy: sort.sortType,
        search: sort.searchWord,
        collection:
          collectionResponse.data.find((item) => item._id === collectionId)
            ?.title || "",
        filterBy: sort.searchType,
        view: view,
        mode: "home",
      };

      const referenceResponse = await referenceService.getReferenceList(params);

      if (!referenceResponse.data) {
        setReferenceData([]);
        return;
      }

      const transformedData: ReferenceListItem[] = referenceResponse.data.map(
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
            collectionTitle: collectionResponse.data.find(
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
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("데이터를 불러오는데 실패했습니다.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sort, view, collectionId]);

  useEffect(() => {
    if (alertPrevIsOpen.current === true && alert.isVisible === false) {
      fetchData();
    } else if (modalPrevIsOpen.current === true && modal.isOpen === false) {
      fetchData();
    }

    alertPrevIsOpen.current = alert.isVisible;
    modalPrevIsOpen.current = modal.isOpen;
  }, [alert.isVisible, modal.isOpen]);

  const handleDelete = () => {
    let text = "";
    if (collectionData?.isShared) {
      text = `공유 중인 ${collectionData.title} 컬렉션을 삭제하시겠습니까? \n컬렉션 내 모든 레퍼런스가 삭제되며, \n복구할 수 없습니다.`;
    } else if (collectionData?.refCount === 0) {
      text = `${collectionData.title} 컬렉션을 삭제하시겠습니까?`;
    } else {
      text = `${collectionData?.title} 컬렉션을 삭제하시겠습니까? \n컬렉션 내 모든 레퍼런스가 삭제되며, \n복구할 수 없습니다.`;
    }
    setAlert({
      ids: [collectionData?._id || ""],
      massage: text,
      isVisible: true,
      type: "collectionDetail",
      title: "",
    });
  };

  const handleFloating = (event: React.MouseEvent) => {
    if (!isFloatOpen) return;

    if (
      (modeValue.isMove || modeValue.isDelete) &&
      (event.target as HTMLElement).closest('[data-testid="reference-card"]')
    ) {
      return;
    }

    if ((event.target as HTMLElement).closest('[data-testid="floating-btn"]')) {
      return;
    }

    setIsFloatOpen(false);
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
    <div className="font-sans min-h-screen" onClick={(e) => handleFloating(e)}>
      {modal.isOpen && <Modal type={modal.type} />}
      {shareModal.isOpen && <ShareModal collectionId={collectionId || ""} />}
      {alert.isVisible && <Alert message={alert.massage} />}
      {referenceData.length > 0 && (
        <FloatingButton
          type="collectionDetail"
          data={referenceData}
          isOpen={isFloatOpen}
          setIsOpen={setIsFloatOpen}
        />
      )}

      <div className="flex flex-col max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between mt-12 pb-6 border-b border-gray-400">
          <p className="flex items-center text-primary text-3xl font-bold gap-4">
            {collectionData?.isShared && (
              <Users className="w-9 h-9 stroke-primary" />
            )}
            {collectionData?.title}
          </p>
          <div className="flex text-lg font-bold gap-1.5">
            {collectionData?.creator && (
              <button
                className="px-8 py-3 bg-white rounded-[50px] border border-gray-200 text-[#f65063] hover:bg-gray-100"
                onClick={handleDelete}
              >
                컬렉션 삭제
              </button>
            )}
            {!collectionData?.viewer && (
              <button
                className="px-8 py-3 bg-primary rounded-[50px] text-[#F9FAF9] hover:bg-primary-dark"
                onClick={() =>
                  setModal({
                    id: collectionId ? collectionId.toString() : "",
                    title: collectionData?.title || "",
                    isOpen: true,
                    type: "update",
                  })
                }
              >
                수정
              </button>
            )}
          </div>
        </div>
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
            <p className="text-gray-700 font-semibold text-2xl text-center mt-44 mb-6">
              {sort.searchWord.length > 0
                ? `검색 결과가 없어요.\n다른 검색어로 시도해 보세요!`
                : `아직 추가된 레퍼런스가 없어요.\n자료를 추가해보세요!`}
            </p>
            {sort.searchWord.length === 0 && !collectionData?.viewer && (
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
