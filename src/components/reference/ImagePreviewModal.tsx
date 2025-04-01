import Modal from "@/components/common/Modal";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { authUtils } from "@/store/auth";
import { useToast } from "@/contexts/useToast";
import api from "@/utils/api";

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

  const isPdf =
    imageUrl.toLowerCase().includes("-preview.png") &&
    downloadUrl?.toLowerCase().includes(".pdf");

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      setIsDownloading(true);

      // API 다운로드 엔드포인트 사용
      const response = await api.get(`/api/references/download`, {
        params: { fileUrl: downloadUrl },
        responseType: "blob", // 중요: 바이너리 데이터를 blob으로 받음
      });

      // 파일 저장 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // 파일명 설정
      let fileName = imageName || (isPdf ? "document.pdf" : "image");
      // 디코딩 및 불필요한 접미사 제거
      if (fileName.includes("-preview.png")) {
        fileName = fileName.replace("-preview.png", "");
      }

      link.setAttribute("download", decodeURIComponent(fileName));
      document.body.appendChild(link);
      link.click();

      // 메모리 정리
      link.remove();
      window.URL.revokeObjectURL(url);

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
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {isPdf ? (
              <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
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
              className={`flex items-center gap-1.5 px-3 py-1.5 ml-4 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors ${
                isDownloading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "다운로드 중..." : "다운로드"}</span>
            </button>
          )}
        </div>
        <div
          className="relative w-full bg-gray-100 rounded-lg"
          style={{ paddingTop: "75%" }}
        >
          <img
            src={imageUrl}
            alt={imageName || "Preview"}
            className="absolute top-0 left-0 w-full h-full object-contain p-2"
          />
        </div>
        <p className="text-sm text-gray-500 text-center">
          {isPdf
            ? "PDF 미리보기입니다. 원본 파일을 보려면 다운로드하세요."
            : "이미지 미리보기"}
        </p>
      </div>
    </Modal>
  );
}
