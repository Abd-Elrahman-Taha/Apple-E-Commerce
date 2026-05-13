import React from 'react';

const categories = [
    { id: 'All', label: 'All Models', icon: 'fa-solid fa-grid-2' },
    { id: 'iPhone', label: 'iPhone', icon: 'fa-solid fa-mobile-screen' },
    { id: 'Mac', label: 'Mac', icon: 'fa-solid fa-laptop' },
    { id: 'iPad', label: 'iPad', icon: 'fa-solid fa-tablet-screen-button' },
    { id: 'Watch', label: 'Apple Watch', icon: 'fa-solid fa-clock' },
    { id: 'AirPods', label: 'AirPods', icon: 'fa-solid fa-headphones' }
];

const CategoryBar = ({ activeCategory, onSelectCategory }) => {
    return (
        <div className="store-category-bar">
            <div className="category-scroll-container">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => onSelectCategory(cat.id)}
                    >
                        <i className={`cat-icon ${cat.icon}`}></i>
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryBar;
