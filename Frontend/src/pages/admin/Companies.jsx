import { useEffect, useState } from 'react';
import {
    Search,
    CheckCircle,
    XCircle,
    X,
    Ban,
    UserCheck,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';
import '../../styles/admin.css';

const ITEMS_PER_PAGE = 10;

const SERVICE_OPTIONS = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'both', label: 'Both' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' },
];

const VERIFICATION_OPTIONS = [
    { value: 'unverified', label: 'Unverified' },
    { value: 'verified', label: 'Verified' },
];

const getInitialFilters = () => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return {
        status: params.get('status') || '',
        create: params.get('create') === 'true',
    };
};

const toList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const getErrorMessage = (error) => error?.data?.message || error?.message || 'Request failed';

const createEmptyForm = () => ({
    name: '',
    email: '',
    phone: '',
    description: '',
    location: '',
    services: '',
    specialties: '',
    verification_status: 'unverified',
    status: 'approved',
    is_active: true,
    owner_email: '',
    password: '',
});

const getStatusBadgeClass = (status) => {
    const map = {
        pending: 'admin-badge-pending',
        approved: 'admin-badge-approved',
        rejected: 'admin-badge-rejected',
        suspended: 'admin-badge-suspended',
    };
    return map[status] || 'admin-badge-pending';
};

const getActiveBadgeClass = (isActive) => isActive ? 'admin-badge-active' : 'admin-badge-inactive';

const getVerificationBadgeClass = (status) => status === 'verified'
    ? 'admin-badge-approved'
    : 'admin-badge-pending';

const renderServiceBadges = (services) => {
    const values = Array.isArray(services) ? services : services ? [services] : [];
    return (
        <div className="admin-table-cell-badges">
            {values.slice(0, 2).map((service, index) => (
                <span key={`${service}-${index}`} className="admin-status-badge admin-badge-organization admin-table-badge">
                    {service}
                </span>
            ))}
            {values.length > 2 && (
                <span className="admin-table-cell-muted">+{values.length - 2} more</span>
            )}
        </div>
    );
};

