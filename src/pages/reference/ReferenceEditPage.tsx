import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import KeywordInput from "@/components/reference/KeywordInput";
import FileUpload from "@/components/reference/FileUpload";
import { collectionService } from "@/services/collection";
import { referenceService } from "@/services/reference";
import { Loader } from "lucide-react";
import type { CollectionCard } from "@/types/collection";
import CollectionDropdown from "@/components/common/CollectionDropdown";
import type { CreateReferenceFile } from "@/types/reference";
import { useReferenceEdit } from "@/hooks/useReferenceEdit";

interface FormData {
  collection: string;
  title: string;
  keywords: string[];
  memo: string;
  files: CreateReferenceFile[];
}

export default function ReferenceEditPage() {
  const { referenceId } = useParams<{ referenceId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { updateReference, isLoading: isSubmitting } = useReferenceEdit();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCollections, setIsLoadingCollections] =
    useState<boolean>(false);
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

  // 레퍼런스 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      if (!referenceId) {
        showToast("잘못된 접근입니다.", "error");
        navigate("/references");
        return;
      }

      try {
        setIsLoading(true);
        const reference = await referenceService.getReference(referenceId);

        console.log("Original reference data:", reference);

        // 파일 데이터 변환
        const convertedFiles: CreateReferenceFile[] = await Promise.all(
          reference.files.map(async (file) => {
            // 기본 파일 정보 설정 (모든 파일 타입 공통)
            const baseFile = {
              id: file._id,
              type: file.type,
              name: file.filename
                ? decodeURIComponent(file.filename)
                : file.path.split("/").pop() || "",
              originalPath: file.path, // 원본 경로 명시적으로 저장 (중요!)
            };

            console.log(
              `Converting file type ${file.type} with path: ${file.path}`
            );

            if (file.type === "link") {
              return {
                ...baseFile,
                content: file.path,
              };
            } else if (file.type === "image" && file.previewURLs) {
              // 이미지 배열을 적절한 형식으로 변환
              const imageContent = file.previewURLs.map((url, index) => ({
                url, // 서버에서 받은 URL을 그대로 사용
                name: file.filenames?.[index]
                  ? decodeURIComponent(file.filenames[index])
                  : `image_${index + 1}.jpg`,
              }));

              return {
                ...baseFile,
                content: JSON.stringify(imageContent),
              };
            } else if (file.type === "pdf") {
              return {
                ...baseFile,
                content: file.path || file.previewURL || "", // 경로를 우선 사용하고, 없으면 previewURL 사용
              };
            } else {
              // file 타입
              return {
                ...baseFile,
                content: file.path || "",
              };
            }
          })
        );

        console.log("Converted files with originalPaths:", convertedFiles);

        // 폼 데이터 설정
        setFormData({
          collection: reference.collectionId,
          title: reference.title,
          keywords: reference.keywords || [],
          memo: reference.memo || "",
          files:
            convertedFiles.length > 0
              ? convertedFiles
              : [
                  {
                    id: Date.now().toString(),
                    type: "link",
                    content: "",
                  },
                ],
        });
      } catch (error) {
        console.error("Error fetching reference:", error);
        showToast("데이터를 불러오는데 실패했습니다.", "error");
        navigate("/references");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [referenceId, navigate, showToast]);

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
        console.error("Error fetching collections:", error);
        showToast("컬렉션 목록을 불러오는데 실패했습니다.", "error");
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const invalidLinks = formData.files.filter(
        (file) =>
          file.type === "link" &&
          file.content &&
          !(
            file.content.startsWith("http://") ||
            file.content.startsWith("https://")
          )
      );

      if (invalidLinks.length > 0) {
        showToast(
          "http:// 또는 https://로 시작하는 링크를 입력해 주세요.",
          "error"
        );
        return;
      }

      if (formData.files.some((file) => !file.content)) {
        showToast("모든 자료를 입력해 주세요.", "error");
        return;
      }

      if (!referenceId) {
        showToast("잘못된 접근입니다.", "error");
        return;
      }

      // 각 파일의 원본 경로 확인 로그
      console.log(
        "Files being submitted:",
        formData.files.map((file) => ({
          type: file.type,
          originalPath: file.originalPath,
          content:
            typeof file.content === "string"
              ? file.content.length > 30
                ? file.content.substring(0, 30) + "..."
                : file.content
              : "non-string content",
        }))
      );

      // API 호출 준비 - 파일 정보 점검
      // 원본 경로가 중요한 이슈가 있으므로 originalPath 확인
      const filesWithPathCheck = formData.files.map((file) => {
        // 링크와 이미지를 제외한 파일 타입에 대해 원본 경로가 없다면 경고
        if (
          !file.originalPath &&
          file.type !== "link" &&
          !file.content.startsWith("data:")
        ) {
          console.warn(
            `File of type ${file.type} is missing originalPath:`,
            file
          );
        }
        return file;
      });

      // 컬렉션 제목 가져오기
      const collectionTitle =
        collections.find((c) => c._id === formData.collection)?.title || "";

      // API 호출
      await updateReference(referenceId, {
        collectionId: formData.collection,
        collectionTitle: collectionTitle, // 여기에 컬렉션 제목 추가
        title: formData.title,
        keywords: formData.keywords,
        memo: formData.memo,
        files: filesWithPathCheck,
      });
    } catch (error) {
      console.error("Error updating reference:", error);
      showToast("레퍼런스 수정에 실패했습니다.", "error");
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-400">
          <div className="flex items-center gap-2">
            <h1 className="text-primary text-2xl font-semibold">
              레퍼런스 수정
            </h1>
            <span className="text-sm text-gray-500">* 필수 항목</span>
          </div>
          <button
            type="submit"
            form="reference-edit-form"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
            저장
          </button>
        </div>

        <form
          id="reference-edit-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="flex gap-4 items-start flex-wrap">
            {/* Collection Selection */}
            <div className="w-[244px]">
              <label className="block mb-2">
                <span className="text-black">
                  컬렉션 <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <CollectionDropdown
                  options={collections}
                  value={formData.collection}
                  onChange={(value) =>
                    setFormData({ ...formData, collection: value })
                  }
                  placeholder="저장할 컬렉션을 선택하세요."
                  disabled={isLoadingCollections}
                />
                {isLoadingCollections && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Title Input */}
            <div className="flex-1">
              <label className="block mb-2 relative">
                <span className="text-black">
                  제목 <span className="text-red-500">*</span>
                </span>
                <div className="text-right text-sm text-gray-500 mt-1 absolute right-0 top-0">
                  {formData.title.length}/20
                </div>
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
                className="w-full h-[56px] min-w-48 border border-gray-300 rounded-lg px-4 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Keywords Input */}
          <div>
            <label className="block mb-2">
              <span className="text-black">키워드</span>
            </label>
            <div className="border border-gray-300 bg-white rounded-lg px-4 py-2 min-h-[56px]">
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
            <label className="block mb-2 relative">
              <span className="text-black">메모</span>
              <div className="text-right text-sm text-gray-500 mt-1 absolute right-0 top-0">
                {formData.memo.length}/500
              </div>
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
          </div>

          {/* File Upload Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block">
                <span className="text-black">
                  자료 첨부 <span className="text-red-500">*</span>
                </span>
              </label>
              <span className="text-sm text-gray-500">
                최대 5개까지 추가 가능합니다.
              </span>
            </div>
            <div>
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
