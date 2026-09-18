import { useEffect, useState } from 'react';
import { Plus, Trash2, Copy, ShieldCheck, Sparkles } from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';
import { formatService } from '../../utils/helpers';
import '../../styles/admin.css';

const emptyService = { name: '', category: 'cleaning', description: '' };
const emptyAdmin = { name: '', email: '' };

export default function AdminSettings() {
    const { addToast } = useToast();

    const [services, setServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [newService, setNewService] = useState(emptyService);
    const [serviceSubmitting, setServiceSubmitting] = useState(false);
    const [serviceError, setServiceError] = useState('');

    const [admins, setAdmins] = useState([]);
    const [adminsLoading, setAdminsLoading] = useState(true);
    const [newAdmin, setNewAdmin] = useState(emptyAdmin);
    const [adminSubmitting, setAdminSubmitting] = useState(false);
    const [adminError, setAdminError] = useState('');
    const [tempPassword, setTempPassword] = useState(null);

    const loadServices = async () => {
        try {
            setServicesLoading(true);
            const data = await adminService.getAllServices();
            setServices(Array.isArray(data) ? data : []);
        } catch (err) {
            addToast('Failed to load service catalog', 'error');
        } finally {
            setServicesLoading(false);
        }
    };

    const loadAdmins = async () => {
        try {
            setAdminsLoading(true);
            const data = await adminService.getAdmins();
            setAdmins(Array.isArray(data) ? data : []);
        } catch (err) {
            addToast('Failed to load admin accounts', 'error');
        } finally {
            setAdminsLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
        loadAdmins();
    }, []);

    const handleCreateService = async (e) => {
        e.preventDefault();
        if (!newService.name.trim()) {
            setServiceError('Service name is required');
            return;
        }
        setServiceSubmitting(true);
        setServiceError('');
        try {
            await adminService.createService({
                name: newService.name.trim(),
                category: newService.category,
                description: newService.description.trim(),
            });
            addToast('Service added to the catalog', 'success');
            setNewService(emptyService);
            await loadServices();
        } catch (err) {
            setServiceError(err.data?.name?.[0] || err.data?.message || err.message || 'Failed to add service');
        } finally {
            setServiceSubmitting(false);
        }
    };

    const handleDeleteService = async (service) => {
        if (!window.confirm(`Remove "${service.name}" from the catalog?`)) return;
        try {
            await adminService.deleteService(service.id);
            addToast('Service removed', 'success');
            setServices((current) => current.filter((s) => s.id !== service.id));
        } catch (err) {
            addToast(err.data?.message || err.message || 'Failed to remove service', 'error');
        }
    };

    const handleInviteAdmin = async (e) => {
        e.preventDefault();
        if (!newAdmin.name.trim() || !newAdmin.email.trim()) {
            setAdminError('Name and email are required');
            return;
        }
        setAdminSubmitting(true);
        setAdminError('');
        try {
            const result = await adminService.inviteAdmin({
                name: newAdmin.name.trim(),
                email: newAdmin.email.trim(),
            });
            setTempPassword(result);
            setNewAdmin(emptyAdmin);
            await loadAdmins();
        } catch (err) {
            setAdminError(err.data?.email?.[0] || err.data?.message || err.message || 'Failed to invite admin');
        } finally {
            setAdminSubmitting(false);
        }
    };

    const cleaningServices = services.filter((s) => s.category === 'cleaning');
    const decorationServices = services.filter((s) => s.category === 'decoration');

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Platform Settings</h1>
                    <p className="admin-page-subtitle">Manage the service catalog and admin access</p>
                </div>
            </div>

            <div className="admin-settings-grid">
                {/* ===== Service Catalog ===== */}
                <div className="admin-card">
                    <div className="admin-settings-section-title">Service Catalog</div>
                    <div className="admin-settings-section-desc">
                        {cleaningServices.length} cleaning · {decorationServices.length} decoration sub-services
                    </div>

                    {servicesLoading ? (
                        <div className="admin-loading"><div className="spinner" /></div>
                    ) : (
                        <div className="admin-catalog-list">
                            {services.length === 0 ? (
                                <div className="admin-empty-state" style={{ padding: '16px 0' }}>
                                    <p>No services in the catalog yet.</p>
                                </div>
                            ) : services.map((service) => (
                                <div key={service.id} className="admin-catalog-item">
                                    <span className={`admin-catalog-item-dot ${service.category}`} />
                                    <span className="admin-catalog-item-name">{service.name}</span>
                                    <span className="admin-catalog-item-count">
                                        {formatService(service.category)} · {service.companies_count ?? 0} companies
                                    </span>
                                    <button
                                        className="admin-icon-button"
                                        aria-label={`Remove ${service.name}`}
                                        onClick={() => handleDeleteService(service)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleCreateService}>
                        {serviceError && <div className="admin-form-error" style={{ marginBottom: '10px' }}>{serviceError}</div>}
                        <div className="admin-form-grid">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Service name</label>
                                <input
                                    className="admin-form-input"
                                    value={newService.name}
                                    onChange={(e) => setNewService((cur) => ({ ...cur, name: e.target.value }))}
                                    placeholder="e.g. Carpet Steam Cleaning"
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Category</label>
                                <select
                                    className="admin-form-select"
                                    value={newService.category}
                                    onChange={(e) => setNewService((cur) => ({ ...cur, category: e.target.value }))}
                                >
                                    <option value="cleaning">Cleaning</option>
                                    <option value="decoration">Decoration</option>
                                </select>
                            </div>
                            <div className="admin-form-group admin-form-group-full">
                                <label className="admin-form-label">Description (optional)</label>
                                <textarea
                                    className="admin-form-textarea"
                                    rows={2}
                                    value={newService.description}
                                    onChange={(e) => setNewService((cur) => ({ ...cur, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={serviceSubmitting}>
                            <Plus size={15} /> {serviceSubmitting ? 'Adding...' : 'Add Sub-Service'}
                        </button>
                    </form>
                </div>

                {/* ===== Admin Accounts ===== */}
                <div className="admin-card">
                    <div className="admin-settings-section-title">Admin Accounts</div>
                    <div className="admin-settings-section-desc">
                        Invite-only — new admins are never created through public registration.
                    </div>

                    {adminsLoading ? (
                        <div className="admin-loading"><div className="spinner" /></div>
                    ) : (
                        <div className="admin-admins-list">
                            {admins.map((admin) => (
                                <div key={admin.id} className="admin-admin-item">
                                    <ShieldCheck size={15} color={admin.is_superuser ? '#d97706' : '#0f7a6e'} />
                                    <div style={{ flex: 1 }}>
                                        <div className="admin-admin-item-name">{admin.name || admin.email}</div>
                                        <div className="admin-admin-item-email">
                                            {admin.email} · {admin.is_superuser ? 'Superuser' : 'Staff'} · Joined {formatDate(admin.date_joined)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleInviteAdmin}>
                        {adminError && <div className="admin-form-error" style={{ marginBottom: '10px' }}>{adminError}</div>}
                        <div className="admin-form-grid">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Name</label>
                                <input
                                    className="admin-form-input"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin((cur) => ({ ...cur, name: e.target.value }))}
                                    placeholder="Full name"
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Email</label>
                                <input
                                    className="admin-form-input"
                                    type="email"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin((cur) => ({ ...cur, email: e.target.value }))}
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={adminSubmitting}>
                            <Sparkles size={15} /> {adminSubmitting ? 'Inviting...' : 'Invite Admin'}
                        </button>
                    </form>

                    {tempPassword && (
                        <div className="admin-temp-password-box">
                            <strong>{tempPassword.name}</strong> ({tempPassword.email}) can sign in at{' '}
                            <code>/admin/login</code> with this one-time temporary password — share it with them now,
                            it won't be shown again:
                            <div className="admin-temp-password-value">
                                <span>{tempPassword.temporary_password}</span>
                                <button
                                    type="button"
                                    className="admin-icon-button"
                                    aria-label="Copy password"
                                    onClick={() => {
                                        navigator.clipboard?.writeText(tempPassword.temporary_password);
                                        addToast('Copied to clipboard', 'success');
                                    }}
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
