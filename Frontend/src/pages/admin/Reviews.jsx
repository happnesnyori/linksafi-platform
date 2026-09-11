import { useEffect, useState } from 'react';
import {
    Search,
    EyeOff,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Star,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';

const ITEMS_PER_PAGE = 10;

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'visible', label: 'Visible' },
    { value: 'hidden', label: 'Hidden' },
    { value: 'removed', label: 'Removed' },
];

const StarRating = ({ rating }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {stars.map((star) => (
                <Star
                    key={star}
                    size={14}
                    fill={star <= rating ? '#f59e0b' : 'none'}
                    color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                />
            ))}
            <span style={{ marginLeft: '4px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {rating}
            </span>
        </div>
    );
};

const getStatusBadgeClass = (status) => {
    const map = {
        visible: 'admin-badge-visible',
        hidden: 'admin-badge-hidden',
        removed: 'admin-badge-removed',
    };
    return map[status] || 'admin-badge-visible';
};

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [companies, setCompanies] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);

    const { addToast } = useToast();

    const loadReviews = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (statusFilter) filters.status = statusFilter;
            if (companyFilter) filters.company_id = companyFilter;
            if (search) filters.search = search;

            const data = await adminService.getReviews(filters, currentPage, ITEMS_PER_PAGE);
            setReviews(data.results || data || []);
            setTotalItems(data.count || 0);
            setTotalPages(Math.max(1, Math.ceil((data.count || 0) / ITEMS_PER_PAGE)));
        } catch (err) {
            addToast('Failed to load reviews', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadCompanies = async () => {
        try {
            const data = await adminService.getAllCompanies();
            setCompanies(data);
        } catch (err) {
            // silent
        }
    };

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
            return;
        }
        loadReviews();
    }, [statusFilter, companyFilter, search, currentPage]);

    useEffect(() => {
        loadCompanies();
    }, []);

    const handleHide = async (id) => {
        try {
            setActionLoading(id);
            await adminService.hideReview(id);
            addToast('Review hidden', 'success');
            loadReviews();
        } catch (err) {
            addToast(err.data?.message || 'Failed to hide review', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (id) => {
        try {
            setActionLoading(id);
            await adminService.removeReview(id);
            addToast('Review removed', 'success');
            loadReviews();
        } catch (err) {
            addToast(err.data?.message || 'Failed to remove review', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestore = async (id) => {
        try {
            setActionLoading(id);
            await adminService.restoreReview(id);
            addToast('Review restored', 'success');
            loadReviews();
        } catch (err) {
            addToast(err.data?.message || 'Failed to restore review', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const truncate = (text, max = 80) => {
        if (!text) return '-';
        return text.length > max ? text.slice(0, max) + '...' : text;
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Reviews</h1>
                    <p className="admin-page-subtitle">Moderate and manage customer reviews</p>
                </div>
            </div>

            <div className="admin-filters-bar">
                <div className="admin-search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="admin-filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select
                    className="admin-filter-select"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                >
                    <option value="">All Companies</option>
                    {companies.map((company) => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="admin-loading"><div className="spinner" /></div>
            ) : reviews.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-state-icon"><Star size={28} /></div>
                    <h3>No reviews found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Customer</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review.id}>
                                        <td className="admin-table-cell-primary">{review.company_name || review.company?.name || '-'}</td>
                                        <td>{review.customer_name || review.customer?.name || 'N/A'}</td>
                                        <td>
                                            <StarRating rating={review.rating || 0} />
                                        </td>
                                        <td className="admin-table-cell-muted" style={{ maxWidth: '260px' }}>
                                            {truncate(review.comment || review.text || '')}
                                        </td>
                                        <td>
                                            <span className={`admin-status-badge ${getStatusBadgeClass(review.status)}`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="admin-table-cell-muted">{formatDate(review.created_at || review.date)}</td>
                                        <td>
                                            <div className="admin-table-cell-actions">
                                                {review.status === 'visible' && (
                                                    <button
                                                        className="admin-btn admin-btn-ghost admin-btn-sm"
                                                        onClick={() => handleHide(review.id)}
                                                        disabled={actionLoading === review.id}
                                                    >
                                                        <EyeOff size={14} /> Hide
                                                    </button>
                                                )}
                                                {review.status === 'hidden' && (
                                                    <button
                                                        className="admin-btn admin-btn-amber admin-btn-sm"
                                                        onClick={() => handleRestore(review.id)}
                                                        disabled={actionLoading === review.id}
                                                    >
                                                        <Eye size={14} /> Restore
                                                    </button>
                                                )}
                                                {(review.status === 'visible' || review.status === 'hidden') && (
                                                    <button
                                                        className="admin-btn admin-btn-danger admin-btn-sm"
                                                        onClick={() => handleRemove(review.id)}
                                                        disabled={actionLoading === review.id}
                                                    >
                                                        <Trash2 size={14} /> Remove
                                                    </button>
                                                )}
                                                {review.status === 'removed' && (
                                                    <button
                                                        className="admin-btn admin-btn-amber admin-btn-sm"
                                                        onClick={() => handleRestore(review.id)}
                                                        disabled={actionLoading === review.id}
                                                    >
                                                        <Eye size={14} /> Restore
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <span className="admin-pagination-info">
                                {totalItems} total
                            </span>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={page === currentPage ? 'active' : ''}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}