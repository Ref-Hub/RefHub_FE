import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import { referenceService } from "@/services/reference";
import { useSetRecoilState, useRecoilValue } from "recoil";
import Alert from "@/components/common/Alert";
import LinkPreview from "@/components/reference/LinkPreview";
import { alertState } from "@/store/collection";
import {
  Users,
  Loader,
  Link as LinkIcon,
  FileText,
  File,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import ImagePreviewModal from "@/components/reference/ImagePreviewModal";
import { Reference, ReferenceFile } from "@/types/reference";

export default function ReferenceDetailPage() {
  const { referenceId } = useParams<{ referenceId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setAlert = useSetRecoilState(alertState);
  const alert = useRecoilValue(alertState);
  const [isLoading, setIsLoading] = useState(true);
  const [reference, setReference] = useState<Reference | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    const fetchReference = async () => {
      if (!referenceId) return;

      try {
        setIsLoading(true);
        const data = await referenceService.getReference(referenceId);
        setReference(data);
      } catch (error) {
        console.error("Error fetching reference:", error);
        showToast("레퍼런스를 불러오는데 실패했습니다.", "error");
        navigate("/references");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReference();
  }, [referenceId, navigate, showToast]);

  const handleEdit = () => {
    navigate(`/references/${referenceId}/edit`);
  };

  const handleDelete = () => {
    if (!reference) return;

    const text = reference.createAndShare
      ? `${
          reference.collectionTitle || "선택한"
        } 컬렉션의 다른 사용자와 공유 중인 ${
          reference.title
        }를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`
      : `${reference.title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`;

    setAlert({
      ids: [reference._id],
      massage: text,
      isVisible: true,
      type: "reference",
      title: reference.title,
    });

    return;
  };

  const renderFilePreview = (file: ReferenceFile) => {
    switch (file.type) {
      // renderFilePreview 함수 내 link case 부분만 수정
      case "link":
        return (
          <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <LinkIcon className="w-4 h-4" />
              <span>링크</span>
            </div>
            <div className="flex flex-col">
              <a
                href={file.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between group px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-primary transition-colors"
              >
                <span className="flex-1 truncate text-sm">{file.path}</span>
                <span className="text-sm text-gray-500 group-hover:text-primary">
                  링크 이동
                </span>
              </a>
              <LinkPreview url={file.path} />
            </div>
          </div>
        );

      case "image":
        return (
          <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <ImageIcon className="w-4 h-4" />
              <span>이미지</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {file.previewURLs?.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-video cursor-pointer group"
                  onClick={() =>
                    setSelectedImage({ url, name: `이미지 ${index + 1}` })
                  }
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        );

      case "pdf":
        return (
          <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </div>
            <a
              href={file.previewURL}
              download
              className="flex items-center justify-between group px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="flex-1 truncate text-sm">
                  {file.path.split("/").pop()}
                </span>
              </div>
              <Download className="w-5 h-5 text-gray-500 group-hover:text-primary" />
            </a>
          </div>
        );

      case "file":
        return (
          <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <File className="w-4 h-4" />
              <span>파일</span>
            </div>
            <a
              href={file.path}
              download
              className="flex items-center justify-between group px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <File className="w-5 h-5 text-primary" />
                <span className="flex-1 truncate text-sm">
                  {file.path.split("/").pop()}
                </span>
              </div>
              <Download className="w-5 h-5 text-gray-500 group-hover:text-primary" />
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reference) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Alert component */}
      {alert.isVisible && <Alert message={alert.massage} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="flex items-center gap-2 text-base text-gray-500 mb-2">
              {reference.createAndShare && (
                <Users className="w-5 h-5 stroke-gray-700" />
              )}
              <span>{reference.collectionTitle || "불러오는 중..."}</span>
            </h2>
            <h1 className="text-2xl font-bold text-primary">
              {reference.title}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="px-6 py-2 text-red-500 border border-red-500 bg-white rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                삭제
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                수정
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {reference.createdAt
                ? new Date(reference.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "-"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-4" />

        {/* Keywords */}
        {reference.keywords && reference.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {reference.keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-[10px] py-1 h-[27px] bg-[#0a306c] text-white text-sm rounded"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        {/* Memo */}
        {reference.memo && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">메모</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {reference.memo}
              </p>
            </div>
          </div>
        )}

        {/* Files */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">첨부 자료</h3>
          <div className="space-y-4">
            {reference.files.map((file, index) => (
              <div key={index}>{renderFilePreview(file)}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ""}
        imageName={selectedImage?.name}
      />
    </div>
  );
}
