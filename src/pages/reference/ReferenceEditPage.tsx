import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import KeywordInput from "@/components/reference/KeywordInput";
import FileUpload from "@/components/reference/FileUpload";
import { collectionService } from "@/services/collection";
import { referenceService } from "@/services/reference";
import { ChevronDown, Loader } from "lucide-react";
import type { CollectionCard } from "@/types/collection";
import type { CreateReferenceFile } from "@/types/reference";

interface FormData {
  collection: string;
  title: string;
  keywords: string[];
  memo: string;
  files: CreateReferenceFile[];
}

export default function ReferenceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [collections, setCollections] = useState<CollectionCard[]>([]);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);

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
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoadingCollections(true);
        const response = await collectionService.getCollectionList({
          page: 1,
          sortBy: "createdAt",
          search: "",
        });
        setCollections(response.data || []);
      } catch (error) {
        console.error('Error fetching collections:', error);
        showToast("컬렉션 목록을 불러오는데 실패했습니다.", "error");
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, [showToast]);

  // 레퍼런스 상세 정보 조회
  useEffect(() => {
    const fetchReference = async () => {
      if (!id) {
        console.log('No ID provided');
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching reference for ID:', id);
        const reference = await referenceService.getReference(id);
        console.log('Received reference:', reference);

        // 파일 데이터 변환
        const convertedFiles: CreateReferenceFile[] = reference.files.map(file => ({
          id: file._id,
          type: file.type,
          content: file.type === 'link' ? file.path : file.previewURL || file.previewURLs?.[0] || '',
          name: file.path.split('/').pop() || ''
        }));

        setFormData({
          collection: collections.find(c => c._id === reference.collectionId)?.title || '',
          title: reference.title,
          keywords: reference.keywords || [],
          memo: reference.memo || "",
          files: convertedFiles.length > 0 ? convertedFiles : [{
            id: Date.now().toString(),
            type: "link",
            content: "",
          }],
        });
      } catch (error) {
        console.error('Error fetching reference:', error);
        showToast("레퍼런스 정보를 불러오는데 실패했습니다.", "error");
        navigate('/references');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReference();
  }, [id, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

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

      if (!id) {
        showToast("잘못된 접근입니다.", "error");
        return;
      }

      // 파일 데이터 준비
      const filesFormData = referenceService.prepareFilesFormData(formData.files);

      // API 호출
      await referenceService.updateReference(id, {
        collectionTitle: formData.collection,
        title: formData.title,
        keywords: formData.keywords,
        memo: formData.memo,
        files: filesFormData
      });

      showToast("레퍼런스가 수정되었습니다.", "success");
      navigate('/references');
    } catch (error) {
      console.error('Error updating reference:', error);
      showToast("레퍼런스 수정에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1">
            <h1 className="text-primary font-medium">레퍼런스 수정</h1>
            <span className="text-[12px] text-gray-500">* 필수 입력</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/references')}
              className="px-4 py-2 text-gray-700 rounded-full hover:bg-gray-100 transition-colors text-sm"
            >
              취소
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
              저장
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            {/* Collection Selection */}
            <div className="w-60">
              <label className="block mb-2 text-sm">
                <span className="text-gray-700">
                  컬렉션 <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                  className="w-full h-14 px-4 text-left border border-gray-300 rounded-lg flex items-center justify-between bg-white"
                  disabled={isLoadingCollections}
                >
                  <span className="truncate">
                    {formData.collection || "저장할 컬렉션을 선택하세요"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                {showCollectionDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {collections.map((collection) => (
                      <button
                        key={collection._id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, collection: collection.title });
                          setShowCollectionDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        {collection.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Title Input */}
            <div className="flex-1">
              <label className="block mb-2 text-sm">
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
                className="w-full h-14 px-4 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.title.length}/20
              </div>
            </div>
          </div>

          {/* Keywords Input */}
          <div>
            <label className="block mb-2 text-sm">
              <span className="text-gray-700">키워드</span>
            </label>
            <div className="border border-gray-300 rounded-lg px-4 py-2 min-h-14">
              <KeywordInput
                keywords={formData.keywords}
                onChange={(keywords) => setFormData({ ...formData, keywords })}
                maxKeywords={10}
                maxLength={15}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              키워드는 공백으로 구분됩니다.
            </p>
          </div>

          {/* Memo Input */}
          <div>
            <label className="block mb-2 text-sm">
              <span className="text-gray-700">메모</span>
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) =>
                setFormData({ ...formData, memo: e.target.value })
              }
              maxLength={500}
              placeholder="메모를 입력해주세요."
              disabled={isSubmitting}
              className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.memo.length}/500
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm">
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