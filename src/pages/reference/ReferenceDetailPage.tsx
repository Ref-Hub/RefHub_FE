import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import { referenceService } from "@/services/reference";
import { useSetRecoilState } from "recoil";
import { alertState } from "@/store/collection";
import { 
  Users, 
  PencilLine, 
  Trash2, 
  Share2, 
  Loader, 
  Link, 
  FileText, 
  File,
  Download
} from "lucide-react";
import Modal from "@/components/common/Modal";
import ImagePreviewModal from "@/components/reference/ImagePreviewModal";
import { Reference, ReferenceFile } from "@/types/reference";

export default function ReferenceDetailPage() {
  const { referenceId } = useParams<{ referenceId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setAlert = useSetRecoilState(alertState);
  const [isLoading, setIsLoading] = useState(true);
  const [reference, setReference] = useState<Reference | null>(null);
  const [selectedImage, setSelectedImage] = useState<{url: string; name?: string} | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
      ? `${reference.collectionTitle || "선택한"} 컬렉션의 다른 사용자와 공유 중인 ${reference.title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`
      : `${reference.title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`;

    setAlert({
      ids: [reference._id],
      massage: text,
      isVisible: true,
      type: "reference",
      title: reference.title,
    });
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const renderFilePreview = (file: ReferenceFile) => {
    switch (file.type) {
      case "link":
        return (
          <a
            href={file.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-primary transition-colors"
          >
            <Link className="w-5 h-5 text-primary" />
            <span className="flex-1 truncate text-sm">{file.path}</span>
            <span className="text-sm text-gray-500">링크 이동</span>
          </a>
        );
      
      case "image":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {file.previewURLs?.map((url, index) => (
              <div 
                key={index}
                className="relative aspect-video cursor-pointer group"
                onClick={() => setSelectedImage({ url, name: `이미지 ${index + 1}` })}
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
        );

      case "pdf":
        return (
          <a
            href={file.previewURL}
            download
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-primary transition-colors"
          >
            <FileText className="w-5 h-5 text-primary" />
            <span className="flex-1 truncate text-sm">
              {file.path.split("/").pop()}
            </span>
            <Download className="w-5 h-5 text-gray-500" />
          </a>
        );

      case "file":
        return (
          <a
            href={file.path}
            download
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-primary transition-colors"
          >
            <File className="w-5 h-5 text-primary" />
            <span className="flex-1 truncate text-sm">
              {file.path.split("/").pop()}
            </span>
            <Download className="w-5 h-5 text-gray-500" />
          </a>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="flex items-center gap-2 text-base text-gray-500">
            {reference.createAndShare && (
              <Users className="w-5 h-5 stroke-gray-700" />
            )}
            <span>{reference.collectionTitle || "불러오는 중..."}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>공유</span>
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <PencilLine className="w-4 h-4" />
              <span>수정</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>삭제</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {reference.title}
        </h1>

        {/* Keywords */}
        {reference.keywords && reference.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {reference.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#0a306c] text-white text-sm rounded-full"
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
            <p className="text-gray-700 whitespace-pre-wrap">{reference.memo}</p>
          </div>
        )}

        {/* Files */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">첨부 자료</h3>
          <div className="space-y-4">
            {reference.files.map((file, index) => (
              <div key={index} className="space-y-2">
                {renderFilePreview(file)}
              </div>
            ))}
          </div>
        </div>

        {/* Creation Date */}
        <p className="text-right text-sm text-gray-500 mt-8">
          {new Date(reference.createdAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </p>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        className="w-full max-w-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-4">레퍼런스 공유</h2>
        {/* Share modal content */}
      </Modal>

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