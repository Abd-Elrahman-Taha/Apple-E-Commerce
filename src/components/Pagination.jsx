import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages.push(i);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            pages.push('...');
        }
    }

    const visiblePages = pages.filter((p, i, arr) => p !== '...' || arr[i - 1] !== '...');

    return (
        <div className="apple-pagination">
            <button 
                className="pagination-btn prev" 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div className="pagination-numbers">
                {visiblePages.map((p, i) => (
                    p === '...' ? (
                        <span key={`dots-${i}`} className="pagination-dots">...</span>
                    ) : (
                        <button
                            key={p}
                            className={`pagination-number ${currentPage === p ? 'active' : ''}`}
                            onClick={() => onPageChange(p)}
                            aria-label={`Page ${p}`}
                            aria-current={currentPage === p ? 'page' : undefined}
                        >
                            {p}
                        </button>
                    )
                ))}
            </div>

            <button 
                className="pagination-btn next" 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <i className="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    );
};

export default Pagination;
