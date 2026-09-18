import { useEffect, useState } from 'react';
import {
    Search,
    Eye,
    X,
    UserCheck,
    Ban,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';

const ITEMS_PER_PAGE = 10;

const activeOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
];

const orgTypeLabels = {
    university: 'University',
    apartment: 'Apartment',
};

const getErrorMessage = (error) => error?.data?.message || error?.message || 'Request failed';

export default function AdminOrganizations() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [editingOrg, setEditingOrg] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [viewingOrg, setViewingOrg] = useState(null);
    const [orgRequests, setOrgRequests] = useState([]);
    const [viewLoading, setViewLoading] = useState(false);
    const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
    const [permanentDeleteLoading, setPermanentDeleteLoading] = useState(false);

    const { addToast } = useToast();

    const loadOrganizations = async () => {
        try {
            setLoading(true);
            const filters = { role: 'organization' };
            if (activeFilter !== '') filters.is_active = activeFilter;
            if (search) filters.search = search;

            const data = await adminService.getCustomers(filters, currentPage, ITEMS_PER_PAGE);
            setOrganizations(data.results || data || []);
            setTotalItems(data.count || 0);
            setTotalPages(Math.max(1, Math.ceil((data.count || 0) / ITEMS_PER_PAGE)));
        } catch (err) {
            addToast('Failed to load organizations', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
            return;
        }
        loadOrganizations();
    }, [activeFilter, search, currentPage]);

    const handleActivate = async (id) => {
        try {
            await adminService.updateCustomer(id, { is_active: true });
            addToast('Organization activated', 'success');
            loadOrganizations();
        } catch (err) {
            addToast(err.data?.message || 'Failed to activate organization', 'error');
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await adminService.updateCustomer(id, { is_active: false });
            addToast('Organization deactivated', 'success');
            loadOrganizations();
        } catch (err) {
            addToast(err.data?.message || 'Failed to deactivate organization', 'error');
        }
    };

    const handleEdit = (org) => {
        setEditingOrg(org);
        setEditForm({
            name: org.name || '',
            phone: org.phone || '',
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingOrg) return;
        try {
            setEditLoading(true);
            await adminService.updateCustomer(editingOrg.id, editForm);
            addToast('Organization updated successfully', 'success');
            setEditingOrg(null);
            loadOrganizations();
        } catch (err) {
            addToast(err.data?.message || 'Failed to update organization', 'error');
        } finally {
            setEditLoading(false);
        }
    };

    const handleView = async (org) => {
        try {
            setViewLoading(true);
            setViewingOrg(org);
            const data = await adminService.getCustomerRequests(org.id);
            setOrgRequests(data.service_requests || data.requests || data || []);
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
            setViewingOrg(null);
        } finally {
            setViewLoading(false);
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

    const getActiveBadgeClass = (isActive) => (isActive ? 'admin-badge-active' : 'admin-badge-inactive');
    const getOrgType = (org) => orgTypeLabels[org.organization_type] || '-';

    const handlePermanentDelete = async () => {
        if (!permanentDeleteTarget) return;
        try {
            setPermanentDeleteLoading(true);
            await adminService.deleteCustomer(permanentDeleteTarget.id);
            addToast('Organization permanently deleted', 'success');
            setPermanentDeleteTarget(null);
            setViewingOrg(null);
            await loadOrganizations();
        } catch (err) {
            addToast(err.data?.detail || err.data?.message || err.message || 'Failed to delete organization', 'error');
        } finally {
            setPermanentDeleteLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Organizations</h1>
                    <p className="admin-page-subtitle">Universities and apartment properties using SafiLink</p>
                </div>
            </div>

            <div className="admin-filters-bar">
                <div className="admin-search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search organizations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="admin-filter-select"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                >
                    {activeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="admin-loading"><div className="spinner" /></div>
            ) : organizations.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-state-icon"><Search size={28} /></div>
                    <h3>No organizations found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Type</th>
                                    <th>Total Requests</th>
                                    <th>Status</th>
                                    <th>Date Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.map((org) => (
                                    <tr key={org.id}>
                                        <td className="admin-table-cell-primary">{org.name || 'N/A'}</td>
                                        <td className="admin-table-cell-muted">{org.email}</td>
                                        <td>{getOrgType(org)}</td>
                                        <td>{org.total_requests ?? 0}</td>
                                        <td>
                                            <span className={`admin-status-badge ${getActiveBadgeClass(org.is_active)}`}>
                                                {org.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="admin-table-cell-muted">{formatDate(org.date_joined || org.created_at)}</td>
                                        <td>
                                            <div className="admin-table-cell-actions">
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleView(org)} aria-label={`View ${org.name || org.email}`}>
                                                    <Eye size={14} /> View
                                                </button>
                                                {org.is_active ? (
                                                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleDeactivate(org.id)}>
                                                        <Ban size={14} /> Deactivate
                                                    </button>
                                                ) : (
                                                    <button className="admin-btn admin-btn-amber admin-btn-sm" onClick={() => handleActivate(org.id)}>
                                                        <UserCheck size={14} /> Activate
                                                    </button>
                                                )}
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleEdit(org)}>
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-danger admin-btn-sm"
                                                    onClick={() => setPermanentDeleteTarget(org)}
                                                    aria-label={`Delete ${org.name || org.email} permanently`}
                                                >
                                                    <Trash2 size={14} />
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

            {viewingOrg && (
                <div className="admin-modal-overlay" onClick={() => setViewingOrg(null)}>
                    <div className="admin-modal admin-modal-wide" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{viewingOrg.name || viewingOrg.email}</h3>
                            <button className="admin-modal-close" onClick={() => setViewingOrg(null)} aria-label="Close organization details">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            {viewLoading ? (
                                <div className="admin-loading"><div className="spinner" /></div>
                            ) : (
                                <div className="admin-detail-grid">
                                    <div><span>Email</span><strong>{viewingOrg.email || '-'}</strong></div>
                                    <div><span>Phone</span><strong>{viewingOrg.phone || '-'}</strong></div>
                                    <div><span>Type</span><strong>{getOrgType(viewingOrg)}</strong></div>
                                    <div><span>Status</span><strong>{viewingOrg.is_active ? 'Active' : 'Inactive'}</strong></div>
                                    <div><span>Date Joined</span><strong>{formatDate(viewingOrg.date_joined)}</strong></div>
                                    <div><span>Total Requests</span><strong>{orgRequests.length}</strong></div>
                                    <div className="admin-detail-full">
                                        <span>Recent Requests</span>
                                        {orgRequests.length === 0 ? (
                                            <strong>No service requests</strong>
                                        ) : (
                                            <div className="admin-request-list">
                                                {orgRequests.map((request) => (
                                                    <div key={request.id} className="admin-request-list-item">
                                                        <strong>{request.company_name || 'Company'}</strong>
                                                        <span>{request.service} · {request.property_type || 'Property'} · {formatDate(request.requested_date)} · {request.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                className="btn btn-danger"
                                style={{ marginRight: 'auto' }}
                                onClick={() => setPermanentDeleteTarget(viewingOrg)}
                            >
                                <Trash2 size={16} /> Delete Permanently
                            </button>
                            <button className="btn btn-secondary" onClick={() => setViewingOrg(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {editingOrg && (
                <div className="admin-modal-overlay" onClick={() => setEditingOrg(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Edit Organization</h3>
                            <button className="admin-modal-close" onClick={() => setEditingOrg(null)}>
                                <Edit size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="admin-modal-body">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Name</label>
                                    <input
                                        className="admin-form-input"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Phone</label>
                                    <input
                                        className="admin-form-input"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingOrg(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {permanentDeleteTarget && (
                <PermanentDeleteConfirm
                    org={permanentDeleteTarget}
                    loading={permanentDeleteLoading}
                    onCancel={() => setPermanentDeleteTarget(null)}
                    onConfirm={handlePermanentDelete}
                />
            )}
        </div>
    );
}

const PermanentDeleteConfirm = ({ org, loading, onCancel, onConfirm }) => {
    const [confirmText, setConfirmText] = useState('');
    const expected = org.email;
    const canConfirm = confirmText.trim() === expected;

    return (
        <div className="admin-modal-overlay" onClick={onCancel}>
            <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                <div className="admin-modal-header">
                    <h3>Delete Organization Permanently</h3>
                    <button className="admin-modal-close" onClick={onCancel} aria-label="Cancel deletion">
                        <X size={18} />
                    </button>
                </div>
                <div className="admin-modal-body">
                    <p className="admin-modal-message">
                        This <strong>permanently deletes</strong> <strong>{org.name || org.email}</strong> and their account.
                        Their reviews are removed; their past service requests are kept for the companies' records but
                        no longer linked to this organization. This cannot be undone.
                    </p>
                    <div className="admin-form-group" style={{ marginTop: '16px' }}>
                        <label className="admin-form-label">
                            Type <strong>{expected}</strong> to confirm
                        </label>
                        <input
                            className="admin-form-input"
                            value={confirmText}
                            onChange={(event) => setConfirmText(event.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={loading || !canConfirm}>
                        {loading ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                </div>
            </div>
        </div>
    );
};
