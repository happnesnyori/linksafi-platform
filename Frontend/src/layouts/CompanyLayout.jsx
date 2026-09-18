import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import CompanySidebar from '../components/company/CompanySidebar';
import CompanyTopbar from '../components/company/CompanyTopbar';
import Loading from '../components/Loading';
import { getMyCompany } from '../services/companyService';
import { requestService } from '../services/requestService';
import '../styles/companyPortal.css';

export default function CompanyLayout({ children }) {
    const [status, setStatus] = useState('checking');
    const [company, setCompany] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            const companyData = await getMyCompany();
            setCompany(companyData);
            setStatus('ready');
            try {
                const stats = await requestService.getStats();
                setPendingCount(stats?.pending || 0);
            } catch {
                setPendingCount(0);
            }
        } catch (err) {
            setStatus(err.status === 404 ? 'no-company' : 'ready');
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (status === 'checking') {
        return (
            <div className="company-portal">
                <div className="cp-loading-page"><Loading /></div>
            </div>
        );
    }

    if (status === 'no-company') {
        return <Navigate to="/company/setup" replace />;
    }

    return (
        <div className="company-portal">
            <div className="cp-layout">
                <CompanySidebar
                    company={company}
                    pendingCount={pendingCount}
                    mobileOpen={mobileOpen}
                    onMobileClose={() => setMobileOpen(false)}
                />
                <div className="cp-main">
                    <CompanyTopbar
                        company={company}
                        pendingCount={pendingCount}
                        onMobileMenu={() => setMobileOpen(true)}
                    />

                    {company?.status === 'pending' && (
                        <div className="cp-pending-banner">
                            <AlertTriangle size={16} />
                            <span>
                                <strong>Pending approval —</strong> your company isn't visible to organizations yet. An admin will review it shortly.
                            </span>
                        </div>
                    )}

                    <main className="cp-page">{children}</main>
                </div>
            </div>
        </div>
    );
}
