import { useEffect, useState } from 'react';
import {
    Search,
    Eye,
    Edit,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import StatusBadge from '../../components/StatusBadge';
import adminService from '../../services/adminService';

const ITEMS_PER_PAGE = 10;

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
];

const serviceOptions = [
    { value: '', label: 'All Services' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'both', label: 'Both' },
];

const propertyOptions = [
    { value: '', label: 'All Property Types' },
    { value: 'university', label: 'University' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'hostel', label: 'Hostel' },
];

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [propertyFilter, setPropertyFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [viewingRequest, setViewingRequest] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [editRequest, setEditRequest] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const [editResponseNote, setEditResponseNote] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const { addToast } = useToast();

    const loadRequests = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (statusFilter) filters.status = statusFilter;
            if (serviceFilter) filters.service = serviceFilter;
            if (propertyFilter) filters.property_type = propertyFilter;
            if (search) filters.search = search;

            const data = await adminService.getRequests(filters, currentPage, ITEMS_PER_PAGE);
            setRequests(data.results || data || []);
            setTotalItems(data.count || 0);
            setTotalPages(Math.max(1, Math.ceil((data.count || 0) / ITEMS_PER_PAGE)));
        } catch (err) {
            addToast('Failed to load requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
            return;
        }
        loadRequests();
    }, [statusFilter, serviceFilter, propertyFilter, search, currentPage]);

    const handleView = async (id) => {
        try {
            setViewLoading(true);
            const data = await adminService.getRequest(id);
            setViewingRequest(data);
        } catch (err) {
            addToast('Failed to load request details', 'error');
        } finally {
            setViewLoading(false);
        }
    };

    const handleEditStatus = (request) => {
        setEditRequest(request);
        setEditStatus(request.status || 'pending');
        setEditResponseNote(request.response_note || '');
    };

    const handleEditStatusSubmit = async (e) => {
        e.preventDefault();
        if (!editRequest) return;
        try {
            setEditLoading(true);
            await adminService.updateRequest(editRequest.id, {
                status: editStatus,
                response_note: editResponseNote,
            });
            addToast('Request status updated', 'success');
            setEditRequest(null);
            loadRequests();
        } catch (err) {
            addToast(err.data?.message || 'Failed to update request', 'error');
        } finally {
            setEditLoading(false);
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

    const getCustomerName = (req) => {
        if (req.customer_name) return req.customer_name;
        if (req.customer?.name) return req.customer.name;
        if (req.customer?.email) return req.customer.email;
        if (req.organization_name) return req.organization_name;
        if (req.organization?.name) return req.organization.name;
        if (req.organization?.email) return req.organization.email;
        return 'N/A';
    };

    const getCompanyName = (req) => {
        if (req.company_name) return req.company_name;
        if (req.company?.name) return req.company.name;
        return '-';
    };

    const getService = (req) => {
        if (req.service) return req.service;
        if (req.service_type) return req.service_type;
        return '-';
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Service Requests</h1>
                    <p className="admin-page-subtitle">Review and manage service requests</p>
                </div>
            </div>

            <div className="admin-filters-bar">
                <div className="admin-search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search requests..."
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
                    value={serviceFilter}
                    onChange={(event) => setServiceFilter(event.target.value)}
                >
                    {serviceOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select
                    className="admin-filter-select"
                    value={propertyFilter}
                    onChange={(event) => setPropertyFilter(event.target.value)}
                >
                    {propertyOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

            </div>

            {loading ? (
                <div className="admin-loading"><div className="spinner" /></div>
            ) : requests.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-state-icon"><Search size={28} /></div>
                    <h3>No requests found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Company</th>
                                    <th>Service</th>
                                    <th>Property</th>
                                    <th>Status</th>
                                    <th>Requested</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.id}>
                                        <td className="admin-table-cell-primary">{getCustomerName(req)}</td>
                                        <td>{getCompanyName(req)}</td>
                                        <td>{getService(req)}</td>
                                        <td>{req.property_type || '-'}</td>
                                        <td>
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="admin-table-cell-muted">{formatDate(req.requested_date)}</td>
                                        <td>
                                            <div className="admin-table-cell-actions">
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleView(req.id)}>
                                                    <Eye size={14} />
                                                </button>
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleEditStatus(req)}>
                                                    <Edit size={14} />
                                                </button>
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

            {/* View Details Modal */}
            {viewingRequest && (
                <div className="admin-modal-overlay" onClick={() => setViewingRequest(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Request Details</h3>
                            <button className="admin-modal-close" onClick={() => setViewingRequest(null)}>
                                <Eye size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            {viewLoading ? (
                                <div className="admin-loading"><div className="spinner" /></div>
                            ) : (
                                <div className="admin-detail-grid">
                                    <div><span>Customer</span><strong>{getCustomerName(viewingRequest)}</strong></div>
                                    <div><span>Company</span><strong>{getCompanyName(viewingRequest)}</strong></div>
                                    <div><span>Service</span><strong>{getService(viewingRequest)}</strong></div>
                                    <div><span>Property</span><strong>{viewingRequest.property_type || '-'}</strong></div>
                                    <div><span>Status</span><strong><StatusBadge status={viewingRequest.status} /></strong></div>
                                    <div><span>Requested Date</span><strong>{formatDate(viewingRequest.requested_date)}</strong></div>
                                    <div><span>Location</span><strong>{viewingRequest.location || '-'}</strong></div>
                                    <div><span>Created</span><strong>{formatDate(viewingRequest.created_at)}</strong></div>
                                    <div className="admin-detail-full"><span>Description</span><strong>{viewingRequest.description || '-'}</strong></div>
                                    <div className="admin-detail-full"><span>Response Note</span><strong>{viewingRequest.response_note || '-'}</strong></div>
                                </div>
                            )}
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setViewingRequest(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {editRequest && (
                <div className="admin-modal-overlay" onClick={() => setEditRequest(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Update Request Status</h3>
                            <button className="admin-modal-close" onClick={() => setEditRequest(null)}>
                                <Edit size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleEditStatusSubmit}>
                            <div className="admin-modal-body">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Status</label>
                                    <select
                                        className="admin-form-select"
                                        value={editStatus}
                                        onChange={(event) => setEditStatus(event.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Response Note</label>
                                    <textarea
                                        className="admin-form-textarea"
                                        value={editResponseNote}
                                        onChange={(event) => setEditResponseNote(event.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditRequest(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                                    {editLoading ? 'Saving...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}