const CompanyForm = ({
    form,
    setForm,
    logo,
    setLogo,
    loading,
    submitLabel,
    showOwnerFields,
    onCancel,
    onSubmit,
}) => {
    const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    return (
        <form onSubmit={onSubmit}>
            <div className="admin-modal-body">
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label className="admin-form-label">Company Name</label>
                        <input
                            className="admin-form-input"
                            value={form.name}
                            onChange={(event) => updateField('name', event.target.value)}
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Email</label>
                        <input
                            className="admin-form-input"
                            type="email"
                            value={form.email}
                            onChange={(event) => updateField('email', event.target.value)}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Phone</label>
                        <input
                            className="admin-form-input"
                            value={form.phone}
                            onChange={(event) => updateField('phone', event.target.value)}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Location</label>
                        <input
                            className="admin-form-input"
                            value={form.location}
                            onChange={(event) => updateField('location', event.target.value)}
                        />
                    </div>
                    <div className="admin-form-group admin-form-group-full">
                        <label className="admin-form-label">Description</label>
                        <textarea
                            className="admin-form-textarea"
                            value={form.description}
                            onChange={(event) => updateField('description', event.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="admin-form-group admin-form-group-full">
                        <label className="admin-form-label">Services</label>
                        <div className="admin-checkbox-grid">
                            {SERVICE_OPTIONS.map((option) => (
                                <label key={option.value} className="admin-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={toList(form.services).includes(option.value)}
                                        onChange={(event) => {
                                            const current = toList(form.services);
                                            const next = event.target.checked
                                                ? [...current, option.value]
                                                : current.filter((value) => value !== option.value);
                                            updateField('services', next.join(', '));
                                        }}
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="admin-form-group admin-form-group-full">
                        <label className="admin-form-label">Specialties (comma separated)</label>
                        <textarea
                            className="admin-form-textarea"
                            value={form.specialties}
                            onChange={(event) => updateField('specialties', event.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Verification</label>
                        <select
                            className="admin-form-select"
                            value={form.verification_status}
                            onChange={(event) => updateField('verification_status', event.target.value)}
                        >
                            {VERIFICATION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Status</label>
                        <select
                            className="admin-form-select"
                            value={form.status}
                            onChange={(event) => updateField('status', event.target.value)}
                        >
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <label className="admin-checkbox-label admin-form-group-full">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(event) => updateField('is_active', event.target.checked)}
                        />
                        <span>Company is active and publicly visible when approved</span>
                    </label>
                    <div className="admin-form-group admin-form-group-full">
                        <label className="admin-form-label">Logo</label>
                        <input
                            className="admin-form-input"
                            type="file"
                            accept="image/*"
                            onChange={(event) => setLogo(event.target.files?.[0] || null)}
                        />
                        {logo && <span className="admin-file-name">{logo.name}</span>}
                    </div>
                    {showOwnerFields && (
                        <>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Owner Email</label>
                                <input
                                    className="admin-form-input"
                                    type="email"
                                    value={form.owner_email}
                                    onChange={(event) => updateField('owner_email', event.target.value)}
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Owner Password</label>
                                <input
                                    className="admin-form-input"
                                    type="password"
                                    value={form.password}
                                    onChange={(event) => updateField('password', event.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
};

export default function AdminCompanies() {
    const initialFilters = getInitialFilters();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilters.status);
    const [activeFilter, setActiveFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [viewingCompany, setViewingCompany] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);
    const [editForm, setEditForm] = useState(createEmptyForm());
    const [editLogo, setEditLogo] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
    const [permanentDeleteLoading, setPermanentDeleteLoading] = useState(false);
    const [creatingCompany, setCreatingCompany] = useState(initialFilters.create);
    const [createForm, setCreateForm] = useState(createEmptyForm());
    const [createLogo, setCreateLogo] = useState(null);
    const [createLoading, setCreateLoading] = useState(false);

    const { addToast } = useToast();

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (statusFilter) filters.status = statusFilter;
            if (activeFilter !== '') filters.is_active = activeFilter;
            if (search) filters.search = search;

            const data = await adminService.getCompanies(filters, currentPage, ITEMS_PER_PAGE);
            setCompanies(data.results || data || []);
            setTotalItems(data.count || 0);
            setTotalPages(Math.max(1, Math.ceil((data.count || 0) / ITEMS_PER_PAGE)));
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
            return;
        }
        loadCompanies();
    }, [statusFilter, activeFilter, search, currentPage]);

    const handleApprove = async (id) => {
        try {
            await adminService.approveCompany(id);
            addToast('Company approved successfully', 'success');
            await loadCompanies();
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            await adminService.rejectCompany(id);
            addToast('Company rejected', 'success');
            await loadCompanies();
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        }
    };

    const handleSuspend = async (id) => {
        try {
            await adminService.suspendCompany(id);
            addToast('Company suspended', 'success');
            await loadCompanies();
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        }
    };

    const handleReactivate = async (id) => {
        try {
            await adminService.reactivateCompany(id);
            addToast('Company reactivated', 'success');
            await loadCompanies();
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        }
    };

    const handleEdit = (company) => {
        setEditingCompany(company);
        setEditForm({
            ...createEmptyForm(),
            name: company.name || '',
            email: company.email || '',
            phone: company.phone || '',
            description: company.description || '',
            location: company.location || '',
            services: toList(company.services).join(', '),
            specialties: toList(company.specialties).join(', '),
            verification_status: company.verification_status || 'unverified',
            status: company.status || 'approved',
            is_active: company.is_active !== false,
        });
        setEditLogo(null);
    };

    const buildCompanyPayload = (form) => ({
        name: form.name,
        email: form.email,
        phone: form.phone,
        description: form.description,
        location: form.location,
        services: toList(form.services),
        specialties: toList(form.specialties),
        verification_status: form.verification_status,
        status: form.status,
        is_active: form.is_active,
    });

    const submitCreate = async (event) => {
        event.preventDefault();
        try {
            setCreateLoading(true);
            const payload = {
                ...buildCompanyPayload(createForm),
                owner_email: createForm.owner_email,
                password: createForm.password,
            };
            if (createLogo) {
                const formData = new FormData();
                Object.entries(payload).forEach(([key, value]) => formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value));
                formData.append('logo', createLogo);
                await adminService.createCompany(formData);
            } else {
                await adminService.createCompany(payload);
            }
            addToast('Company created successfully', 'success');
            setCreatingCompany(false);
            setCreateForm(createEmptyForm());
            setCreateLogo(null);
            await loadCompanies();
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    const submitEdit = async (event) => {
        event.preventDefault();
        if (!editingCompany) return;
        try {
            setEditLoading(true);
            const payload = buildCompanyPayload(editForm);
            if (editLogo) {
                const formData = new FormData();
                Object.entries(payload).forEach(([key, value]) => formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value));
                formData.append('logo', editLogo);
                await adminService.updateCompany(editingCompany.id, formData);
            } else {
                await adminService.updateCompany(editingCompany.id, payload);
            }
            addToast('Company updated successfully', 'success');
            setEditingCompany(null);
            await loadCompanies();
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleteLoading(true);
            await adminService.updateCompany(deleteTarget.id, { is_active: false });
            addToast('Company deactivated', 'success');
            setDeleteTarget(null);
            await loadCompanies();
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handlePermanentDelete = async () => {
        if (!permanentDeleteTarget) return;
        try {
            setPermanentDeleteLoading(true);
            await adminService.deleteCompany(permanentDeleteTarget.id);
            addToast('Company permanently deleted', 'success');
            setPermanentDeleteTarget(null);
            setViewingCompany(null);
            await loadCompanies();
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        } finally {
            setPermanentDeleteLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Companies</h1>
                    <p className="admin-page-subtitle">Manage and review registered companies</p>
                </div>
                <button className="btn btn-primary" onClick={() => setCreatingCompany(true)}>
                    <Plus size={16} /> Add Company
                </button>
            </div>

            <div className="admin-filters-bar">
                <div className="admin-search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
                <select
                    className="admin-filter-select"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value || 'all'} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <select
                    className="admin-filter-select"
                    value={activeFilter}
                    onChange={(event) => setActiveFilter(event.target.value)}
                >
                    <option value="">All Activity</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {loading ? (
                <div className="admin-loading"><div className="spinner" /></div>
            ) : companies.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-state-icon"><Eye size={28} /></div>
                    <h3>No companies found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Services</th>
                                    <th>Verification</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company) => (
                                    <tr key={company.id}>
                                        <td className="admin-table-cell-primary">{company.name}</td>
                                        <td>
                                            <div>{company.email || company.owner_email || company.owner?.email || '-'}</div>
                                            <div className="admin-table-cell-muted">{company.phone || '-'}</div>
                                        </td>
                                        <td>{company.location || '-'}</td>
                                        <td>{renderServiceBadges(company.services)}</td>
                                        <td>
                                            <span className={`admin-status-badge ${getVerificationBadgeClass(company.verification_status)}`}>
                                                {company.verification_status || 'unverified'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-status-stack">
                                                <span className={`admin-status-badge ${getStatusBadgeClass(company.status)}`}>
                                                    {company.status}
                                                </span>
                                                <span className={`admin-status-badge ${getActiveBadgeClass(company.is_active)}`}>
                                                    {company.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-table-cell-actions">
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setViewingCompany(company)} aria-label={`View ${company.name}`}>
                                                    <Eye size={14} />
                                                </button>
                                                {company.status === 'pending' && (
                                                    <>
                                                        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleApprove(company.id)}>
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleReject(company.id)}>
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {company.status === 'approved' && company.is_active && (
                                                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleSuspend(company.id)}>
                                                        <Ban size={14} /> Suspend
                                                    </button>
                                                )}
                                                {!company.is_active && company.status !== 'pending' && (
                                                    <button className="admin-btn admin-btn-amber admin-btn-sm" onClick={() => handleReactivate(company.id)}>
                                                        <UserCheck size={14} /> Reactivate
                                                    </button>
                                                )}
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleEdit(company)}>
                                                    <Edit size={14} />
                                                </button>
                                                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDeleteTarget(company)} aria-label={`Deactivate ${company.name}`}>
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
                            <span className="admin-pagination-info">{totalItems} total</span>
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                <button key={page} className={page === currentPage ? 'active' : ''} onClick={() => setCurrentPage(page)}>
                                    {page}
                                </button>
                            ))}
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {viewingCompany && (
                <div className="admin-modal-overlay" onClick={() => setViewingCompany(null)}>
                    <div className="admin-modal admin-modal-wide" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{viewingCompany.name}</h3>
                            <button className="admin-modal-close" onClick={() => setViewingCompany(null)} aria-label="Close company details">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-company-detail">
                                {viewingCompany.logo && <img className="admin-company-logo" src={viewingCompany.logo} alt={`${viewingCompany.name} logo`} />}
                                <div className="admin-detail-grid">
                                    <div><span>Email</span><strong>{viewingCompany.email || '-'}</strong></div>
                                    <div><span>Phone</span><strong>{viewingCompany.phone || '-'}</strong></div>
                                    <div><span>Location</span><strong>{viewingCompany.location || '-'}</strong></div>
                                    <div><span>Owner</span><strong>{viewingCompany.owner_name || viewingCompany.owner?.name || viewingCompany.owner_email || '-'}</strong></div>
                                    <div><span>Verification</span><strong>{viewingCompany.verification_status || 'unverified'}</strong></div>
                                    <div><span>Status</span><strong>{viewingCompany.status || '-'}</strong></div>
                                    <div><span>Active</span><strong>{viewingCompany.is_active ? 'Yes' : 'No'}</strong></div>
                                    <div><span>Services</span><strong>{toList(viewingCompany.services).join(', ') || '-'}</strong></div>
                                    <div className="admin-detail-full"><span>Specialties</span><strong>{toList(viewingCompany.specialties).join(', ') || '-'}</strong></div>
                                    <div className="admin-detail-full"><span>Description</span><strong>{viewingCompany.description || '-'}</strong></div>
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                className="btn btn-danger"
                                style={{ marginRight: 'auto' }}
                                onClick={() => setPermanentDeleteTarget(viewingCompany)}
                            >
                                <Trash2 size={16} /> Delete Permanently
                            </button>
                            <button className="btn btn-secondary" onClick={() => setViewingCompany(null)}>Close</button>
                            <button className="btn btn-primary" onClick={() => { setViewingCompany(null); handleEdit(viewingCompany); }}>
                                <Edit size={16} /> Edit Company
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingCompany && (
                <div className="admin-modal-overlay" onClick={() => setEditingCompany(null)}>
                    <div className="admin-modal admin-modal-wide" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Edit Company</h3>
                            <button className="admin-modal-close" onClick={() => setEditingCompany(null)} aria-label="Close edit company">
                                <X size={18} />
                            </button>
                        </div>
                        <CompanyForm
                            form={editForm}
                            setForm={setEditForm}
                            logo={editLogo}
                            setLogo={setEditLogo}
                            loading={editLoading}
                            submitLabel="Save Changes"
                            showOwnerFields={false}
                            onCancel={() => setEditingCompany(null)}
                            onSubmit={submitEdit}
                        />
                    </div>
                </div>
            )}

            {creatingCompany && (
                <div className="admin-modal-overlay" onClick={() => setCreatingCompany(false)}>
                    <div className="admin-modal admin-modal-wide" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Create Company</h3>
                            <button className="admin-modal-close" onClick={() => setCreatingCompany(false)} aria-label="Close create company">
                                <X size={18} />
                            </button>
                        </div>
                        <CompanyForm
                            form={createForm}
                            setForm={setCreateForm}
                            logo={createLogo}
                            setLogo={setCreateLogo}
                            loading={createLoading}
                            submitLabel="Create Company"
                            showOwnerFields
                            onCancel={() => setCreatingCompany(false)}
                            onSubmit={submitCreate}
                        />
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Deactivate Company</h3>
                            <button className="admin-modal-close" onClick={() => setDeleteTarget(null)} aria-label="Cancel deactivation">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p className="admin-modal-message">
                                Deactivate <strong>{deleteTarget.name}</strong>? The company will be removed from the public directory and can be reactivated later.
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                                {deleteLoading ? 'Deactivating...' : 'Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {permanentDeleteTarget && (
                <PermanentDeleteConfirm
                    company={permanentDeleteTarget}
                    loading={permanentDeleteLoading}
                    onCancel={() => setPermanentDeleteTarget(null)}
                    onConfirm={handlePermanentDelete}
                />
            )}
        </div>
    );
}

const PermanentDeleteConfirm = ({ company, loading, onCancel, onConfirm }) => {
    const [confirmText, setConfirmText] = useState('');
    const canConfirm = confirmText.trim() === company.name;

    return (
        <div className="admin-modal-overlay" onClick={onCancel}>
            <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                <div className="admin-modal-header">
                    <h3>Delete Company Permanently</h3>
                    <button className="admin-modal-close" onClick={onCancel} aria-label="Cancel deletion">
                        <X size={18} />
                    </button>
                </div>
                <div className="admin-modal-body">
                    <p className="admin-modal-message">
                        This <strong>permanently deletes</strong> <strong>{company.name}</strong> and all of its data —
                        service requests, reviews, gallery photos, and selected services. This cannot be undone.
                        The owner's login account is kept, but they will need to set up a new company profile.
                    </p>
                    <div className="admin-form-group" style={{ marginTop: '16px' }}>
                        <label className="admin-form-label">
                            Type <strong>{company.name}</strong> to confirm
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
