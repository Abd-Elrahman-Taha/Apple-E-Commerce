import React, { useMemo } from 'react';


const filterConfig = {
    iPhone: [
        { key: 'model', label: 'Model', options: ['iPhone 15', 'iPhone 16', 'iPhone 17'] },
        { key: 'version', label: 'Version', options: ['Pro Max', 'Pro', 'Base'] },
        { key: 'storage', label: 'Storage', options: ['128GB', '256GB', '512GB', '1TB'] },
        { key: 'color', label: 'Color', options: ['Black', 'Silver', 'Gold', 'Blue', 'Natural Titanium', 'Blue Titanium'] }
    ],
    Mac: [
        { key: 'type', label: 'Type', options: ['MacBook Air', 'MacBook Pro', 'iMac'] },
        { key: 'chip', label: 'Chip', options: ['M1', 'M2', 'M3', 'M3 Max'] },
        { key: 'ram', label: 'Memory', options: ['8GB', '16GB', '32GB'] },
        { key: 'storage', label: 'Storage', options: ['256GB', '512GB', '1TB'] }
    ],
    iPad: [
        { key: 'model', label: 'Model', options: ['iPad', 'iPad Air', 'iPad Pro'] },
        { key: 'storage', label: 'Storage', options: ['64GB', '256GB', '512GB', '1TB'] },
        { key: 'screenSize', label: 'Screen Size', options: ['10.9"', '11"', '12.9"'] }
    ],
    Watch: [
        { key: 'series', label: 'Series', options: ['Series 9', 'Series 10', 'Ultra'] },
        { key: 'size', label: 'Size', options: ['41mm', '45mm', '49mm'] }
    ],
    AirPods: [
        { key: 'model', label: 'Model', options: ['AirPods 2', 'AirPods 3', 'AirPods Pro'] }
    ]
};

const FilterPanel = ({ activeCategory, activeFilters, onToggleFilter, onClearFilters, isOpen, onClose }) => {
    
    
    const filterGroups = useMemo(() => {
        if (activeCategory === 'All') return [];
        return filterConfig[activeCategory] || [];
    }, [activeCategory]);

    const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);

    if (activeCategory === 'All') {
        return (
            <div className={`store-filter-panel ${isOpen ? 'open' : ''}`}>
                <div className="filter-header-mobile d-lg-none">
                    <h3>Filters</h3>
                    <button className="btn-close-filter" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className="filter-empty-state">
                    <p>Select a category above to view advanced filters.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`store-filter-panel ${isOpen ? 'open' : ''}`}>
            <div className="filter-header-mobile d-lg-none">
                <h3>Filters</h3>
                <button className="btn-close-filter" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="filter-panel-header">
                <h3>Filter by</h3>
                {hasActiveFilters && (
                    <button className="btn-clear-filters" onClick={onClearFilters}>
                        Clear All
                    </button>
                )}
            </div>

            <div className="filter-groups-wrapper">
                {filterGroups.map((group) => (
                    <div key={group.key} className="filter-group">
                        <h4 className="filter-group-title">{group.label}</h4>
                        <div className="filter-options">
                            {group.options.map((option) => {
                                const isChecked = activeFilters[group.key]?.includes(option) || false;
                                return (
                                    <label key={option} className="filter-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => onToggleFilter(group.key, option)}
                                        />
                                        <span className="checkbox-custom"></span>
                                        <span className="checkbox-text">{option}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilterPanel;
