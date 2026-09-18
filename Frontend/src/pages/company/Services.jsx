import { useEffect, useState } from 'react';
import { Plus, Edit2, X, PlusCircle } from 'lucide-react';
import CompanyLayout from '../../layouts/CompanyLayout';
import Loading from '../../components/Loading';
import { useToast } from '../../components/Toast';
import { createService, getMyCompany, getServicesCatalog, updateMyServices } from '../../services/companyService';
import { formatService } from '../../utils/helpers';

const emptyNewService = { name: '', category: 'cleaning', description: '' };

export default function ManageServices() {
    const { addToast } = useToast();
    const [catalog, setCatalog] = useState([]);
    const [serviceItems, setServiceItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newService, setNewService] = useState(emptyNewService);
    const [creating, setCreating] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [catalogData, companyData] = await Promise.all([getServicesCatalog(), getMyCompany()]);
            setCatalog(Array.isArray(catalogData) ? catalogData : []);
            const items = Array.isArray(companyData?.service_items) ? companyData.service_items : [];
            setServiceItems(items);
            setSelectedIds([...new Set(items.map((s) => s.id).filter(Boolean))]);
        } catch (err) {
            addToast(err.message || 'Failed to load services', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openModal = () => {
        setError('');
        setShowCreateForm(false);
        setNewService(emptyNewService);
        setModalOpen(true);
    };

    const handleCreateService = async () => {
        if (!newService.name.trim()) {
            setError('Enter a name for the new service');
            return;
        }
        setCreating(true);
        setError('');
        try {
            await createService({
                name: newService.name.trim(),
                category: newService.category,
                description: newService.description.trim(),
            });
            addToast('Service created and added to your offerings', 'success');
            setNewService(emptyNewService);
            setShowCreateForm(false);
            await load();
        } catch (err) {
            setError(err.message || 'Failed to create service');
        } finally {
            setCreating(false);
        }
    };

    const toggleSelection = (serviceId) => {
        setSelectedIds((current) => (
            current.includes(serviceId)
                ? current.filter((id) => id !== serviceId)
                : [...current, serviceId]
        ));
    };

    const handleSave = async () => {
        if (selectedIds.length === 0) {
            setError('Select at least one service');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await updateMyServices(selectedIds);
            addToast('Services updated', 'success');
            setModalOpen(false);
            await load();
        } catch (err) {
            setError(err.message || 'Failed to update services');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CompanyLayout><Loading /></CompanyLayout>;

    const groupedCatalog = catalog.reduce((groups, service) => {
        const category = service.category || 'other';
        groups[category] = groups[category] || [];
        groups[category].push(service);
        return groups;
    }, {});

    return (
        <CompanyLayout>
            <div className="cp-section-heading">
                <h2 style={{ fontSize: '15px', color: 'var(--cp-text-secondary)' }}>
                    {serviceItems.length} service{serviceItems.length === 1 ? '' : 's'} offered
                </h2>
                <button className="cp-btn cp-btn-primary" onClick={openModal}>
                    <Plus size={15} /> Add Service
                </button>
            </div>

            {serviceItems.length > 0 ? (
                <div className="cp-service-grid">
                    {serviceItems.map((service) => (
                        <div key={service.id} className="cp-service-card">
                            <div className="cp-service-card-head">
                                <span className={`cp-service-dot ${service.category}`} />
                                <span className="cp-service-name">{service.name}</span>
                                <button
                                    className="cp-icon-btn"
                                    style={{ width: '30px', height: '30px' }}
                                    aria-label={`Edit ${service.name}`}
                                    onClick={openModal}
                                >
                                    <Edit2 size={13} />
                                </button>
                            </div>
                            <span className="cp-service-category">{formatService(service.category)}</span>
                            {service.description && <p className="cp-service-desc">{service.description}</p>}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="cp-card cp-empty">
                    No services selected yet. Click "Add Service" to choose from the catalog.
                </div>
            )}

            {modalOpen && (
                <div className="cp-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cp-modal-head">
                            <h3>Choose your services</h3>
                            <button className="cp-modal-close" onClick={() => setModalOpen(false)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="cp-modal-body">
                            {error && <div className="cp-alert cp-alert-error">{error}</div>}
                            {Object.entries(groupedCatalog).map(([category, services]) => (
                                <div key={category}>
                                    <h4 className="cp-heading" style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', textTransform: 'capitalize' }}>
                                        {formatService(category)}
                                    </h4>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {services.map((service) => {
                                            const selected = selectedIds.includes(service.id);
                                            return (
                                                <label
                                                    key={service.id}
                                                    className={`cp-service-option ${selected ? 'selected' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => toggleSelection(service.id)}
                                                    />
                                                    <div>
                                                        <div className="cp-service-option-title">{service.name}</div>
                                                        {service.description && (
                                                            <div className="cp-service-option-desc">{service.description}</div>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div>
                                {!showCreateForm ? (
                                    <button
                                        type="button"
                                        className="cp-text-btn"
                                        onClick={() => setShowCreateForm(true)}
                                    >
                                        <PlusCircle size={14} /> Can't find your service? Create a new one
                                    </button>
                                ) : (
                                    <div className="cp-card" style={{ padding: '16px' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>New service</h4>
                                        <div className="cp-form-group">
                                            <label className="cp-form-label">Service name</label>
                                            <input
                                                className="cp-form-input"
                                                value={newService.name}
                                                onChange={(e) => setNewService((cur) => ({ ...cur, name: e.target.value }))}
                                                placeholder="e.g. Carpet Steam Cleaning"
                                            />
                                        </div>
                                        <div className="cp-form-group">
                                            <label className="cp-form-label">Category</label>
                                            <select
                                                className="cp-form-input"
                                                value={newService.category}
                                                onChange={(e) => setNewService((cur) => ({ ...cur, category: e.target.value }))}
                                            >
                                                <option value="cleaning">Cleaning</option>
                                                <option value="decoration">Decoration</option>
                                            </select>
                                        </div>
                                        <div className="cp-form-group">
                                            <label className="cp-form-label">Description (optional)</label>
                                            <textarea
                                                className="cp-form-textarea"
                                                style={{ minHeight: '70px' }}
                                                value={newService.description}
                                                onChange={(e) => setNewService((cur) => ({ ...cur, description: e.target.value }))}
                                            />
                                        </div>
                                        <div className="cp-form-actions">
                                            <button
                                                type="button"
                                                className="cp-btn cp-btn-ghost"
                                                onClick={() => { setShowCreateForm(false); setNewService(emptyNewService); }}
                                                disabled={creating}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="cp-btn cp-btn-primary"
                                                onClick={handleCreateService}
                                                disabled={creating}
                                            >
                                                {creating ? 'Creating...' : 'Create & add to my services'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="cp-modal-footer">
                            <button className="cp-btn cp-btn-ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
                                Cancel
                            </button>
                            <button className="cp-btn cp-btn-primary" onClick={handleSave} disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Services'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CompanyLayout>
    );
}
