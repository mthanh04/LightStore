import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Build page numbers array with ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnBase =
    'w-9 h-9 flex items-center justify-center rounded-full text-[14px] font-[600] transition-all duration-200 cursor-pointer select-none';

  return (
    <div
      className="flex items-center justify-center gap-1 py-2"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} border border-[#E5E5E5] text-[#525252] hover:border-[#D946EF] hover:text-[#D946EF] disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {/* Pages */}
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-[#A3A3A3]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`${btnBase} ${
              p === currentPage
                ? 'bg-[#D946EF] text-white shadow-medium'
                : 'border border-[#E5E5E5] text-[#525252] hover:border-[#D946EF] hover:text-[#D946EF]'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} border border-[#E5E5E5] text-[#525252] hover:border-[#D946EF] hover:text-[#D946EF] disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
