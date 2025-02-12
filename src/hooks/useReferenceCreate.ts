// src/hooks/useReferenceCreate.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import { referenceService } from "@/services/reference";

interface ReferenceFormData {
  collectionTitle: string;
  title: string;
  keywords: string[];
  memo: string;
  files: Array<{
    id: string;
    type: "link" | "image" | "pdf" | "file";
    content: string;
    name?: string;
  }>;
}

export function useReferenceCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createReference = async (formData: ReferenceFormData) => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!formData.collectionTitle) {
        showToast("컬렉션을 선택해 주세요.", "error");
        return;
      }
      if (!formData.title) {
        showToast("제목을 입력해 주세요.", "error");
        return;
      }
      if (formData.files.some((file) => !file.content)) {
        showToast("모든 자료를 입력해 주세요.", "error");
        return;
      }

      // Create reference with original files data
      await referenceService.createReference({
        collectionTitle: formData.collectionTitle,
        title: formData.title,
        keywords: formData.keywords,
        memo: formData.memo,
        files: formData.files, // 직접 files 배열 전달
      });

      showToast("레퍼런스가 등록되었습니다.", "success");
      navigate("/references");
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast("해당 컬렉션을 찾을 수 없습니다.", "error");
      } else {
        showToast("레퍼런스 등록에 실패했습니다.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createReference,
    isLoading,
  };
}
