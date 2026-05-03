import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../store.css';

gsap.registerPlugin(ScrollTrigger);

const products = [
    {
        id: "p1",
        name: "iPhone 15 Pro",
        category: "iPhone",
        price: "From $999",
        rating: 4.9,
        reviews: 2145,
        desc: "Titanium. So strong. So light. So Pro.",
        image: "/Images/iphone15.jpg",
        badge: "New"
    },
    {
        id: "p2",
        name: "MacBook Air M3",
        category: "Mac",
        price: "$1099",
        rating: 4.8,
        reviews: 1320,
        desc: "Lean. Mean. M3 machine.",
        image: "/Images/Mac m3.jpg",
        badge: "M3 Chip"
    },
    {
        id: "p3",
        name: "iPad Pro",
        category: "iPad",
        price: "$999",
        rating: 4.7,
        reviews: 840,
        desc: "Supercharged by M2. Brilliant display.",
        image: "/Images/ipad.jpg",
        badge: ""
    },
    {
        id: "p4",
        name: "AirPods Pro",
        category: "Audio",
        price: "$249",
        rating: 4.9,
        reviews: 5120,
        desc: "Adaptive Audio. Now playing.",
        image: "/Images/airpods.jpg",
        badge: "Best Seller"
    },
    {
        id: "p5",
        name: "Apple Watch Ultra 2",
        category: "Watch",
        price: "$799",
        rating: 4.8,
        reviews: 950,
        desc: "Next-level adventure.",
        image: "/Images/watch.jpg",
        badge: "Rugged"
    },
    {
        id: "p6",
        name: "MacBook Pro 16\"",
        category: "Mac",
        price: "From $2499",
        rating: 5.0,
        reviews: 620,
        desc: "Mind-blowing. Head-turning.",
        image: "/Images/mac16.jpg",
        badge: "M3 Max"
    },
    {
        id: "p7",
        name: "Apple Studio Display",
        category: "Displays",
        price: "$1599",
        rating: 4.6,
        reviews: 320,
        desc: "A sight to be bold.",
        image: "/Images/Studio Display - Nano-texture glass….jpg",
        badge: ""
    },
    {
        id: "p8",
        name: "HomePod",
        category: "Audio",
        price: "$299",
        rating: 4.5,
        reviews: 415,
        desc: "Profound sound.",
        image: "/Images/Apple HomePod mini - Space Gray.jpg",
        badge: ""
    }
];

const generateStarHTML = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
        <>
            {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="bi bi-star-fill"></i>)}
            {halfStar && <i className="bi bi-star-half"></i>}
            {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="bi bi-star"></i>)}
        </>
    );
};

const ProductCard = ({ product, index }) => {
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
            data-name={product.name.toLowerCase()} 
            data-category={product.category.toLowerCase()}
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
                <div className="product-rating">
                    {generateStarHTML(product.rating)}
                    <span className="rating-num">({product.rating})</span>
                </div>
                <div className="card-bottom">
                    <div className="product-price">{product.price}</div>
                    <button className="btn-buy">Buy</button>
                </div>
            </div>
        </div>
    );
};

const Store = () => {
    const [filterTerm, setFilterTerm] = useState("");
    const [matchCount, setMatchCount] = useState(products.length);

    useEffect(() => {
        // Toggle light theme on body via class (clean mount/unmount lifecycle)
        document.body.classList.add('light-theme');

        const tl = gsap.timeline();

        // Fade in Navbar (target the light variant since Navbar handles class reactively)
        tl.fromTo(".apple-nav-light",
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        );

        // Stagger Header texts and Search bar
        tl.fromTo(".reveal-elem",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", autoAlpha: 1 },
            "-=0.5"
        );

        // Stagger Product Cards sequentially
        tl.fromTo(".js-card",
            { opacity: 0, y: 50, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "back.out(1.2)"
            },
            "-=0.4"
        );

        return () => {
            // Remove light theme class to restore dark default
            document.body.classList.remove('light-theme');
            document.body.style.backgroundColor = '';
            // Reset GSAP properties on the navbar element
            const nav = document.querySelector('.apple-nav-light') || document.querySelector('.apple-nav');
            if (nav) {
                gsap.set(nav, { clearProps: "all" });
            }
            ScrollTrigger.getAll().forEach(t => t.kill());
            gsap.killTweensOf('*');
        };
    }, []);

    useEffect(() => {
        // Handle Filtering Logic using GSAP to maintain exact original behavior
        const cards = document.querySelectorAll(".js-card");
        let currentMatchCount = 0;
        const term = filterTerm.toLowerCase();

        cards.forEach(card => {
            const nameMatch = card.dataset.name.includes(term);
            const catMatch = card.dataset.category.includes(term);

            if (nameMatch || catMatch) {
                currentMatchCount++;
                if (gsap.getProperty(card, "display") === "none") {
                    gsap.killTweensOf(card);
                    gsap.set(card, { display: "flex" });
                    gsap.to(card, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.4,
                        ease: "back.out(1.5)"
                    });
                }
            } else {
                if (gsap.getProperty(card, "display") !== "none") {
                    gsap.killTweensOf(card);
                    gsap.to(card, {
                        scale: 0.8,
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => gsap.set(card, { display: "none" })
                    });
                }
            }
        });

        setMatchCount(currentMatchCount);

    }, [filterTerm]);

    return (
        <main id="smooth-wrapper">
            <section className="store-header">
                <div className="container px-4 px-md-5">
                    <div className="row align-items-end">
                        <div className="col-md-7 header-text-col">
                            <h1 className="store-title reveal-elem" style={{ visibility: 'hidden' }}>Store.</h1>
                            <h2 className="store-subtitle reveal-elem" style={{ visibility: 'hidden' }}>
                                The best way to buy the<br/>products you love.
                            </h2>
                        </div>
                        <div className="col-md-5 search-col reveal-elem" style={{ visibility: 'hidden' }}>
                            <div className="search-container">
                                <i className="bi bi-search search-icon"></i>
                                <input 
                                    type="text" 
                                    id="productSearch" 
                                    className="form-control"
                                    placeholder="Search products, categories..."
                                    value={filterTerm}
                                    onChange={(e) => setFilterTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="product-section">
                <div className="container px-4 px-md-5">
                    <div id="noResultsMsg" className={`text-center py-5 ${matchCount === 0 ? '' : 'd-none'}`}>
                        <h3 className="fw-bold">No results found</h3>
                        <p className="text-muted">Try searching for something else like "Pro" or "Air".</p>
                    </div>

                    <div id="productGrid" className="product-grid">
                        {products.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Store;
