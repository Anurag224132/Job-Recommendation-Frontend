// src/components/common/Pagination.js
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            currentPage === 0
              ? 'text-gray-500 cursor-not-allowed opacity-50'
              : 'text-emerald-400 hover:bg-emerald-500/10 active:scale-95'
          }`}
        >
          &larr; Prev
        </button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 ${
                currentPage === page
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                  : 'text-gray-300 hover:bg-white/10 active:scale-90'
              }`}
            >
              {page + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            currentPage === totalPages - 1
              ? 'text-gray-500 cursor-not-allowed opacity-50'
              : 'text-cyan-400 hover:bg-cyan-500/10 active:scale-95'
          }`}
        >
          Next &rarr;
        </button>
      </div>
      
      <div className="text-xs text-gray-400 font-medium">
        Page <span className="text-emerald-400">{currentPage + 1}</span> of <span className="text-cyan-400">{totalPages}</span>
      </div>
    </div>
  );
};

export default Pagination;
