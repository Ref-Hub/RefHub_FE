// src/components/reference/ImagePreviewModal.tsx
import Modal from "@/components/common/Modal";
import { Download } from "lucide-react";
import { useState } from "react";
import { authUtils } from "@/store/auth";
import { useToast } from "@/contexts/useToast";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const { showToast } = useToast();

  const handleDownload = async () => {
    if (!downloadUrl) return;
    
    try {
      setIsDownloading(true);
      
      // 중요: 원본 이미지 URL로 변환
      // 프리뷰 URL에서 원본 URL로 변환 (previews/ 경로 제거)
      const originalUrl = downloadUrl.replace('/previews/', '/').replace('-preview.png', '');
      
      const token = authUtils.getToken();
      
      // 원본 이미지 직접 다운로드
      const response = await fetch(originalUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`다운로드 실패: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(blob);
      
      // 파일명 설정 - 원본 파일명 사용
      // '-preview.png' 접미사 제거하고 원래 확장자 유지
      let fileName = imageName || "image";
      if (fileName.includes('-preview.png')) {
        fileName = fileName.replace('-preview.png', '');
      }
      
      downloadLink.download = decodeURIComponent(fileName);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadLink.href);
      
      showToast("다운로드가 완료되었습니다.", "success");
    } catch (error) {
      console.error("Download failed:", error);
      showToast("다운로드에 실패했습니다.", "error");
    } finally {
      setIsDownloading(false);
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
              disabled={isDownloading}
              className={`flex items-center gap-1.5 px-3 py-1.5 ml-4 text-sm bg-white border border-gray-200 rounded-md hover:border-primary hover:text-primary transition-colors ${
                isDownloading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "다운로드 중..." : "다운로드"}</span>
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