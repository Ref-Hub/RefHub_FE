// src/components/reference/FileUpload.tsx
import { useRef, useState } from "react";
import {
  Link,
  Image as ImageIcon,
  FileText,
  File,
  X,
  Plus,
  GripVertical,
} from "lucide-react";
import { useToast } from "@/contexts/useToast";
import ImagePreviewModal from "./ImagePreviewModal";

interface FileItem {
  id: string;
  type: "link" | "image" | "pdf" | "file";
  content: string;
  name?: string;
}

interface FileContent {
  url: string;
  name?: string;
}

interface FileUploadProps {
  files: FileItem[];
  onChange: (files: FileItem[]) => void;
  maxFiles?: number;
  disabled?: boolean; // 추가
}

export default function FileUpload({
  files,
  onChange,
  maxFiles = 5,
}: FileUploadProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name?: string;
  } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddFileField = (type: "link" | "image" | "pdf" | "file") => {
    if (files.length >= maxFiles) {
      showToast(`최대 ${maxFiles}개까지만 추가할 수 있습니다.`, "error");
      return;
    }

    onChange([...files, { id: Date.now().toString(), type, content: "" }]);
  };

  const validateFile = (
    file: File,
    type: "image" | "pdf" | "file"
  ): boolean => {
    if (file.size > 20 * 1024 * 1024) {
      showToast("20MB 이하 파일만 첨부 가능합니다.", "error");
      return false;
    }

    if (type === "image" && !file.type.startsWith("image/")) {
      showToast("이미지 파일만 첨부 가능합니다.", "error");
      return false;
    }

    if (type === "pdf" && file.type !== "application/pdf") {
      showToast("PDF 파일만 첨부 가능합니다.", "error");
      return false;
    }

    return true;
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLLabelElement>,
    index: number
  ) => {
    e.preventDefault();
    const { files: droppedFiles } = e.dataTransfer;
    if (droppedFiles.length === 0) return;

    const fileType = files[index].type;
    if (fileType === "link") return;

    handleFileUpload(droppedFiles, index);
  };

  const handleFileUpload = async (uploadedFiles: FileList, index: number) => {
    try {
      const fileType = files[index].type;
      const contents: FileContent[] = [];

      for (const file of Array.from(uploadedFiles)) {
        if (!validateFile(file, fileType as "image" | "pdf" | "file")) continue;

        const content = await readFileAsDataURL(file);
        contents.push({ url: content, name: file.name });
      }

      if (contents.length > 0) {
        if (fileType === "image") {
          const existingImages = files[index].content
            ? (JSON.parse(files[index].content) as FileContent[])
            : [];

          const totalCount = existingImages.length + contents.length;
          if (totalCount > 5) {
            showToast("이미지는 최대 5개까지 첨부 가능합니다.", "error");
            contents.splice(5 - existingImages.length);
          }

          const updatedFiles = [...files];
          updatedFiles[index] = {
            ...files[index],
            content: JSON.stringify([...existingImages, ...contents]),
          };
          onChange(updatedFiles);
        } else {
          // For non-image files, just use the first file
          const updatedFiles = [...files];
          updatedFiles[index] = {
            ...files[index],
            content: contents[0].url,
            name: contents[0].name,
          };
          onChange(updatedFiles);
        }
      }
    } catch (error) {
      showToast("파일 업로드에 실패했습니다.", "error");
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    await handleFileUpload(e.target.files!, index);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTypeChange = (index: number, newType: FileItem["type"]) => {
    const updatedFiles = [...files];
    updatedFiles[index] = {
      ...files[index],
      type: newType,
      content: "",
      name: undefined,
    };
    onChange(updatedFiles);
  };

  const handleRemoveFile = (index: number, imageIndex?: number) => {
    try {
      if (typeof imageIndex === "number") {
        // Remove specific image from multiple images
        const updatedFiles = [...files];
        const images = JSON.parse(updatedFiles[index].content) as FileContent[];
        images.splice(imageIndex, 1);
        updatedFiles[index] = {
          ...updatedFiles[index],
          content: JSON.stringify(images),
        };
        onChange(updatedFiles);
      } else {
        // Remove entire file item
        onChange(files.filter((_, i) => i !== index));
      }
    } catch {
      showToast("파일 삭제에 실패했습니다.", "error");
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedFiles = [...files];
    const draggedFile = updatedFiles[draggedIndex];
    updatedFiles.splice(draggedIndex, 1);
    updatedFiles.splice(index, 0, draggedFile);

    onChange(updatedFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderUploadField = (file: FileItem, index: number) => {
    if (file.type === "link") {
      return (
        <div className="w-full h-[50px] relative">
          <input
            type="text"
            value={file.content}
            onChange={(e) => {
              const updatedFiles = [...files];
              updatedFiles[index] = { ...file, content: e.target.value };
              onChange(updatedFiles);
            }}
            placeholder="링크를 입력해 주세요."
            className="w-full h-full px-5 py-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#62BA9B]"
          />
        </div>
      );
    }

    if (file.type === "image" && file.content) {
      try {
        const images = JSON.parse(file.content) as FileContent[];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {images.map((image, imageIndex) => (
                <div key={imageIndex} className="relative w-20 h-20 group">
                  <img
                    src={image.url}
                    alt={image.name || "Preview"}
                    className="w-full h-full object-cover rounded-lg cursor-pointer"
                    onClick={() => setPreviewImage(image)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index, imageIndex)}
                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label
                  className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-[#62BA9B] transition-colors cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileChange(e, index)}
                  />
                  <Plus className="w-6 h-6 text-gray-400" />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500">
              이미지는 최대 5개까지 첨부 가능합니다.
            </p>
          </div>
        );
      } catch {
        return null;
      }
    }

    return (
      <label
        className="flex-1 flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#62BA9B] transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, index)}
      >
        <input
          type="file"
          accept={file.type === "pdf" ? ".pdf" : undefined}
          className="hidden"
          onChange={(e) => handleFileChange(e, index)}
        />
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Plus className="w-6 h-6" />
          <span>파일을 드래그하여 업로드하거나 클릭하여 선택하세요</span>
          <span className="text-sm text-gray-400">최대 20MB</span>
        </div>
      </label>
    );
  };

  return (
    <div className="space-y-6">
      {/* File List */}
      <div className="space-y-3">
        {files.map((file, index) => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#62BA9B] transition-colors ${
              draggedIndex === index ? "opacity-50" : ""
            }`}
          >
            <GripVertical className="cursor-move text-gray-400 hover:text-gray-600" />

            {/* File Type Selector */}
            <div className="relative w-32">
              <select
                value={file.type}
                onChange={(e) =>
                  handleTypeChange(index, e.target.value as FileItem["type"])
                }
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-[#62BA9B]"
              >
                <option value="link">링크</option>
                <option value="image">이미지</option>
                <option value="pdf">PDF</option>
                <option value="file">파일</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* File Content */}
            <div className="flex-1">{renderUploadField(file, index)}</div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemoveFile(index)}
              disabled={files.length === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:hover:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add File Buttons */}
      {files.length < maxFiles && (
        <div className="flex gap-3 justify-center">
          {[
            { type: "link" as const, icon: Link, label: "링크" },
            { type: "image" as const, icon: ImageIcon, label: "이미지" },
            { type: "pdf" as const, icon: FileText, label: "PDF" },
            { type: "file" as const, icon: File, label: "파일" },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleAddFileField(type)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 hover:border-[#62BA9B] hover:text-[#62BA9B] transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || ""}
        imageName={previewImage?.name}
      />
    </div>
  );
}
