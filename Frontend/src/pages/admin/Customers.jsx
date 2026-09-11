import { useEffect, useState } from 'react';
import {
    Search,
    Eye,
    X,
    UserCheck,
    Ban,
    Edit,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';

const ITEMS_PER_PAGE = 10;

const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'organization', label: 'Organization' },
    { value: 'company', label: 'Company' },
    { value: 'admin', label: 'Admin' },
];

const activeOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
];

const getErrorMessage = (error) => error?.data?.message || error?.message || 'Request failed';

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [viewingCustomer, setViewingCustomer] = useState(null);
    const [customerRequests, setCustomerRequests] = useState([]);
    const [viewLoading, setViewLoading] = useState(false);

    const { addToast } = useToast();

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (roleFilter) filters.role = roleFilter;
            if (activeFilter !== '') filters.is_active = activeFilter;
            if (search) filters.search = search;

            const data = await adminService.getCustomers(filters, currentPage, ITEMS_PER_PAGE);
            setCustomers(data.results || data || []);
            setTotalItems(data.count || 0);
            setTotalPages(Math.max(1, Math.ceil((data.count || 0) / ITEMS_PER_PAGE)));
        } catch (err) {
            addToast('Failed to load customers', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
            return;
        }
        loadCustomers();
    }, [roleFilter, activeFilter, search, currentPage]);

    const handleActivate = async (id) => {
        try {
            await adminService.updateCustomer(id, { is_active: true });
            addToast('Customer activated', 'success');
            loadCustomers();
        } catch (err) {
            addToast(err.data?.message || 'Failed to activate customer', 'error');
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await adminService.updateCustomer(id, { is_active: false });
            addToast('Customer deactivated', 'success');
            loadCustomers();
        } catch (err) {
            addToast(err.data?.message || 'Failed to deactivate customer', 'error');
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setEditForm({
            name: customer.name || '',
            phone: customer.phone || '',
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingCustomer) return;
        try {
            setEditLoading(true);
            await adminService.updateCustomer(editingCustomer.id, editForm);
            addToast('Customer updated successfully', 'success');
            setEditingCustomer(null);
            loadCustomers();
        } catch (err) {
            addToast(err.data?.message || 'Failed to update customer', 'error');
        } finally {
            setEditLoading(false);
        }
    };

    const handleView = async (customer) => {
        try {
            setViewLoading(true);
            setViewingCustomer(customer);
            const data = await adminService.getCustomerRequests(customer.id);
            setCustomerRequests(data.service_requests || data.requests || data || []);
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
            setViewingCustomer(null);
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

    const getRoleBadgeClass = (role) => {
        const map = {
            organization: 'admin-badge-organization',
            company: 'admin-badge-company',
            admin: 'admin-badge-suspended',
        };
        return map[role] || 'admin-badge-organization';
    };

    const getCustomerRole = (customer) => customer.is_staff || customer.is_superuser
        ? 'admin'
        : customer.role || 'user';

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Customers</h1>
                    <p className="admin-page-subtitle">Manage platform users and their access</p>
                </div>
            </div>

            <div className="admin-filters-bar">
                <div className="admin-search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="admin-filter-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
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
            ) : customers.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-state-icon"><Search size={28} /></div>
                    <h3>No customers found</h3>
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
                                    <th>Role</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Date Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="admin-table-cell-primary">{customer.name || 'N/A'}</td>
                                        <td className="admin-table-cell-muted">{customer.email}</td>
                                        <td>
                                            <span className={`admin-status-badge ${getRoleBadgeClass(getCustomerRole(customer))}`}>
                                                {getCustomerRole(customer)}
                                            </span>
                                        </td>
                                        <td>{customer.phone || '-'}</td>
                                        <td>
                                            <span className={`admin-status-badge ${getActiveBadgeClass(customer.is_active)}`}>
                                                {customer.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="admin-table-cell-muted">{formatDate(customer.date_joined || customer.created_at)}</td>
                                        <td>
                                            <div className="admin-table-cell-actions">
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleView(customer)} aria-label={`View ${customer.name || customer.email}`}>
                                                    <Eye size={14} /> View
                                                </button>
                                                {customer.is_active ? (
                                                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleDeactivate(customer.id)}>
                                                        <Ban size={14} /> Deactivate
                                                    </button>
                                                ) : (
                                                    <button className="admin-btn admin-btn-amber admin-btn-sm" onClick={() => handleActivate(customer.id)}>
                                                        <UserCheck size={14} /> Activate
                                                    </button>
                                                )}
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleEdit(customer)}>
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

            {viewingCustomer && (
                <div className="admin-modal-overlay" onClick={() => setViewingCustomer(null)}>
                    <div className="admin-modal admin-modal-wide" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{viewingCustomer.name || viewingCustomer.email}</h3>
                            <button className="admin-modal-close" onClick={() => setViewingCustomer(null)} aria-label="Close customer details">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            {viewLoading ? (
                                <div className="admin-loading"><div className="spinner" /></div>
                            ) : (
                                <div className="admin-detail-grid">
                                    <div><span>Email</span><strong>{viewingCustomer.email || '-'}</strong></div>
                                    <div><span>Phone</span><strong>{viewingCustomer.phone || '-'}</strong></div>
                                    <div><span>Role</span><strong>{getCustomerRole(viewingCustomer)}</strong></div>
                                    <div><span>Status</span><strong>{viewingCustomer.is_active ? 'Active' : 'Inactive'}</strong></div>
                                    <div><span>Date Joined</span><strong>{formatDate(viewingCustomer.date_joined)}</strong></div>
                                    <div><span>Service Requests</span><strong>{customerRequests.length}</strong></div>
                                    <div className="admin-detail-full">
                                        <span>Recent Requests</span>
                                        {customerRequests.length === 0 ? (
                                            <strong>No service requests</strong>
                                        ) : (
                                            <div className="admin-request-list">
                                                {customerRequests.map((request) => (
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
                            <button className="btn btn-secondary" onClick={() => setViewingCustomer(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingCustomer && (
                <div className="admin-modal-overlay" onClick={() => setEditingCustomer(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Edit Customer</h3>
                            <button className="admin-modal-close" onClick={() => setEditingCustomer(null)}>
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
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingCustomer(null)}>
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
        </div>
    );
}