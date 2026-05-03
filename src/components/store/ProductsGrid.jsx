import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const generateStarHTML = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
        <>
            {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="fa-solid fa-star"></i>)}
            {halfStar && <i className="fa-solid fa-star-half-stroke"></i>}
            {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="fa-regular fa-star"></i>)}
        </>
    );
};

export const ProductCard = ({ product }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPct = (x / rect.width - 0.5) * 2;
        const yPct = (y / rect.height - 0.5) * 2;

        gsap.to(card, {
            rotationY: xPct * 8,
            rotationX: -yPct * 8,
            transformPerspective: 1000,
            ease: "power2.out",
            duration: 0.4
        });
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            ease: "elastic.out(1, 0.4)",
            duration: 0.8
        });
    };

    return (
        <div 
            className="product-card js-card" 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {product.badge && <div className="badge-tag">{product.badge}</div>}
            <div className="card-image-wrap">
                <img src={product.image} alt={product.name} />
            </div>
            <div className="card-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-desc">{product.desc}</div>
                
                {/* Dynamic specs if available */}
                <div className="product-specs-mini">
                    {product.storage && <span>{product.storage}</span>}
                    {product.chip && <span>{product.chip}</span>}
                    {product.ram && <span>{product.ram}</span>}
                </div>

                <div className="product-rating">
                    {generateStarHTML(product.rating)}
                    <span className="rating-num">({product.rating})</span>
                </div>
                <div className="card-bottom">
                    <div className="product-price">{product.price}</div>
                    <button className="btn-buy">Add to Cart</button>
                </div>
            </div>
        </div>
    );
};

const ProductsGrid = ({ products }) => {
    const gridRef = useRef(null);

    // Simple GSAP fade-in when products change
    useEffect(() => {
        if (!gridRef.current) return;
        
        const cards = gridRef.current.querySelectorAll('.js-card');
        if (cards.length > 0) {
            gsap.fromTo(cards, 
                { opacity: 0, y: 20, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
            );
        }
    }, [products]); // Re-run animation when products array reference changes

    if (products.length === 0) {
        return (
            <div className="no-results-state">
                <div className="no-results-icon"><i className="fa-solid fa-magnifying-glass"></i></div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <div className="products-grid-container" ref={gridRef}>
            <div className="product-grid">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductsGrid;
