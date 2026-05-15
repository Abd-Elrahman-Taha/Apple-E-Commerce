import React, { useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CategoryBar from '../components/store/CategoryBar';
import FilterPanel from '../components/store/FilterPanel';
import ProductsGrid from '../components/store/ProductsGrid';
import Pagination from '../components/Pagination';
import { extractListFromApiData } from '../admin/utils/adminOrdersUtils';
import { dedupeProductsById } from '../admin/utils/productUtils';
import { withFixedProductImages } from '../utils/productImages';
import '../store.css';
import api from '../api/api';

gsap.registerPlugin(ScrollTrigger);

const Store = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchFocused, setSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // Fetch ALL products (backend caps pageSize at 20)
    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);
            try {
                const PAGE_SIZE = 20;
                const firstRes = await api.get(`/Product?pageIndex=1&pageSize=${PAGE_SIZE}`);
                const firstRaw = firstRes.data;
                const firstList = extractListFromApiData(firstRaw);
                const totalCount = firstRaw?.totalCount ?? firstRaw?.TotalCount ?? firstList.length;
                
                let allProducts = [...firstList];
                const totalPages = Math.ceil(totalCount / PAGE_SIZE);
                
                if (totalPages > 1) {
                    const promises = [];
                    for (let p = 2; p <= totalPages; p++) {
                        promises.push(api.get(`/Product?pageIndex=${p}&pageSize=${PAGE_SIZE}`));
                    }
                    const responses = await Promise.all(promises);
                    for (const res of responses) {
                        const pageData = extractListFromApiData(res.data);
                        allProducts = allProducts.concat(pageData);
                    }
                }
                
                setProducts(dedupeProductsById(allProducts).map(withFixedProductImages));
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please check your internet connection and try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    // GSAP animations
    useEffect(() => {
        document.body.classList.add('light-theme');

        const tl = gsap.timeline();
        tl.fromTo(".apple-nav-light", { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
        tl.fromTo(".reveal-elem", 
            { opacity: 0, y: 20, autoAlpha: 0 }, 
            { opacity: 1, y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }, 
            "-=0.4"
        );

        return () => {
            document.body.classList.remove('light-theme');
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    // Fixed filtering logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search
            if (searchQuery) {
                const searchStr = searchQuery.toLowerCase();
                const matchesSearch =
                    product.name?.toLowerCase().includes(searchStr) ||
                    product.categoryName?.toLowerCase().includes(searchStr) ||
                    product.brandName?.toLowerCase().includes(searchStr);

                if (!matchesSearch) return false;
            }

            // Category filter
            if (activeCategory !== 'All' && product.categoryName !== activeCategory) {
                return false;
            }

            // Advanced filters (only when a specific category is selected)
            if (activeCategory !== 'All') {
                for (const [filterKey, selectedValues] of Object.entries(activeFilters)) {
                    if (selectedValues?.length > 0) {
                        const productValue = product[filterKey];
                        if (!productValue || !selectedValues.includes(productValue)) {
                            return false;
                        }
                    }
                }
            }

            return true;
        });
    }, [products, searchQuery, activeCategory, activeFilters]);

    const handleCategoryChange = (category) => {
        if (activeCategory !== category) {
            setActiveCategory(category);
            setActiveFilters({}); 
            setSearchQuery(''); 
            setCurrentPage(1);
        }
    };

    const handleToggleFilter = (filterKey, value) => {
        setActiveFilters(prev => {
            const current = prev[filterKey] || [];
            const isSelected = current.includes(value);

            return {
                ...prev,
                [filterKey]: isSelected
                    ? current.filter(v => v !== value)
                    : [...current, value]
            };
        });
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setActiveFilters({});
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <main id="smooth-wrapper" className="store-page-wrapper">
            <section className="store-header">
                <div className="container px-4 px-md-5">
                    <div className="row align-items-end">
                        <div className="col-md-7 header-text-col">
                            <h1 className="store-title reveal-elem">Store.</h1>
                            <h2 className="store-subtitle reveal-elem">
                                The best way to buy the<br />products you love.
                            </h2>
                        </div>
                        <div className="col-md-5 search-col reveal-elem">
                            <div className={`search-container ${searchFocused ? 'focused' : ''}`}>
                                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                                <input
                                    id='search'
                                    type="text"
                                    className="form-control"
                                    placeholder="Search products, categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="store-category-section reveal-elem">
                <div className="container px-4 px-md-5">
                    <CategoryBar 
                        activeCategory={activeCategory} 
                        onSelectCategory={handleCategoryChange} 
                    />
                </div>
            </section>

            <section className="store-main-layout">
                <div className="container px-4 px-md-5">
                    {activeCategory !== 'All' && (
                        <div className="mobile-filter-toggle d-lg-none">
                            <button className="btn-open-filters" onClick={() => setIsMobileFilterOpen(true)}>
                                <i className="fa-solid fa-sliders"></i> Filters
                                {Object.values(activeFilters).flat().length > 0 && (
                                    <span className="filter-badge">
                                        {Object.values(activeFilters).flat().length}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="store-grid-layout">
                        <div className={`store-sidebar-col ${activeCategory === 'All' ? 'd-none' : ''}`}>
                            <FilterPanel 
                                activeCategory={activeCategory}
                                activeFilters={activeFilters}
                                onToggleFilter={handleToggleFilter}
                                onClearFilters={handleClearFilters}
                                isOpen={isMobileFilterOpen}
                                onClose={() => setIsMobileFilterOpen(false)}
                            />
                        </div>

                        <div className={`store-products-col ${activeCategory === 'All' ? 'full-width' : ''}`}>
                            {loading ? (
                                <div className="store-loading-state">
                                    <div className="apple-spinner"></div>
                                    <p>Loading products...</p>
                                </div>
                            ) : error ? (
                                <div className="store-error-state">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    <p>{error}</p>
                                    <button onClick={() => window.location.reload()} className="btn-retry">Retry</button>
                                </div>
                            ) : (
                                <>
                                    <ProductsGrid products={paginatedProducts} />
                                    {totalPages > 1 && (
                                        <Pagination 
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={(page) => {
                                                setCurrentPage(page);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div 
                className={`mobile-filter-overlay ${isMobileFilterOpen ? 'show' : ''}`}
                onClick={() => setIsMobileFilterOpen(false)}
            ></div>
        </main>
    );
};

export default Store;