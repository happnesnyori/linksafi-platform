import { useCallback, useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import '../styles/lightbox.css';

// groups: [{ id, title, items: [{ id, src, title, description, isMain, serviceId }] }]
// The first item in each group is the main image; the rest are its related sub-images.
// Pass `editable` + `services` + `onSave` (company dashboard only) to let the viewer
// edit the currently displayed image's label/description/service or replace its file.
export default function Lightbox({
    groups,
    groupIndex,
    onClose,
    onNavigateGroup,
    editable = false,
    services = [],
    onSave,
}) {
    const hasGroups = Array.isArray(groups) && groups.length > 0;
    const isOpen = hasGroups && groupIndex !== null && groupIndex !== undefined;
    const group = isOpen ? groups[groupIndex] : null;
    const items = group?.items || [];

    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', service: '' });
    const [editFile, setEditFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        setActiveItemIndex(0);
        setIsEditing(false);
    }, [groupIndex]);

    useEffect(() => {
        setIsEditing(false);
    }, [activeItemIndex]);

    const goToGroup = useCallback(
        (nextIndex) => {
            if (!hasGroups) return;
            onNavigateGroup(((nextIndex % groups.length) + groups.length) % groups.length);
        },
        [hasGroups, groups, onNavigateGroup]
    );

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (isEditing) setIsEditing(false);
                else onClose();
                return;
            }
            if (isEditing) return;
            if (event.key === 'ArrowRight') goToGroup(groupIndex + 1);
            if (event.key === 'ArrowLeft') goToGroup(groupIndex - 1);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, groupIndex, goToGroup, onClose, isEditing]);

    if (!isOpen || !group) return null;

    const active = items[activeItemIndex] || items[0];

    const startEdit = () => {
        setEditForm({
            title: active.title || '',
            description: active.description || '',
            service: active.isMain ? (active.serviceId ?? '') : '',
        });
        setEditFile(null);
        setSaveError('');
        setIsEditing(true);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (!onSave) return;
        setSaving(true);
        setSaveError('');
        try {
            const updates = {
                title: editForm.title,
                description: editForm.description,
            };
            if (active.isMain) updates.service = editForm.service;
            if (editFile) updates.image = editFile;
            await onSave(active.id, updates);
            setIsEditing(false);
        } catch (err) {
            setSaveError(err.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
                <X size={22} />
            </button>

            {groups.length > 1 && !isEditing && (
                <button
                    type="button"
                    className="lightbox-nav lightbox-nav-prev"
                    onClick={(e) => {
                        e.stopPropagation();
                        goToGroup(groupIndex - 1);
                    }}
                    aria-label="Previous"
                >
                    <ChevronLeft size={26} />
                </button>
            )}

            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <figure className="lightbox-main">
                    <div className="lightbox-main-frame">
                        <img src={active.src} alt={active.title || group.title || 'Gallery image'} />
                        {editable && !isEditing && (
                            <button type="button" className="lightbox-edit-trigger" onClick={startEdit}>
                                <Pencil size={14} /> Edit
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form className="lightbox-edit-form" onSubmit={handleSave}>
                            {saveError && <div className="lightbox-edit-error">{saveError}</div>}
                            <label>
                                What is this image about?
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                                    maxLength={160}
                                    required
                                />
                            </label>
                            <label>
                                Description
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                />
                            </label>
                            {active.isMain && services.length > 0 && (
                                <label>
                                    Service
                                    <select
                                        value={editForm.service}
                                        onChange={(e) => setEditForm((f) => ({ ...f, service: e.target.value }))}
                                    >
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>{service.name}</option>
                                        ))}
                                    </select>
                                </label>
                            )}
                            <label>
                                Replace image (optional)
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                />
                            </label>
                            <div className="lightbox-edit-actions">
                                <button type="button" onClick={() => setIsEditing(false)} disabled={saving}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        (active.title || active.description) && (
                            <figcaption>
                                {active.title && <strong>{active.title}</strong>}
                                {active.description && <p>{active.description}</p>}
                            </figcaption>
                        )
                    )}
                </figure>

                {items.length > 1 && !isEditing && (
                    <div className="lightbox-related">
                        <p className="lightbox-related-label">Related images</p>
                        <div className="lightbox-related-row">
                            {items.map((item, itemIndex) => (
                                <button
                                    key={item.id ?? `${item.src}-${itemIndex}`}
                                    type="button"
                                    className={`lightbox-related-thumb${itemIndex === activeItemIndex ? ' active' : ''}`}
                                    onClick={() => setActiveItemIndex(itemIndex)}
                                    aria-label={`View related image ${itemIndex + 1}`}
                                >
                                    <img src={item.src} alt={item.title || `Related image ${itemIndex + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {groups.length > 1 && !isEditing && (
                <button
                    type="button"
                    className="lightbox-nav lightbox-nav-next"
                    onClick={(e) => {
                        e.stopPropagation();
                        goToGroup(groupIndex + 1);
                    }}
                    aria-label="Next"
                >
                    <ChevronRight size={26} />
                </button>
            )}

            {groups.length > 1 && !isEditing && (
                <div className="lightbox-counter">{groupIndex + 1} / {groups.length}</div>
            )}
        </div>
    );
}
