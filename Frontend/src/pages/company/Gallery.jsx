import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Images, Trash2, Upload } from 'lucide-react';
import CompanyLayout from '../../layouts/CompanyLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import {
    deleteGalleryImage,
    getCompanyGallery,
    uploadGalleryImage,
} from '../../services/companyService';
import { getMediaUrl } from '../../utils/helpers';

export default function CompanyGallery() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const loadImages = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getCompanyGallery();
            setImages(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load gallery');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadImages();
    }, [user?.id]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError('Select an image to upload');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');
        const form = new FormData();
        form.append('image', selectedFile);
        form.append('title', title.trim());
        form.append('description', description.trim());

        try {
            await uploadGalleryImage(form);
            setSelectedFile(null);
            setPreviewUrl('');
            setTitle('');
            setDescription('');
            event.target.reset();
            setSuccess('Image uploaded successfully');
            await loadImages();
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

    return (
        <CompanyLayout>
            <div className="page-container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="page-title">Company Gallery</h1>
                    <p className="page-subtitle">Upload and manage approved company work photos</p>
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
                        <h2 className="section-title">Upload Image</h2>
                        <form onSubmit={handleUpload} className="form">
                            <label className="form-label required">Image</label>
                            <input
                                className="form-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt="Gallery preview"
                                    style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px' }}
                                />
                            )}
                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label className="form-label">Title</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder="Project or service title"
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
                                <Upload size={16} /> {submitting ? 'Uploading...' : 'Upload Image'}
                            </Button>
                        </form>
                    </div>

                    <div>
                        <h2 className="section-title" style={{ marginBottom: '16px' }}>Current Gallery</h2>
                        {loading ? (
                            <Loading />
                        ) : images.length === 0 ? (
                            <div className="company-profile-empty">
                                <Images size={30} />
                                <p>No gallery images yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
                                {images.map((image) => (
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
                                            style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
                                        />
                                        {(image.title || image.description) && (
                                            <figcaption style={{ padding: '10px' }}>
                                                {image.title && <strong>{image.title}</strong>}
                                                {image.description && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>{image.description}</p>}
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
                                ))}
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
        </CompanyLayout>
    );
}
