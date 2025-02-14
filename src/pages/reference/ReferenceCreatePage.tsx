// src/pages/reference/ReferenceCreatePage.tsx
import React, { useState, useEffect } from "react";
import { useToast } from "@/contexts/useToast";
import KeywordInput from "@/components/reference/KeywordInput";
import FileUpload from "@/components/reference/FileUpload";
import { useReferenceCreate } from "@/hooks/useReferenceCreate";
import { collectionService } from "@/services/collection";
import { Loader } from "lucide-react";
import type { CollectionCard } from "@/types/collection";

interface FileItem {
  id: string;
  type: "link" | "image" | "pdf" | "file";
  content: string;
  name?: string;
}

interface FormData {
  collection: string;
  title: string;
  keywords: string[];
  memo: string;
  files: FileItem[];
}

export default function ReferenceCreatePage() {
  const { showToast } = useToast();
  const { createReference, isLoading: isSubmitting } = useReferenceCreate();
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [collections, setCollections] = useState<CollectionCard[]>([]);

  const [formData, setFormData] = useState<FormData>({
    collection: "",
    title: "",
    keywords: [],
    memo: "",
    files: [
      {
        id: Date.now().toString(),
        type: "link",
        content: "",
      },
    ],
  });

  // 컬렉션 목록 조회
  // response.data 타입이 CollectionResponse이므로 data 배열에 접근
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoadingCollections(true);
        const response = await collectionService.getCollectionList({
          page: 1,
          sortBy: "createdAt",
          search: "",
        });
        setCollections(response.data || []); // CollectionResponse의 data 배열 사용
      } catch (_) {
        showToast("컬렉션 목록을 불러오는데 실패했습니다.", "error");
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validation
      if (!formData.collection) {
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

      // API 호출
      await createReference({
        collectionTitle: formData.collection,
        title: formData.title,
        keywords: formData.keywords,
        memo: formData.memo,
        files: formData.files,
      });
    } catch (error) {
      showToast("레퍼런스 등록에 실패했습니다.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-primary text-2xl font-semibold">
              레퍼런스 추가
            </h1>
            <span className="text-sm text-gray-500">* 필수 항목</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
            등록
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4 items-start">
            {/* Collection Selection */}
            <div className="w-[244px]">
              <label className="block mb-2">
                <span className="text-gray-700">
                  컬렉션 <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <select
                  value={formData.collection}
                  onChange={(e) =>
                    setFormData({ ...formData, collection: e.target.value })
                  }
                  disabled={isLoadingCollections}
                  className="w-full h-[56px] border border-gray-300 rounded-lg px-4 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">저장할 컬렉션을 선택하세요.</option>
                  {collections.map((collection) => (
                    <option key={collection._id} value={collection.title}>
                      {collection.title}
                    </option>
                  ))}
                </select>
                {isLoadingCollections && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Title Input */}
            <div className="flex-1">
              <label className="block mb-2">
                <span className="text-gray-700">
                  제목 <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                maxLength={20}
                placeholder="레퍼런스의 제목을 입력해 주세요."
                disabled={isSubmitting}
                className="w-full h-[56px] border border-gray-300 rounded-lg px-4 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.title.length}/20
              </div>
            </div>
          </div>

          {/* Keywords Input */}
          <div>
            <label className="block mb-2">
              <span className="text-gray-700">키워드</span>
            </label>
            <div className="border border-gray-300 rounded-lg px-4 py-2 min-h-[56px]">
              <KeywordInput
                keywords={formData.keywords}
                onChange={(keywords) => setFormData({ ...formData, keywords })}
                maxKeywords={10}
                maxLength={15}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              띄어쓰기로 구분해서 입력해주세요.
            </p>
          </div>

          {/* Memo Input */}
          <div>
            <label className="block mb-2">
              <span className="text-gray-700">메모</span>
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) =>
                setFormData({ ...formData, memo: e.target.value })
              }
              maxLength={500}
              placeholder="내용을 입력해주세요."
              disabled={isSubmitting}
              className="w-full h-32 border border-gray-300 rounded-lg px-4 py-2 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.memo.length}/500
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block">
                <span className="text-gray-700">
                  자료 첨부 <span className="text-red-500">*</span>
                </span>
              </label>
              <span className="text-sm text-gray-500">
                최대 5개까지 추가 가능합니다.
              </span>
            </div>
            <div className="border border-gray-300 rounded-lg p-4">
              <FileUpload
                files={formData.files}
                onChange={(files) => setFormData({ ...formData, files })}
                maxFiles={5}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
