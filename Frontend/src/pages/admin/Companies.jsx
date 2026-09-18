import { useEffect, useState } from 'react';
import {
    Search,
    Edit,
    Trash2,
    Eye,
    X,
    Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';
import { formatService } from '../../utils/helpers';
import '../../styles/admin.css';

const SERVICE_OPTIONS = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'both', label: 'Both' },
];

const VERIFICATION_OPTIONS = [
    { value: 'unverified', label: 'Unverified' },
    { value: 'verified', label: 'Verified' },
];

const toList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
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

const getCategory = (services) => {
    const list = toList(services);
    if (list.includes('both')) return 'Both';
    if (list.length) return formatService(list[0]);
    return '-';
};

const matchesCategory = (services, filter) => {
    if (filter === 'all') return true;
    const list = toList(services);
    if (filter === 'both') return list.includes('both');
    return list.includes(filter) && !list.includes('both');
};

const CompanyEditForm = ({ form, setForm, logo, setLogo, loading, onCancel, onSubmit }) => {
    const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    return (
        <form onSubmit={onSubmit}>
            <div className="admin-modal-body">
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label className="admin-form-label">Company Name</label>
                        <input className="admin-form-input" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Email</label>
                        <input className="admin-form-input" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Phone</label>
                        <input className="admin-form-input" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Location</label>
                        <input className="admin-form-input" value={form.location} onChange={(e) => updateField('location', e.target.value)} />
                    </div>
                    <div className="admin-form-group admin-form-group-full">
                        <label className="admin-form-label">Description</label>
                        <textarea className="admin-form-textarea" value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} />
                    </div>
                    <div className="admin-form-group admin-form-group-full">
                        <label className="admin-form-label">Services</label>
                        <div className="admin-checkbox-grid">
                            {SERVICE_OPTIONS.map((option) => (
                                <label key={option.value} className="admin-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={toList(form.services).includes(option.value)}
                                        onChange={(e) => {
                                            const current = toList(form.services);
                                            const next = e.target.checked
                                                ? [...current, option.value]
                                                : current.filter((v) => v !== option.value);
                                            updateField('services', next.join(', '));
                                        }}
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Verification</label>
                        <select className="admin-form-select" value={form.verification_status} onChange={(e) => updateField('verification_status', e.target.value)}>
                            {VERIFICATION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-form-group admin-form-group-full">
                        <label className="admin-form-label">Logo</label>
                        <input className="admin-form-input" type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
                        {logo && <span className="admin-file-name">{logo.name}</span>}
                    </div>
                </div>
            </div>
            <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
        </form>
    );
};

export default function AdminCompanies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [viewingCompany, setViewingCompany] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);
    const [editForm, setEditForm] = useState(createEmptyForm());
    const [editLogo, setEditLogo] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
    const [permanentDeleteLoading, setPermanentDeleteLoading] = useState(false);

    const { addToast } = useToast();

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (search) filters.search = search;
            const data = await adminService.getCompanies(filters, 1, 100);
            setCompanies(data.results || data || []);
        } catch (error) {
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(loadCompanies, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const counts = {
        all: companies.length,
        cleaning: companies.filter((c) => matchesCategory(c.services, 'cleaning')).length,
        decoration: companies.filter((c) => matchesCategory(c.services, 'decoration')).length,
        both: companies.filter((c) => matchesCategory(c.services, 'both')).length,
    };

    const filteredCompanies = companies.filter((c) => matchesCategory(c.services, categoryFilter));

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
            verification_status: company.verification_status || 'unverified',
            status: company.status || 'approved',
            is_active: company.is_active !== false,
        });
        setEditLogo(null);
    };

    const submitEdit = async (event) => {
        event.preventDefault();
        if (!editingCompany) return;
        try {
            setEditLoading(true);
            const payload = {
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                description: editForm.description,
                location: editForm.location,
                services: toList(editForm.services),
                verification_status: editForm.verification_status,
            };
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

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">All Companies</h1>
                    <p className="admin-page-subtitle">Every company registered on SafiLink</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/admin/companies/new')}>
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
            </div>

            <div className="admin-filter-chips">
                {['all', 'cleaning', 'decoration', 'both'].map((key) => (
                    <button
                        key={key}
                        type="button"
                        className={`admin-filter-chip ${categoryFilter === key ? 'active' : ''}`}
                        onClick={() => setCategoryFilter(key)}
                    >
                        {key === 'all' ? 'All' : formatService(key)}
                        <span className="chip-count">{counts[key]}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="admin-loading"><div className="spinner" /></div>
            ) : filteredCompanies.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-state-icon"><Eye size={28} /></div>
                    <h3>No companies found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.map((company) => (
                                <tr key={company.id}>
                                    <td className="admin-table-cell-primary">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className="admin-pending-logo" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                                                {company.logo ? (
                                                    <img src={company.logo} alt={`${company.name} logo`} />
                                                ) : (company.name || 'C').charAt(0).toUpperCase()}
                                            </span>
                                            {company.name}
                                        </div>
                                    </td>
                                    <td>{getCategory(company.services)}</td>
                                    <td>{company.location || '-'}</td>
                                    <td className="admin-table-cell-muted">{formatDate(company.created_at)}</td>
                                    <td>
                                        <span className={`admin-status-badge ${getStatusBadgeClass(company.status)}`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setViewingCompany(company)} aria-label={`View ${company.name}`}>
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                                    <div><span>Requests Received</span><strong>{viewingCompany.requests_received_count ?? 0}</strong></div>
                                    <div><span>Joined</span><strong>{formatDate(viewingCompany.created_at)}</strong></div>
                                    <div><span>Services</span><strong>{toList(viewingCompany.services).join(', ') || '-'}</strong></div>
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
                        <CompanyEditForm
                            form={editForm}
                            setForm={setEditForm}
                            logo={editLogo}
                            setLogo={setEditLogo}
                            loading={editLoading}
                            onCancel={() => setEditingCompany(null)}
                            onSubmit={submitEdit}
                        />
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
