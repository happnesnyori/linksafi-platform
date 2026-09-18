import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import Loading from '../../components/Loading';
import CompanyProfile from '../../components/CompanyProfile';
import { getCompanyById } from '../../services/companyService';

export default function CompanyDetails() {
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        getCompanyById(id)
            .then((data) => {
                if (active) setCompany(data);
            })
            .catch((err) => {
                if (active) setError(err.message || 'Failed to load company profile');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [id]);

    if (loading) {
        return <PublicLayout><Loading message="Loading company profile..." /></PublicLayout>;
    }

    if (error || !company) {
        return (
            <PublicLayout>
                <div className="page-container profile-error">
                    <h1 className="page-title">Company profile unavailable</h1>
                    <p className="page-subtitle">{error || 'This company could not be found.'}</p>
                    <a className="btn btn-primary" href="/companies">Back to Companies</a>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <CompanyProfile company={company} />
        </PublicLayout>
    );
}
