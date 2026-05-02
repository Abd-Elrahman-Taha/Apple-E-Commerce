import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------
// 1. Mock Data Source - LOCAL IMAGES
// ---------------------------------------------------------
const products = [
    {
        id: "p1",
        name: "iPhone 15 Pro",
        category: "iPhone",
        price: "From $999",
        rating: 4.9,
        reviews: 2145,
        desc: "Titanium. So strong. So light. So Pro.",
        image: "../Images/iphone15.jpg",        // ← Local image
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
        image: "../Images/Mac m3.jpg",       // ← Local image
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
        image: "../Images/ipad.jpg",             // ← Local image
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
        image: "../Images/airpods.jpg",          // ← Local image
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
        image: "../Images/watch.jpg",  // ← Local image
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
        image: "../Images/mac16.jpg",       // ← Local image
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
        image: "../Images/Studio Display - Nano-texture glass….jpg",       // ← Local image
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
        image: "../Images/Apple HomePod mini - Space Gray.jpg",              // ← Local image
        badge: ""
    }
];
// ---------------------------------------------------------
// 2. DOM Rendering Engine
// ---------------------------------------------------------
const gridElement = document.getElementById("productGrid");
const noResultsMsg = document.getElementById("noResultsMsg");

function generateStarHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;

    let html = '';
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="bi bi-star-fill"></i>';
    }
    if (halfStar) {
        html += '<i class="bi bi-star-half"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="bi bi-star"></i>';
    }
    return html;
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card js-card";
    card.dataset.name = product.name.toLowerCase();
    card.dataset.category = product.category.toLowerCase();

    const badgeHTML = product.badge ? `<div class="badge-tag">${product.badge}</div>` : '';

    card.innerHTML = `
        ${badgeHTML}
        <div class="card-image-wrap">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="card-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-desc">${product.desc}</div>
            <div class="product-rating">
                ${generateStarHTML(product.rating)}
                <span class="rating-num">(${product.rating})</span>
            </div>
            <div class="card-bottom">
                <div class="product-price">${product.price}</div>
                <button class="btn-buy">Buy</button>
            </div>
        </div>
    `;

    // Implement precise Apple-style 3D Tilt Effect on mousemove
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate center distances (-1 to 1)
        const xPct = (x / rect.width - 0.5) * 2;
        const yPct = (y / rect.height - 0.5) * 2;

        gsap.to(card, {
            rotationY: xPct * 8, // Subtle rotation limit
            rotationX: -yPct * 8,
            transformPerspective: 1000,
            ease: "power2.out",
            duration: 0.4
        });
    });

    // Reset on mouseleave
    card.addEventListener("mouseleave", () => {
        gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            ease: "elastic.out(1, 0.4)",
            duration: 0.8
        });
    });

    return card;
}

function renderInitialGrid() {
    gridElement.innerHTML = "";
    products.forEach(p => {
        gridElement.appendChild(createProductCard(p));
    });
}

// ---------------------------------------------------------
// 3. GSAP Master Logic
// ---------------------------------------------------------

function initPageAnimations() {
    const tl = gsap.timeline();

    // Fade in Navbar
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
}

// ---------------------------------------------------------
// 4. Search & Filtering Engine
// ---------------------------------------------------------
const searchInput = document.getElementById("productSearch");

searchInput.addEventListener("input", (e) => {
    const filterTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll(".js-card");
    let matchCount = 0;

    cards.forEach(card => {
        const nameMatch = card.dataset.name.includes(filterTerm);
        const catMatch = card.dataset.category.includes(filterTerm);

        if (nameMatch || catMatch) {
            matchCount++;
            // If it was hidden, bring it back
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
            // Shrink and fade out smoothly
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

    // Handle No Results state
    if (matchCount === 0) {
        if (noResultsMsg.classList.contains("d-none")) {
            noResultsMsg.classList.remove("d-none");
            gsap.fromTo(noResultsMsg, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
        }
    } else {
        noResultsMsg.classList.add("d-none");
    }
});

// ---------------------------------------------------------
// Execute
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // 1. Mount DOM
    renderInitialGrid();
    // 2. Play Load Sequence
    initPageAnimations();
});
