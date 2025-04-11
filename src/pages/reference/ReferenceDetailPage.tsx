import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import { referenceService } from "@/services/reference";
import { useSetRecoilState, useRecoilValue } from "recoil";
import Alert from "@/components/common/Alert";
import LinkPreview from "@/components/reference/LinkPreview";
import {
  Users,
  Loader,
  Link as LinkIcon,
  FileText,
  File,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import ImagePreviewModal from "@/components/reference/ImagePreviewModal";
import { Reference, ReferenceFile } from "@/types/reference";
import { alertState } from "@/store/collection";
import api from "@/utils/api";

export default function ReferenceDetailPage() {
  const { referenceId } = useParams<{ referenceId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setAlert = useSetRecoilState(alertState);
  const alert = useRecoilValue(alertState);
  const [isLoading, setIsLoading] = useState(true);
  const [reference, setReference] = useState<Reference | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name?: string;
    downloadUrl?: string;
  } | null>(null);

  useEffect(() => {
    const fetchReference = async () => {
      if (!referenceId) return;

      try {
        setIsLoading(true);
        const data = await referenceService.getReference(referenceId);

        // 파일의 모든 URL을 transformUrl로 처리 (단, "file" 타입은 원본 URL 사용)
        const transformedFiles = await Promise.all(
          data.files.map(async (file) => {
            if (file.type === "image" && file.previewURLs) {
              const previewURLs = await Promise.all(
                file.previewURLs.map((url) =>
                  referenceService["transformUrl"](url)
                )
              );
              return { ...file, previewURLs };
            } else if (file.type === "pdf" && file.previewURL) {
              const previewURL = await referenceService["transformUrl"](
                file.previewURL
              );
              return { ...file, previewURL };
            } else if (file.type === "file" && file.path) {
              // 파일 타입은 transformUrl 호출 없이 원본 URL 유지
              return file;
            } else {
              return file;
            }
          })
        );

        setReference({ ...data, files: transformedFiles });

        // 추가 정보 병합
        const referenceList = await referenceService.getReferenceList({
          sortBy: "latest",
          search: "",
          collection: "all",
          filterBy: "all",
          view: "card",
          mode: "home",
        });

        const findReference = referenceList.data.find(
          (i) => i._id === referenceId
        );

        setReference((prev) => (prev ? { ...prev, ...findReference } : null));
      } catch (error) {
        console.error("Error fetching reference:", error);
        showToast("레퍼런스를 불러오는데 실패했습니다.", "error");
        navigate("/references");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReference();
  }, [referenceId, navigate, showToast]);

  const handleEdit = () => {
    navigate(`/references/${referenceId}/edit`);
  };

  const handleDelete = () => {
    if (!reference) return;

    const text = reference.shared
      ? `${
          reference.collectionTitle || "선택한"
        } 컬렉션의 다른 사용자와 공유 중인 ${
          reference.title
        }를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`
      : `${reference.title}를 삭제하시겠습니까? \n삭제 후 복구할 수 없습니다.`;

    setAlert({
      ids: [reference._id],
      massage: text,
      isVisible: true,
      type: "reference",
      title: reference.title,
    });
  };

  const handleFileDownload = async (fileUrl: string, filename?: string) => {
    try {
      // API에서 지정한 파일 다운로드 엔드포인트 사용
      const response = await api.get(`/api/references/download`, {
        params: { fileUrl },
        responseType: "blob", // 중요: 바이너리 데이터를 blob으로 받음
      });

      // 파일 저장 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // 파일명 설정
      const downloadFilename = filename
        ? decodeURIComponent(filename)
        : fileUrl.split("/").pop() || "download.pdf";

      link.setAttribute("download", downloadFilename);
      document.body.appendChild(link);
      link.click();

      // 메모리 정리
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast("파일 다운로드가 완료되었습니다.", "success");
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      showToast("파일 다운로드에 실패했습니다.", "error");
    }
  };

  const renderFilePreview = (file: ReferenceFile) => {
    switch (file.type) {
      case "link":
        return (
          <div className="flex flex-col gap-2 bg-white rounded-lg p-4 border border-gray-100 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <LinkIcon className="w-4 h-4" />
              <span>링크</span>
            </div>
            <div className="flex flex-col">
              <a
                href={file.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between group px-4 py-3 bg-gray-100 rounded-lg hover:border hover:border-primary transition-colors"
              >
                <span className="flex-1 truncate text-sm">{file.path}</span>
                <span className="text-sm text-gray-500 group-hover:text-primary">
                  링크 이동
                </span>
              </a>
              <LinkPreview url={file.path} />
            </div>
          </div>
        );

      case "image":
        return (
          <div className="flex flex-col gap-2 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <ImageIcon className="w-4 h-4" />
              <span>이미지</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {file.previewURLs?.map((url, index) => {
                const imageName =
                  file.filenames && file.filenames[index]
                    ? decodeURIComponent(file.filenames[index])
                    : `이미지 ${index + 1}`;
                const originalUrl =
                  typeof file.path === "string"
                    ? file.path
                    : Array.isArray(file.path)
                    ? file.path[index]
                    : "";
                return (
                  <div key={index} className="flex flex-col gap-1">
                    <div
                      className="relative aspect-square cursor-pointer group"
                      onClick={() =>
                        setSelectedImage({
                          url,
                          name: imageName,
                          downloadUrl: originalUrl,
                        })
                      }
                    >
                      <img
                        src={url}
                        alt={imageName}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate max-w-[70%]">
                        {imageName}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileDownload(
                            originalUrl,
                            file.filenames?.[index]
                          );
                        }}
                        className="p-1 rounded-md hover:bg-gray-100"
                        title="다운로드"
                      >
                        <Download className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "pdf":
        return (
          <div className="flex flex-col gap-2 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex gap-3 items-center">
                {file.previewURL && (
                  <div
                    className="cursor-pointer flex-shrink-0 w-20 h-20 border border-gray-200 rounded-md overflow-hidden"
                    onClick={() =>
                      setSelectedImage({
                        url: file.previewURL || "",
                        name: file.filename
                          ? decodeURIComponent(file.filename)
                          : "PDF 미리보기",
                        downloadUrl: file.path,
                      })
                    }
                  >
                    <img
                      src={file.previewURL}
                      alt="PDF 미리보기"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col">
                  <p className="text-sm font-medium truncate mb-1">
                    {file.filename
                      ? decodeURIComponent(file.filename)
                      : file.path.split("/").pop()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {file.size || ""}
                    </span>
                    <button
                      onClick={() =>
                        handleFileDownload(file.path, file.filename)
                      }
                      className="ml-auto flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md hover:border-primary text-xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>다운로드</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "file":
        return (
          <div className="flex flex-col gap-2 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <File className="w-4 h-4" />
                <span>파일</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center">
                <File className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 flex flex-col">
                <p className="text-sm font-medium truncate mb-1">
                  {file.filename
                    ? decodeURIComponent(file.filename)
                    : file.path.split("/").pop()}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {file.size || ""}
                  </span>
                  <button
                    onClick={() => handleFileDownload(file.path, file.filename)}
                    className="ml-auto flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md hover:border-primary text-xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>다운로드</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reference) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {alert.isVisible && <Alert message={alert.massage} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="flex items-center gap-2 text-base text-gray-500 mb-2">
              {reference.shared && (
                <Users className="w-5 h-5 stroke-gray-700" />
              )}
              <span>{reference.collectionTitle || "불러오는 중..."}</span>
            </h2>
            <h1 className="text-2xl font-bold text-primary">
              {reference.title}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-2">
              {!reference.viewer && (
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 text-red-500 border border-gray-200 bg-white rounded-full hover:bg-red-50 transition-colors"
                >
                  삭제
                </button>
              )}
              {!reference.viewer && (
                <button
                  onClick={handleEdit}
                  className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                  수정
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              생성일시{" "}
              {reference.createdAt
                ? new Date(reference.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "-"}
            </p>
          </div>
        </div>
        <div className="h-px bg-gray-200 mb-4" />
        {reference.keywords && reference.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {reference.keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-[10px] py-1 h-[27px] bg-[#0a306c] text-white text-sm rounded"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
        {reference.memo && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">메모</h3>
            <div className="p-4 bg-white rounded-lg border border-gray-100">
              <p className="text-gray-700 whitespace-pre-wrap">
                {reference.memo}
              </p>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">첨부 자료</h3>
          <div className="space-y-4">
            {reference.files.map((file, index) => (
              <div key={index}>{renderFilePreview(file)}</div>
            ))}
          </div>
        </div>
      </div>
      <ImagePreviewModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ""}
        imageName={selectedImage?.name}
        downloadUrl={selectedImage?.downloadUrl}
      />
    </div>
  );
}
