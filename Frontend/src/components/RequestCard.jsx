import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/helpers';

export default function RequestCard({ request }) {
    if (!request) return null;

    return (
        <div className="request-card">
            <div className="request-card-header">
                <div className="request-info">
                    <h4 className="request-service">{request.service || 'Service Request'}</h4>
                    <p className="request-company">
                        {request.company?.name || request.companyName || 'Company'}
                    </p>
                </div>
                <StatusBadge status={request.status} />
            </div>

            <div className="request-card-body">
                <div className="request-meta">
                    {request.date && (
                        <div className="meta-item">
                            <span className="meta-label">Date:</span>
                            <span className="meta-value">{formatDate(request.date)}</span>
                        </div>
                    )}

                    {request.location && (
                        <div className="meta-item">
                            <span className="meta-label">Location:</span>
                            <span className="meta-value">{request.location}</span>
                        </div>
                    )}

                    {request.description && (
                        <div className="meta-item full-width">
                            <span className="meta-label">Description:</span>
                            <p className="meta-value">{request.description}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="request-card-footer">
                <Link
                    to={`/requests/${request.id}`}
                    className="view-details-link"
                >
                    View Details →
                </Link>
            </div>
        </div>
    );
}
