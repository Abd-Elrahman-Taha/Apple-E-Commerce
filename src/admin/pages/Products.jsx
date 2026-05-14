import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApi from '../services/adminApi';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

const Products = () => {
    const navigate = useNavigate();
    const { toasts, toast, removeToast } = useToast();
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getProducts(1, 200);
            const list = res.data?.data || res.data || [];
            setProducts(list);
            setFiltered(list);
        } catch (err) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let result = [...products];
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.categoryName?.toLowerCase().includes(q) ||
                    p.brandName?.toLowerCase().includes(q)
            );
        }
        if (categoryFilter) {
            result = result.filter((p) => p.categoryName === categoryFilter || p.category === categoryFilter);
        }
        setFiltered(result);
    }, [search, categoryFilter, products]);

    const categories = [...new Set(products.map((p) => p.categoryName || p.category).filter(Boolean))];

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await adminApi.deleteProduct(deleteId);
            setProducts((prev) => prev.filter((p) => p.id !== deleteId));
            toast.success('Product deleted successfully');
        } catch (err) {
            toast.error('Failed to delete product');
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner" />
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className="admin-products-page">
            <Toast toasts={toasts} removeToast={removeToast} />

            <div className="admin-page-toolbar">
                <div className="admin-toolbar-left">
                    <div className="admin-search-box">
                        <i className="fa-solid fa-magnifying-glass" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="admin-search-clear" onClick={() => setSearch('')}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        )}
                    </div>
                    <select
                        className="admin-filter-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <Link to="/admin/add-product" className="admin-btn admin-btn-primary">
                    <i className="fa-solid fa-plus" />
                    Add Product
                </Link>
            </div>

            <div className="admin-products-count">
                Showing <strong>{filtered.length}</strong> of {products.length} products
            </div>

            {filtered.length === 0 ? (
                <div className="admin-empty">
                    <i className="fa-solid fa-box-open" />
                    <p>{search || categoryFilter ? 'No products match your filters' : 'No products yet'}</p>
                    {!search && !categoryFilter && (
                        <Link to="/admin/add-product" className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
                            Add Your First Product
                        </Link>
                    )}
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table admin-products-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-cell">
                                            <div className="product-cell-img">
                                                <img src={product.pictureUrl || product.image} alt={product.name} />
                                            </div>
                                            <div className="product-cell-info">
                                                <span className="product-cell-name">{product.name}</span>
                                                <span className="product-cell-brand">{product.brandName || '—'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="admin-category-badge">{product.categoryName || product.category || '—'}</span>
                                    </td>
                                    <td className="product-price-cell">${product.price?.toFixed(2)}</td>
                                    <td>
                                        <div className="product-rating-cell">
                                            <i className="fa-solid fa-star" />
                                            <span>{product.rating?.toFixed(1) || '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-actions">
                                            <button
                                                className="admin-action-btn edit"
                                                onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-pen" />
                                            </button>
                                            <button
                                                className="admin-action-btn delete"
                                                onClick={() => setDeleteId(product.id)}
                                                title="Delete"
                                            >
                                                <i className="fa-solid fa-trash" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {deleteId && (
                <div className="admin-modal-overlay" onClick={() => !deleting && setDeleteId(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-icon delete">
                            <i className="fa-solid fa-triangle-exclamation" />
                        </div>
                        <h3>Delete Product</h3>
                        <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                        <div className="admin-modal-actions">
                            <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteId(null)} disabled={deleting}>
                                Cancel
                            </button>
                            <button className="admin-btn admin-btn-danger" onClick={handleDelete} disabled={deleting}>
                                {deleting ? <span className="admin-btn-spinner" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
