import { useEffect, useState } from 'react';
import {
    Search,
    EyeOff,
    Trash2,
    Eye,
    Star,
    ChevronLeft,
    ChevronRight,
    Award,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';

const ITEMS_PER_PAGE = 10;

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'published', label: 'Published' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'removed', label: 'Removed' },
];

const statusLabels = {
    pending: 'Pending',
    published: 'Published',
    rejected: 'Rejected',
    removed: 'Removed',
    visible: 'Published',
    hidden: 'Rejected',
};

const getStatusBadgeClass = (status) => {
    const map = {
        pending: 'admin-badge-hidden',
        published: 'admin-badge-visible',
        rejected: 'admin-badge-removed',
        removed: 'admin-badge-removed',
        visible: 'admin-badge-visible',
        hidden: 'admin-badge-removed',
    };
    return map[status] || 'admin-badge-hidden';
};

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
            addToast('Failed to load companies', 'error');
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

    const runAction = async (id, action, successMessage) => {
        try {
            setActionLoading(id);
            await action(id);
            addToast(successMessage, 'success');
            await loadReviews();
        } catch (err) {
            addToast(err.message || 'Failed to update review', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = (id) => runAction(id, adminService.approveReview, 'Review published');
    const handleReject = (id) => runAction(id, adminService.rejectReview, 'Review rejected');
    const handleUnpublish = (id) => runAction(id, adminService.unpublishReview, 'Review unpublished');
    const handleFeature = (id) => runAction(id, adminService.toggleFeaturedReview, 'Review featured');
    const handleUnfeature = (id) => runAction(id, adminService.toggleFeaturedReview, 'Review unfeatured');
    const handleRemove = (id) => runAction(id, adminService.removeReview, 'Review removed');
    const handleRestore = (id) => runAction(id, adminService.restoreReview, 'Review restored');

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
                    <p className="admin-page-subtitle">Moderate customer reviews and manage featured testimonials</p>
                </div>
            </div>

            <div className="admin-filters-bar">
                <div className="admin-search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
                <select className="admin-filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <select className="admin-filter-select" value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)}>
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
                                    <th>Featured</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review.id}>
                                        <td className="admin-table-cell-primary">{review.company_name || review.company?.name || '-'}</td>
                                        <td>{review.customer_name || review.customer?.name || 'N/A'}</td>
                                        <td><StarRating rating={review.rating || 0} /></td>
                                        <td className="admin-table-cell-muted" style={{ maxWidth: '260px' }}>
                                            {truncate(review.comment || review.text || '')}
                                        </td>
                                        <td>
                                            <span className={`admin-status-badge ${getStatusBadgeClass(review.status)}`}>
                                                {statusLabels[review.status] || review.status}
                                            </span>
                                        </td>
                                        <td>
                                            {review.is_featured ? (
                                                <span className="admin-badge-visible"><Award size={13} /> Featured</span>
                                            ) : (
                                                <span className="admin-badge-hidden">Not featured</span>
                                            )}
                                        </td>
                                        <td className="admin-table-cell-muted">{formatDate(review.created_at || review.date)}</td>
                                        <td>
                                            <div className="admin-table-cell-actions">
                                                {review.status === 'pending' && (
                                                    <>
                                                        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleApprove(review.id)} disabled={actionLoading === review.id}>Approve</button>
                                                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleReject(review.id)} disabled={actionLoading === review.id}>Reject</button>
                                                    </>
                                                )}
                                                {review.status === 'published' && (
                                                    <>
                                                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleUnpublish(review.id)} disabled={actionLoading === review.id}><EyeOff size={14} /> Unpublish</button>
                                                        {review.is_featured ? (
                                                            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleUnfeature(review.id)} disabled={actionLoading === review.id}>Unfeature</button>
                                                        ) : (
                                                            <button className="admin-btn admin-btn-amber admin-btn-sm" onClick={() => handleFeature(review.id)} disabled={actionLoading === review.id}>Feature</button>
                                                        )}
                                                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleRemove(review.id)} disabled={actionLoading === review.id}><Trash2 size={14} /> Remove</button>
                                                    </>
                                                )}
                                                {review.status === 'rejected' && (
                                                    <>
                                                        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleApprove(review.id)} disabled={actionLoading === review.id}>Approve</button>
                                                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleRemove(review.id)} disabled={actionLoading === review.id}><Trash2 size={14} /> Remove</button>
                                                    </>
                                                )}
                                                {review.status === 'removed' && (
                                                    <button className="admin-btn admin-btn-amber admin-btn-sm" onClick={() => handleRestore(review.id)} disabled={actionLoading === review.id}><Eye size={14} /> Restore</button>
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
                            <span className="admin-pagination-info">{totalItems} total</span>
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}><ChevronLeft size={16} /></button>
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                <button key={page} className={page === currentPage ? 'active' : ''} onClick={() => setCurrentPage(page)}>{page}</button>
                            ))}
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}><ChevronRight size={16} /></button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
