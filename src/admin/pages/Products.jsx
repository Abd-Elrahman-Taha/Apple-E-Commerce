import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApi from '../services/adminApi';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import useAdminStore from '../store/useAdminStore';
import Pagination from '../../components/Pagination';
import SeedDatabase from '../components/SeedDatabase';
import RemoveDuplicateProducts from '../components/RemoveDuplicateProducts';
import { getProductImageUrl, LOCAL_IMAGES } from '../../utils/productImages';

const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%231c1c1e" width="200" height="200"/><text fill="%2386868b" font-family="system-ui" font-size="14" text-anchor="middle" x="100" y="100">No Image</text></svg>');

const Products = () => {
    const navigate = useNavigate();
    const { toasts, toast, removeToast } = useToast();
    const { products, totalProducts, loadingProducts: loading, fetchProducts, deleteProduct: deleteProductFromStore } = useAdminStore();
    
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
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
        setCurrentPage(1);
    }, [search, categoryFilter, products]);

    // Since we fetch all products (pageSize=1000), filtered.length = total matching products
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginatedProducts = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    // Guard: if page is beyond range (e.g. after deletion), snap back
    const safePage = Math.min(currentPage, totalPages);
    const displayedProducts = filtered.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    );

    const categories = [...new Set(products.map((p) => p.categoryName || p.category).filter(Boolean))];

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteProductFromStore(deleteId);
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/admin/add-product" className="admin-btn admin-btn-primary">
                        <i className="fa-solid fa-plus" />
                        Add Product
                    </Link>
                    <RemoveDuplicateProducts
                        onComplete={(message, isError) =>
                            isError ? toast.error(message) : toast.success(message)
                        }
                    />
                    <SeedDatabase
                        onComplete={(message) =>
                            toast.success(message || 'Database seeded successfully!')
                        }
                    />
                </div>
            </div>

            <div className="admin-products-count">
                Showing <strong>{filtered.length}</strong> of <strong>{totalProducts || products.length}</strong> products
                {totalPages > 1 && <span> — Page {safePage} of {totalPages}</span>}
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
                        <div className="admin-products-list-desktop">
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
                                    {displayedProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="product-cell">
                                                    <div className="product-cell-img">
                                                        <img src={getProductImageUrl(product)} alt={product.name} onError={(e) => { e.target.onerror = null; e.target.src = LOCAL_IMAGES.iphoneBlue; }} />
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
                        <div className="admin-products-list-mobile">
                            {paginatedProducts.map((product) => (
                                <div key={product.id} className="admin-order-card">
                                    <div className="order-card-header" style={{ alignItems: 'flex-start' }}>
                                        <div className="product-cell" style={{ gap: '12px' }}>
                                            <div className="product-cell-img" style={{ width: '40px', height: '40px' }}>
                                                <img src={getProductImageUrl(product)} alt={product.name} onError={(e) => { e.target.onerror = null; e.target.src = LOCAL_IMAGES.iphoneBlue; }} />
                                            </div>
                                            <div className="product-cell-info">
                                                <span className="product-cell-name" style={{ fontSize: '1rem' }}>{product.name}</span>
                                                <span className="product-cell-brand" style={{ fontSize: '0.8rem' }}>{product.categoryName || product.category || '—'}</span>
                                            </div>
                                        </div>
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
                                    </div>
                                    <div className="order-card-body">
                                        <div className="order-card-row"><span className="order-card-label">Price</span><span className="order-card-total">${product.price?.toFixed(2)}</span></div>
                                        <div className="order-card-row"><span className="order-card-label">Rating</span><span><i className="fa-solid fa-star" style={{ color: '#ff9500', marginRight: '4px' }} />{product.rating?.toFixed(1) || '—'}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    
                    {totalPages > 1 && (
                        <div style={{ marginTop: '20px' }}>
                            <Pagination 
                                currentPage={safePage}
                                totalPages={totalPages}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        </div>
                    )}
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
