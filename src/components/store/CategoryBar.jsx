import React from 'react';

const defaultCategories = [
    { id: 'All', label: 'All Models' },
    { id: 'iPhone', label: 'iPhone' },
    { id: 'Mac', label: 'Mac' },
    { id: 'iPad', label: 'iPad' },
    { id: 'Watch', label: 'Apple Watch' },
    { id: 'AirPods', label: 'AirPods' }
];

const CategoryBar = ({ activeCategory, onSelectCategory, categories = defaultCategories }) => {
    return (
        <div className="store-category-bar">
            <div className="category-scroll-container">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => onSelectCategory(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryBar;
