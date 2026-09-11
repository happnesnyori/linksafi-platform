import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminPagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
    if (totalPages <= 1 && !totalItems) return null;

    const items = totalItems ? `${totalItems} total` : '';

    const getPages = () => {
        const pages = [];
        const total = Math.min(totalPages, 7);
        let start = Math.max(1, currentPage - 3);
        let end = start + total - 1;
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - total + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="admin-pagination">
            {items && <span className="admin-pagination-info">{items}</span>}
            <button
                className="admin-pagination-btn"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Previous page"
            >
                <ChevronLeft size={16} />
            </button>
            {getPages().map((page) => (
                <button
                    key={page}
                    className={`admin-pagination-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}
            <button
                className="admin-pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Next page"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default AdminPagination;
