import { isValidElement } from 'react';
import Button from './Button';

export default function EmptyState({
    title = 'No data available',
    message = 'Please try again later.',
    action = null,
    icon = null
}) {
    const actionContent = isValidElement(action) || typeof action === 'string' || typeof action === 'number'
        ? action
        : action?.label
            ? <Button variant="primary" onClick={action.onClick}>{action.label}</Button>
            : action;

    return (
        <div className="empty-state">
            {icon && <div className="empty-state-icon">{icon}</div>}
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-message">{message}</p>
            {actionContent && <div className="empty-state-action">{actionContent}</div>}
        </div>
    );
}
