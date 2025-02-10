// src/components/reference/ImagePreviewModal.tsx
import Modal from '@/components/common/Modal';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  imageName
}: ImagePreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full mx-4 p-6"
    >
      <div className="space-y-4">
        {imageName && (
          <h3 className="text-lg font-semibold text-gray-900">{imageName}</h3>
        )}
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