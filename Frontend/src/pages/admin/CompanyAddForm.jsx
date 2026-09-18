import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import CompanyForm from '../../components/admin/CompanyForm';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';
import '../../styles/admin.css';

export default function CompanyAddForm() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (payload) => {
        setLoading(true);
        setError('');
        try {
            if (logo) {
                const formData = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value ?? '');
                });
                formData.append('logo', logo);
                await adminService.createCompany(formData);
            } else {
                await adminService.createCompany(payload);
            }
            addToast('Company created and approved', 'success');
            navigate('/admin/companies');
        } catch (err) {
            setError(err.data?.message || err.message || 'Failed to create company');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Add Company</h1>
                    <p className="admin-page-subtitle">Manually register a company on its behalf</p>
                </div>
            </div>

            <div className="admin-notice-banner">
                <CheckCircle2 size={16} />
                <span>
                    Companies added here go live immediately as <strong>Approved</strong> — you're vouching for
                    this company directly, so it skips the pending-review queue.
                </span>
            </div>

            {error && <div className="admin-form-error" style={{ marginBottom: '16px' }}>{error}</div>}

            <div className="admin-card" style={{ maxWidth: '820px' }}>
                <CompanyForm
                    logo={logo}
                    setLogo={setLogo}
                    loading={loading}
                    submitLabel="Create Company"
                    showOwnerFields
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/companies')}
                    onError={setError}
                />
            </div>
        </div>
    );
}
