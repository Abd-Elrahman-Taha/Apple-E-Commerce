import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../services/adminApi';
import api from '../../api/api';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import useAdminStore from '../store/useAdminStore';

const AddProduct = () => {
    const navigate = useNavigate();
    const { toasts, toast, removeToast } = useToast();
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        pictureUrl: '',
        price: '',
        brandId: '',
        categoryId: '',
        badge: '',
        rating: '',
        reviewsCount: '',
        specsJson: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [brandRes, catRes] = await Promise.all([
                    api.get('/Product/Brands'),
                    api.get('/Product/Categories'),
                ]);
                setBrands(brandRes.data || []);
                setCategories(catRes.data || []);
            } catch (err) {
                toast.error('Failed to load brands/categories');
            }
        };
        fetchMeta();
    }, []);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.description.trim()) errs.description = 'Description is required';
        if (!form.pictureUrl.trim()) errs.pictureUrl = 'Image URL is required';
        if (!form.price || parseFloat(form.price) < 0) errs.price = 'Valid price is required';
        if (!form.brandId) errs.brandId = 'Brand is required';
        if (!form.categoryId) errs.categoryId = 'Category is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                pictureUrl: form.pictureUrl,
                price: parseFloat(form.price),
                brandId: parseInt(form.brandId),
                categoryId: parseInt(form.categoryId),
                badge: form.badge || null,
                rating: form.rating ? parseFloat(form.rating) : 0,
                reviewsCount: form.reviewsCount ? parseInt(form.reviewsCount) : 0,
                specsJson: form.specsJson || null,
            };
            await adminApi.createProduct(payload);
            useAdminStore.getState().fetchProducts();
            toast.success('Product created successfully!');
            setTimeout(() => navigate('/admin/products'), 1200);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.title || 'Failed to create product';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-form-page">
            <Toast toasts={toasts} removeToast={removeToast} />

            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form-grid">
                    <div className="admin-form-main">
                        <div className="admin-card">
                            <h3 className="admin-card-title">Product Information</h3>

                            <div className="admin-field">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. iPhone 16 Pro Max"
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="admin-field-error">{errors.name}</span>}
                            </div>

                            <div className="admin-field">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Product description..."
                                    rows={4}
                                    className={errors.description ? 'error' : ''}
                                />
                                {errors.description && <span className="admin-field-error">{errors.description}</span>}
                            </div>

                            <div className="admin-field">
                                <label>Image URL *</label>
                                <input
                                    type="url"
                                    name="pictureUrl"
                                    value={form.pictureUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.png"
                                    className={errors.pictureUrl ? 'error' : ''}
                                />
                                {errors.pictureUrl && <span className="admin-field-error">{errors.pictureUrl}</span>}
                            </div>

                            {form.pictureUrl && (
                                <div className="admin-image-preview">
                                    <img
                                        src={form.pictureUrl}
                                        alt="Preview"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                        onLoad={(e) => { e.target.style.display = 'block'; }}
                                    />
                                </div>
                            )}

                            <div className="admin-field">
                                <label>Specs JSON</label>
                                <textarea
                                    name="specsJson"
                                    value={form.specsJson}
                                    onChange={handleChange}
                                    placeholder='{"chip": "A18 Pro", "display": "6.9 inch"}'
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="admin-form-sidebar">
                        <div className="admin-card">
                            <h3 className="admin-card-title">Pricing & Details</h3>

                            <div className="admin-field">
                                <label>Price ($) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className={errors.price ? 'error' : ''}
                                />
                                {errors.price && <span className="admin-field-error">{errors.price}</span>}
                            </div>

                            <div className="admin-field">
                                <label>Brand *</label>
                                <select
                                    name="brandId"
                                    value={form.brandId}
                                    onChange={handleChange}
                                    className={errors.brandId ? 'error' : ''}
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                {errors.brandId && <span className="admin-field-error">{errors.brandId}</span>}
                            </div>

                            <div className="admin-field">
                                <label>Category *</label>
                                <select
                                    name="categoryId"
                                    value={form.categoryId}
                                    onChange={handleChange}
                                    className={errors.categoryId ? 'error' : ''}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.categoryId && <span className="admin-field-error">{errors.categoryId}</span>}
                            </div>

                            <div className="admin-field">
                                <label>Badge</label>
                                <input
                                    type="text"
                                    name="badge"
                                    value={form.badge}
                                    onChange={handleChange}
                                    placeholder="e.g. New, Sale, Hot"
                                />
                            </div>

                            <div className="admin-field-row">
                                <div className="admin-field">
                                    <label>Rating</label>
                                    <input
                                        type="number"
                                        name="rating"
                                        value={form.rating}
                                        onChange={handleChange}
                                        placeholder="0-5"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                    />
                                </div>
                                <div className="admin-field">
                                    <label>Reviews</label>
                                    <input
                                        type="number"
                                        name="reviewsCount"
                                        value={form.reviewsCount}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="admin-form-actions-card">
                            <button
                                type="submit"
                                className="admin-btn admin-btn-primary admin-btn-full"
                                disabled={submitting}
                            >
                                {submitting ? <span className="admin-btn-spinner" /> : (
                                    <>
                                        <i className="fa-solid fa-plus" />
                                        Create Product
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="admin-btn admin-btn-ghost admin-btn-full"
                                onClick={() => navigate('/admin/products')}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
