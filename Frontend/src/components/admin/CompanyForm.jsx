import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { normalizeServices } from '../../utils/helpers';

export const SERVICE_OPTIONS = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'decoration', label: 'Decoration' },
];

const STATUS_OPTIONS = [
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' },
];

export const VERIFICATION_OPTIONS = [
    { value: 'unverified', label: 'Unverified' },
    { value: 'verified', label: 'Verified' },
];

export const toList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

export const getErrorMessage = (error) => error?.data?.message || error?.message || 'Request failed';

const initialForm = () => ({
    name: '',
    email: '',
    phone: '',
    description: '',
    location: '',
    address: '',
    services: [],
    status: 'approved',
    verification_status: 'unverified',
    specialties: '',
    owner_id: '',
    owner_email: '',
    password: '',
});

const CompanyForm = ({
    company = null,
    logo,
    setLogo,
    loading = false,
    submitLabel = 'Save',
    showOwnerFields = false,
    statusFieldVisible = false,
    showSpecialties = false,
    onSubmit,
    onCancel,
    onError,
}) => {
    const [form, setForm] = useState(initialForm());
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (company) {
            setForm({
                name: company.name || '',
                email: company.email || '',
                phone: company.phone || '',
                description: company.description || '',
                location: company.location || '',
                address: company.address || '',
                services: toList(company.services),
                status: company.status || 'approved',
                verification_status: company.verification_status || 'unverified',
                specialties: toList(company.specialties).join(', '),
                owner_id: company.owner?.id || company.owner_id || '',
                owner_email: company.owner?.email || company.owner_email || '',
                password: '',
            });
        }
    }, [company]);

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((current) => ({ ...current, [field]: undefined }));
        }
    };

    const handleServices = (service) => {
        const current = toList(form.services);
        const next = current.includes(service)
            ? current.filter((s) => s !== service)
            : [...current, service];
        updateField('services', next);
    };

    const validate = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Company name is required';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = 'Enter a valid email';
        }
        if (showOwnerFields && !form.owner_email) {
            errors.owner_email = 'Owner email is required';
        }
        if (showOwnerFields && !form.password) {
            errors.password = 'Owner password is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                description: form.description.trim(),
                location: form.location.trim(),
                address: form.address.trim(),
                services: normalizeServices(form.services),
                verification_status: form.verification_status,
                specialties: toList(form.specialties),
            };
            if (statusFieldVisible) payload.status = form.status;
            if (showOwnerFields) {
                payload.owner_id = form.owner_id ? Number(form.owner_id) : undefined;
                payload.owner_email = form.owner_email.trim() || undefined;
                payload.password = form.password || undefined;
            }
            await onSubmit(payload);
        } catch (error) {
            if (onError) onError(getErrorMessage(error));
        }
    };

    const hasLogoPreview = logo
        ? URL.createObjectURL(logo)
        : company?.logo
          ? company.logo
          : null;

    return (
        <form onSubmit={handleSubmit} className="admin-company-form">
            <div className="admin-form-grid">
                <div className="admin-form-group">
                    <label className="admin-form-label">Company Name</label>
                    <input
                        className={`admin-form-input ${formErrors.name ? 'admin-input-error' : ''}`}
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="e.g. CleanPro Ltd"
                        required
                    />
                    {formErrors.name && <span className="admin-form-error">{formErrors.name}</span>}
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Email</label>
                    <input
                        className={`admin-form-input ${formErrors.email ? 'admin-input-error' : ''}`}
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="company@example.com"
                    />
                    {formErrors.email && <span className="admin-form-error">{formErrors.email}</span>}
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Phone Number</label>
                    <input
                        className="admin-form-input"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+255 7 123 4567"
                    />
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Location</label>
                    <input
                        className="admin-form-input"
                        value={form.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        placeholder="e.g. Dar es Salaam"
                    />
                </div>

                <div className="admin-form-group admin-form-group-full">
                    <label className="admin-form-label">Address</label>
                    <input
                        className="admin-form-input"
                        value={form.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="Full business address"
                    />
                </div>

                <div className="admin-form-group admin-form-group-full">
                    <label className="admin-form-label">Description</label>
                    <textarea
                        className="admin-form-textarea"
                        value={form.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={3}
                        placeholder="Brief description of the company..."
                    />
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Services</label>
                    <div className="admin-service-checkboxes">
                        {SERVICE_OPTIONS.map((option) => (
                            <label key={option.value} className="admin-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={form.services.includes(option.value)}
                                    onChange={() => handleServices(option.value)}
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {showSpecialties && (
                    <div className="admin-form-group">
                        <label className="admin-form-label">Specialties</label>
                        <textarea
                            className="admin-form-textarea"
                            value={form.specialties}
                            onChange={(e) => updateField('specialties', e.target.value)}
                            rows={2}
                            placeholder="Comma separated specialties"
                        />
                    </div>
                )}
            </div>

            <div className="admin-form-section">
                <div className="admin-form-group">
                    <label className="admin-form-label">Company Logo</label>
                    <div className="admin-logo-upload" onClick={() => document.getElementById('logo-input').click()}>
                        {hasLogoPreview ? (
                            <img src={hasLogoPreview} alt="Logo preview" className="admin-logo-preview" />
                        ) : (
                            <div className="admin-logo-placeholder">
                                <Upload size={24} />
                                <span>Click to upload</span>
                            </div>
                        )}
                        <input
                            id="logo-input"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => setLogo(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>

                {showOwnerFields && (
                    <>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Owner Email</label>
                            <input
                                className={`admin-form-input ${formErrors.owner_email ? 'admin-input-error' : ''}`}
                                type="email"
                                value={form.owner_email}
                                onChange={(e) => updateField('owner_email', e.target.value)}
                                placeholder="owner@example.com"
                            />
                            {formErrors.owner_email && <span className="admin-form-error">{formErrors.owner_email}</span>}
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Owner Password</label>
                            <input
                                className={`admin-form-input ${formErrors.password ? 'admin-input-error' : ''}`}
                                type="password"
                                value={form.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                placeholder="Temporary password"
                            />
                            {formErrors.password && <span className="admin-form-error">{formErrors.password}</span>}
                        </div>
                    </>
                )}

                {statusFieldVisible && (
                    <div className="admin-form-group">
                        <label className="admin-form-label">Status</label>
                        <select
                            className="admin-form-select"
                            value={form.status}
                            onChange={(e) => updateField('status', e.target.value)}
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
};

export default CompanyForm;
