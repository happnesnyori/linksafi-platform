import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import OrganizationTopNav from '../../components/organization/OrganizationTopNav';
import MarketplaceCompanyCard from '../../components/marketplace/MarketplaceCompanyCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { getCompanies, getFavorites, addFavorite, removeFavorite } from '../../services/companyService';
import { requestService } from '../../services/requestService';
import '../../styles/marketplace.css';

const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'both', label: 'Both' },
];

export default function Marketplace() {
    const { addToast } = useToast();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [pendingUpdatesCount, setPendingUpdatesCount] = useState(0);

    useEffect(() => {
        getFavorites()
            .then((favorites) => {
                setFavoriteIds(new Set(favorites.map((f) => f.company?.id).filter(Boolean)));
            })
            .catch(() => {});

        requestService.getStats()
            .then((stats) => setPendingUpdatesCount(stats?.accepted || 0))
            .catch(() => {});
    }, []);

    useEffect(() => {
        let active = true;
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                setError('');
                const filters = {};
                if (serviceFilter !== 'all') filters.service = serviceFilter;
                if (location) filters.location = location;
                const data = await getCompanies(filters);
                if (!active) return;
                setCompanies(data.results || data || []);
            } catch (err) {
                if (active) setError('Failed to load companies');
            } finally {
                if (active) setLoading(false);
            }
        };
        const timeout = setTimeout(fetchCompanies, 250);
        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, [serviceFilter, location]);

    const visibleCompanies = useMemo(() => {
        if (!search.trim()) return companies;
        const term = search.trim().toLowerCase();
        return companies.filter((c) => (c.name || '').toLowerCase().includes(term));
    }, [companies, search]);

    const handleToggleFavorite = async (company) => {
        const isFav = favoriteIds.has(company.id);
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (isFav) next.delete(company.id); else next.add(company.id);
            return next;
        });
        try {
            if (isFav) {
                await removeFavorite(company.id);
            } else {
                await addFavorite(company.id);
            }
        } catch (err) {
            // Reconcile: roll back on failure.
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (isFav) next.add(company.id); else next.delete(company.id);
                return next;
            });
            addToast('Failed to update saved companies', 'error');
        }
    };

    return (
        <div className="marketplace-page">
            <OrganizationTopNav pendingUpdatesCount={pendingUpdatesCount} />

            <div className="mp-container">
                <div className="mp-header">
                    <h1>Find a service company</h1>
                    <p>Browse verified cleaning and decoration companies approved on SafiLink.</p>
                </div>

                <div className="mp-filters">
                    <div className="mp-search-input">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search by company name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="mp-search-input">
                        <MapPin size={16} />
                        <input
                            type="text"
                            placeholder="Location..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mp-chips">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            className={`mp-chip ${serviceFilter === filter.value ? 'active' : ''}`}
                            onClick={() => setServiceFilter(filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                    <span className="mp-result-count">
                        {loading ? 'Loading…' : `${visibleCompanies.length} compan${visibleCompanies.length === 1 ? 'y' : 'ies'}`}
                    </span>
                </div>

                {loading ? (
                    <Loading message="Finding approved companies..." />
                ) : error ? (
                    <EmptyState title="Unable to load companies" message={error} />
                ) : visibleCompanies.length === 0 ? (
                    <EmptyState
                        title="No companies found"
                        message="Try adjusting your search, location, or filters."
                    />
                ) : (
                    <div className="mp-grid">
                        {visibleCompanies.map((company) => (
                            <MarketplaceCompanyCard
                                key={company.id}
                                company={company}
                                isFavorite={favoriteIds.has(company.id)}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
