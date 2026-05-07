import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCategories, getProducts } from '../api/products';
import CategoryBar from '../components/store/CategoryBar';
import FilterPanel from '../components/store/FilterPanel';
import ProductsGrid from '../components/store/ProductsGrid';
import '../store.css';
import { mapProduct, normalizeCategoryName } from '../utils/storeData';

gsap.registerPlugin(ScrollTrigger);

const defaultCategories = [
    { id: 'All', label: 'All Models' },
    { id: 'iPhone', label: 'iPhone' },
    { id: 'Mac', label: 'Mac' },
    { id: 'iPad', label: 'iPad' },
    { id: 'Watch', label: 'Apple Watch' },
    { id: 'AirPods', label: 'AirPods' }
];

const Store = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = normalizeCategoryName(searchParams.get('category')) || 'All';

    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(defaultCategories);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    
    useEffect(() => {
        document.body.classList.add('light-theme');

        const tl = gsap.timeline();
        tl.fromTo(".apple-nav-light",
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
        tl.fromTo(".reveal-elem",
            { opacity: 0, y: 20, autoAlpha: 0 },
            { opacity: 1, y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
            "-=0.4"
        );

        return () => {
            document.body.classList.remove('light-theme');
            const nav = document.querySelector('.apple-nav-light') || document.querySelector('.apple-nav');
            if (nav) gsap.set(nav, { clearProps: "all" });
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    useEffect(() => {
        const categoryFromQuery = normalizeCategoryName(searchParams.get('category')) || 'All';
        setActiveCategory(categoryFromQuery);
    }, [searchParams]);

    useEffect(() => {
        const loadStoreData = async () => {
            setLoading(true);
            setError('');

            try {
                const [productsResult, categoriesResult] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);

                const rawProducts = productsResult?.data || productsResult || [];
                setProducts(rawProducts.map(mapProduct));

                const rawCategories = categoriesResult?.data || categoriesResult || [];
                if (Array.isArray(rawCategories) && rawCategories.length > 0) {
                    const mappedCategories = rawCategories.map(category => {
                        const categoryId = normalizeCategoryName(category.name || category.categoryName || category.title || category);

                        return {
                            id: categoryId,
                            label: category.label || category.name || category.categoryName || categoryId
                        };
                    }).filter(category => category.id);

                    setCategories([
                        defaultCategories[0],
                        ...mappedCategories.filter((category, index, array) =>
                            array.findIndex(item => item.id === category.id) === index
                        )
                    ]);
                }
            } catch (loadError) {
                console.error('Store loading error:', loadError);
                setError(loadError.message || 'Failed to load store data.');
            } finally {
                setLoading(false);
            }
        };

        loadStoreData();
    }, []);

    
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            
            if (searchQuery) {
                const searchStr = searchQuery.toLowerCase();
                const matchesSearch = product.name.toLowerCase().includes(searchStr) || 
                                      product.category.toLowerCase().includes(searchStr);
                if (!matchesSearch) return false;
            }

            
            if (activeCategory !== 'All' && product.category !== activeCategory) {
                return false;
            }

            
            if (activeCategory !== 'All') {
                for (const [filterKey, selectedValues] of Object.entries(activeFilters)) {
                    if (selectedValues.length > 0) {
                        
                        if (!product[filterKey] || !selectedValues.includes(product[filterKey])) {
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
            setSearchParams(category === 'All' ? {} : { category });
        }
    };

    const handleToggleFilter = (filterKey, value) => {
        setActiveFilters(prev => {
            const currentSelected = prev[filterKey] || [];
            const isCurrentlySelected = currentSelected.includes(value);

            return {
                ...prev,
                [filterKey]: isCurrentlySelected
                    ? currentSelected.filter(v => v !== value)
                    : [...currentSelected, value]
            };
        });
    };

    const handleClearFilters = () => {
        setActiveFilters({});
    };

    return (
        <main id="smooth-wrapper" className="store-page-wrapper">
            {}
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
                            <div className="search-container">
                                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                                <input
                                    type="text"
                                    id="productSearch"
                                    className="form-control"
                                    placeholder="Search products, categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {}
            <section className="store-category-section reveal-elem">
                <div className="container px-4 px-md-5">
                    <CategoryBar 
                        activeCategory={activeCategory} 
                        onSelectCategory={handleCategoryChange} 
                        categories={categories}
                    />
                </div>
            </section>

            {}
            <section className="store-main-layout">
                <div className="container px-4 px-md-5">
                    
                    {}
                    {activeCategory !== 'All' && (
                        <div className="mobile-filter-toggle d-lg-none">
                            <button className="btn-open-filters" onClick={() => setIsMobileFilterOpen(true)}>
                                <i className="fa-solid fa-sliders"></i> Filters
                                {Object.values(activeFilters).flat().length > 0 && 
                                    <span className="filter-badge">{Object.values(activeFilters).flat().length}</span>
                                }
                            </button>
                        </div>
                    )}

                    <div className="store-grid-layout">
                        {}
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

                        {}
                        <div className={`store-products-col ${activeCategory === 'All' ? 'full-width' : ''}`}>
                            {loading ? (
                                <div className="no-results-state">
                                    <h3>Loading products...</h3>
                                </div>
                            ) : error ? (
                                <div className="no-results-state">
                                    <h3>Unable to load products</h3>
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <ProductsGrid products={filteredProducts} />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {}
            <div 
                className={`mobile-filter-overlay ${isMobileFilterOpen ? 'show' : ''}`}
                onClick={() => setIsMobileFilterOpen(false)}
            ></div>
        </main>
    );
};

export default Store;
