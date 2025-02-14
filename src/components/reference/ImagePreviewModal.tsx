// src/components/reference/ImagePreviewModal.tsx
import Modal from '@/components/common/Modal';
import { Download } from 'lucide-react';

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
  downloadUrl
}: ImagePreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full mx-4 p-6"
    >
      <div className="space-y-4">
        {/* 헤더 영역: 파일명과 다운로드 버튼 */}
        <div className="flex items-center justify-between mb-2 pr-8"> {/* pr-8 추가하여 X 버튼과 간격 확보 */}
          <div className="flex-1 min-w-0"> {/* min-w-0 추가하여 텍스트 오버플로우 방지 */}
            {imageName && (
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {imageName}
              </h3>
            )}
          </div>
          {downloadUrl && (
            <button 
              onClick={() => window.open(downloadUrl, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-4 text-sm bg-white border border-gray-200 rounded-md hover:border-primary hover:text-primary transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>다운로드</span>
            </button>
          )}
        </div>
        
        {/* 이미지 영역 */}
        <div className="relative w-full" style={{ paddingTop: '75%' }}>
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