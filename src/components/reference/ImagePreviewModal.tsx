// src/components/reference/ImagePreviewModal.tsx
import Modal from "@/components/common/Modal";
import { Download } from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
  downloadUrl?: string;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  downloadUrl,
}: ImagePreviewModalProps) {
  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      // URL로부터 파일 다운로드
      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      // 다운로드 링크 생성
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = imageName || "image"; // 파일명 지정

      // 링크 클릭하여 다운로드 실행
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // 생성한 요소 정리
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full mx-4 p-6"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2 pr-8">
          <div className="flex-1 min-w-0">
            {imageName && (
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {imageName ? decodeURIComponent(imageName) : ""}
              </h3>
            )}
          </div>
          {downloadUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-4 text-sm bg-white border border-gray-200 rounded-md hover:border-primary hover:text-primary transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>다운로드</span>
            </button>
          )}
        </div>
        <div className="relative w-full" style={{ paddingTop: "75%" }}>
          <img
            src={imageUrl}
            alt={imageName || "Preview"}
            className="absolute top-0 left-0 w-full h-full object-contain"
          />
        </div>
      </div>
    </Modal>
  );
}
