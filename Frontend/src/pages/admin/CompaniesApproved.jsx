import { useEffect, useState } from 'react';
import { Ban, UserCheck, Search } from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';
import { formatService } from '../../utils/helpers';
import '../../styles/admin.css';

const toList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

export default function CompaniesApproved() {
    const { addToast } = useToast();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const load = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCompanies({ status: 'approved', search }, 1, 100);
            setCompanies(data.results || data || []);
        } catch (err) {
            addToast('Failed to load approved companies', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(load, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleToggle = async (company) => {
        const suspending = company.is_active;
        setActionLoading(company.id);
        const previous = companies;
        // Optimistic update.
        setCompanies((current) => current.map((c) => (
            c.id === company.id ? { ...c, is_active: !suspending } : c
        )));
        try {
            if (suspending) {
                await adminService.suspendCompany(company.id);
                addToast(`${company.name} suspended`, 'success');
            } else {
                await adminService.reactivateCompany(company.id);
                addToast(`${company.name} reinstated`, 'success');
            }
        } catch (err) {
            setCompanies(previous);
            addToast(err.data?.message || err.message || 'Failed to update company', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Approved Companies</h1>
                    <p className="admin-page-subtitle">Companies live on SafiLink — suspend or reinstate as needed</p>
                </div>
            </div>

            <div className="admin-filters-bar">
                <div className="admin-search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="admin-loading"><div className="spinner" /></div>
            ) : companies.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-state-icon"><Search size={28} /></div>
                    <h3>No approved companies found</h3>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Requests Received</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map((company) => {
                                const category = toList(company.services).map((s) => formatService(s)).join(', ') || '-';
                                const busy = actionLoading === company.id;
                                return (
                                    <tr key={company.id}>
                                        <td className="admin-table-cell-primary">{company.name}</td>
                                        <td>{category}</td>
                                        <td>{company.location || '-'}</td>
                                        <td>{company.requests_received_count ?? 0}</td>
                                        <td>
                                            <span className={`admin-status-badge ${company.is_active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                                                {company.is_active ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td>
                                            {company.is_active ? (
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleToggle(company)} disabled={busy}>
                                                    <Ban size={14} /> Suspend
                                                </button>
                                            ) : (
                                                <button className="admin-btn admin-btn-amber admin-btn-sm" onClick={() => handleToggle(company)} disabled={busy}>
                                                    <UserCheck size={14} /> Reinstate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
