// src/components/collection/Pagination.tsx
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPage: number;
  setPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPage,
  setPage,
}) => {
  const pageRange = 10;
  const [start, setStart] = useState(1);
  const noPrev = start === 1;
  const noNext = start + pageRange - 1 >= totalPage;

  useEffect(() => {
    if (currentPage >= start + pageRange) {
      setStart((prev) => prev + pageRange);
    } else if (currentPage < start) {
      setStart((prev) => Math.max(1, prev - pageRange));
    }
  }, [currentPage, start, pageRange]);

  return (
    <div className="flex w-full items-center justify-center gap-3.5 py-10">
      <button
        disabled={noPrev}
        className="disabled:cursor-not-allowed"
        onClick={() => !noPrev && setPage(start - 1)}
      >
        <ChevronLeft className="w-6 h-6 stroke-gray-500" />
      </button>

      <div className="flex gap-4">
        {[...Array(pageRange)].map((_, i) => {
          const pageNumber = start + i;
          return (
            pageNumber <= totalPage && (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={` text-sm font-normal ${
                  currentPage === pageNumber
                    ? "text-white w-5 h-5 bg-primary rounded-full"
                    : "text-gray-500"
                }`}
              >
                {pageNumber}
              </button>
            )
          );
        })}
      </div>

      <button
        disabled={noNext}
        className="disabled:cursor-not-allowed"
        onClick={() => !noNext && setPage(start + pageRange)}
      >
        <ChevronRight className="w-6 h-6 stroke-gray-500" />
      </button>
    </div>
  );
};

export default Pagination;
