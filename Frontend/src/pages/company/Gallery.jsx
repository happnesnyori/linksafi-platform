import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Images, Trash2, Upload } from 'lucide-react';
import CompanyLayout from '../../layouts/CompanyLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Lightbox from '../../components/Lightbox';
import { useAuth } from '../../context/AuthContext';
import {
    deleteGalleryImage,
    getCompanyGallery,
    getMyCompany,
    updateGalleryImage,
    uploadServiceImageGroup,
} from '../../services/companyService';
import { formatService, getMediaUrl } from '../../utils/helpers';

export default function CompanyGallery() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [lightboxGroupIndex, setLightboxGroupIndex] = useState(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const [galleryData, companyData] = await Promise.all([getCompanyGallery(), getMyCompany()]);
            setImages(Array.isArray(galleryData) ? galleryData : []);
            const items = Array.isArray(companyData?.service_items) ? companyData.service_items : [];
            setServices(items);
            setSelectedServiceId((current) => current || (items[0]?.id ?? ''));
        } catch (err) {
            setError(err.message || 'Failed to load gallery');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [user?.id]);

    const handleFilesChange = (event) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);
        setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
        setError('');
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!selectedServiceId) {
            setError('Choose which service these photos are for');
            return;
        }
        if (!label.trim()) {
            setError('Describe what this image is about');
            return;
        }
        if (selectedFiles.length === 0) {
            setError('Select at least one image to upload');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await uploadServiceImageGroup(selectedServiceId, selectedFiles, label.trim(), description.trim());
            setSelectedFiles([]);
            setPreviewUrls([]);
            setLabel('');
            setDescription('');
            event.target.reset();
            setSuccess(
                selectedFiles.length > 1
                    ? `Uploaded as 1 gallery item with ${selectedFiles.length - 1} related sub-image${selectedFiles.length - 1 === 1 ? '' : 's'}`
                    : 'Image uploaded successfully'
            );
            await load();
        } catch (err) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm('Delete this gallery image?')) return;
        setError('');
        setSuccess('');
        try {
            await deleteGalleryImage(imageId);
            setImages((current) => current.filter((image) => image.id !== imageId));
            setSuccess('Image deleted successfully');
        } catch (err) {
            setError(err.message || 'Failed to delete image');
        }
    };

    const handleEditSave = async (itemId, updates) => {
        const updated = await updateGalleryImage(itemId, updates);
        setImages((current) => current.map((image) => {
            if (image.id === itemId) {
                return { ...image, ...updated };
            }
            if (image.sub_images?.some((sub) => sub.id === itemId)) {
                return {
                    ...image,
                    sub_images: image.sub_images.map((sub) => (sub.id === itemId ? { ...sub, ...updated } : sub)),
                };
            }
            return image;
        }));
    };

    const lightboxGroups = images.map((image) => ({
        id: image.id,
        title: image.title,
        items: [
            {
                id: image.id,
                src: getMediaUrl(image.image),
                title: image.title,
                description: image.description,
                isMain: true,
                serviceId: image.service,
            },
            ...(image.sub_images || []).map((sub) => ({
                id: sub.id,
                src: getMediaUrl(sub.image),
                title: sub.title || image.title,
                description: sub.description || image.description,
                isMain: false,
            })),
        ],
    }));

    return (
        <CompanyLayout>
            <div className="page-container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="page-title">Company Gallery</h1>
                    <p className="page-subtitle">Upload work photos and tag them to a service from your catalog</p>
                </div>

                {error && <div className="form-alert form-alert-error" style={{ marginBottom: '24px' }}>{error}</div>}
                {success && <div className="form-alert form-alert-success" style={{ marginBottom: '24px' }}>{success}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '24px',
                    }}>
                        <h2 className="section-title">Upload Images</h2>
                        {services.length === 0 ? (
                            <div className="company-profile-empty" style={{ marginTop: '12px' }}>
                                <Images size={30} />
                                <p>Add services to your profile first, then come back to tag photos to them.</p>
                                <Button variant="secondary" type="button" onClick={() => navigate('/company/services')}>
                                    Manage Services
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpload} className="form">
                                <label className="form-label required">Images</label>
                                <input
                                    className="form-input"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFilesChange}
                                />
                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                                    Selecting multiple photos at once groups them as one gallery item — the first photo
                                    is the main image and the rest become related sub-images (e.g. close-up/detail shots).
                                </p>
                                {previewUrls.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '12px' }}>
                                        {previewUrls.map((url) => (
                                            <img
                                                key={url}
                                                src={url}
                                                alt="Selected preview"
                                                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label className="form-label required">Service</label>
                                    <select
                                        className="form-input"
                                        value={selectedServiceId}
                                        onChange={(event) => setSelectedServiceId(event.target.value)}
                                    >
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} ({formatService(service.category)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">What is this image about?</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        value={label}
                                        onChange={(event) => setLabel(event.target.value)}
                                        placeholder="e.g. Deep kitchen clean, Living room makeover"
                                        maxLength={160}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="Describe the work shown"
                                        style={{ minHeight: '90px' }}
                                    />
                                </div>
                                <Button variant="primary" size="lg" fullWidth type="submit" disabled={submitting}>
                                    <Upload size={16} /> {submitting ? 'Uploading...' : 'Upload Images'}
                                </Button>
                            </form>
                        )}
                    </div>

                    <div>
                        <h2 className="section-title" style={{ marginBottom: '4px' }}>Current Gallery</h2>
                        {images.length > 0 && (
                            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                                Click an image to view it full size, browse its related photos, or edit its details.
                            </p>
                        )}
                        {loading ? (
                            <Loading />
                        ) : images.length === 0 ? (
                            <div className="company-profile-empty">
                                <Images size={30} />
                                <p>No gallery images yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
                                {images.map((image, imageIndex) => {
                                    const subImages = image.sub_images || [];
                                    return (
                                        <figure
                                            key={image.id}
                                            style={{
                                                margin: 0,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                borderRadius: '8px',
                                                background: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                            }}
                                        >
                                            <img
                                                src={getMediaUrl(image.image)}
                                                alt={image.title || `${user?.name || 'Company'} gallery`}
                                                onClick={() => setLightboxGroupIndex(imageIndex)}
                                                style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                                            />
                                            {subImages.length > 0 && (
                                                <span
                                                    onClick={() => setLightboxGroupIndex(imageIndex)}
                                                    title={`${subImages.length} related image${subImages.length === 1 ? '' : 's'}`}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '8px',
                                                        left: '8px',
                                                        background: 'rgba(0, 0, 0, 0.65)',
                                                        color: '#fff',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        padding: '3px 8px',
                                                        borderRadius: '999px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    +{subImages.length}
                                                </span>
                                            )}
                                            {image.title && (
                                                <figcaption style={{ padding: '10px' }}>
                                                    <strong>{image.title}</strong>
                                                </figcaption>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(image.id)}
                                                aria-label={`Delete ${image.title || 'gallery image'}`}
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    background: 'rgba(255, 255, 255, 0.94)',
                                                    color: '#dc2626',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </figure>
                                    );
                                })}
                            </div>
                        )}
                        <div style={{ marginTop: '20px' }}>
                            <Button variant="secondary" size="lg" type="button" onClick={() => navigate('/company/overview')}>
                                Back to Overview
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Lightbox
                groups={lightboxGroups}
                groupIndex={lightboxGroupIndex}
                onClose={() => setLightboxGroupIndex(null)}
                onNavigateGroup={setLightboxGroupIndex}
                editable
                services={services}
                onSave={handleEditSave}
            />
        </CompanyLayout>
    );
}
