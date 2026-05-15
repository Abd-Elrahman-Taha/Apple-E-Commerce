import React, { useState } from 'react';
import adminApi from '../services/adminApi';
import api from '../../api/api';
import useAdminStore from '../store/useAdminStore';
import { extractListFromApiData } from '../utils/adminOrdersUtils';
import { dedupeProductsById } from '../utils/productUtils';
import { LOCAL_IMAGES, API_IMAGES, SEED_IPHONE_IMAGES } from '../../utils/productImages';

const IMG = {
    iphone_black:   SEED_IPHONE_IMAGES.black,
    iphone_white:   SEED_IPHONE_IMAGES.white,
    iphone_blue:    SEED_IPHONE_IMAGES.blue,
    iphone_teal:    SEED_IPHONE_IMAGES.teal,
    iphone_pink:    SEED_IPHONE_IMAGES.pink,
    iphone_yellow:  SEED_IPHONE_IMAGES.yellow,
    iphone14_black: SEED_IPHONE_IMAGES.iphone14_black,
    iphone14_white: SEED_IPHONE_IMAGES.iphone14_white,
    iphone14_blue:  SEED_IPHONE_IMAGES.iphone14_blue,
    macbook_dark:   API_IMAGES.macbook_dark,
    macbook_silver: API_IMAGES.macbook_silver,
    ipad_gray:      API_IMAGES.ipad_gray,
    ipad_blue:      API_IMAGES.ipad_blue,
    ipad_pink:      API_IMAGES.ipad_blue,
    watch_ultra:    API_IMAGES.watch_ultra,
    watch_silver:   API_IMAGES.watch_silver,
    watch_midnight: API_IMAGES.watch_midnight,
    airpods_max:    API_IMAGES.airpods_max,
    airpods_pro:    API_IMAGES.airpods_pro,
    airpods_3:      API_IMAGES.airpods_3,
};

const MOCK_PRODUCTS = [
    // ── iPhone 17 Pro Max ──────────────────────────────────────────────────
    { name: "iPhone 17 Pro Max 256GB Graphite", color: "Graphite", storage: "256GB", price: 1299, category: "iPhone", brand: "Apple", badge: "Pre-order", rating: 5.0, reviewsCount: 0, pictureUrl: IMG.iphone_black, desc: "Next generation iPhone with A19 Bionic, under-display Face ID, and advanced titanium alloy design." },
    { name: "iPhone 17 Pro Max 512GB Graphite", color: "Graphite", storage: "512GB", price: 1499, category: "iPhone", brand: "Apple", badge: "Pre-order", rating: 5.0, reviewsCount: 0, pictureUrl: IMG.iphone_black, desc: "Next generation iPhone with A19 Bionic, under-display Face ID, and advanced titanium alloy design." },
    { name: "iPhone 17 Pro Max 256GB Silver", color: "Silver", storage: "256GB", price: 1299, category: "iPhone", brand: "Apple", badge: "Pre-order", rating: 5.0, reviewsCount: 0, pictureUrl: IMG.iphone_white, desc: "Next generation iPhone with A19 Bionic, under-display Face ID, and advanced titanium alloy design." },
    { name: "iPhone 17 Pro Max 512GB Silver", color: "Silver", storage: "512GB", price: 1499, category: "iPhone", brand: "Apple", badge: "Pre-order", rating: 5.0, reviewsCount: 0, pictureUrl: IMG.iphone_white, desc: "Next generation iPhone with A19 Bionic, under-display Face ID, and advanced titanium alloy design." },
    { name: "iPhone 17 Pro 256GB Graphite", color: "Graphite", storage: "256GB", price: 1099, category: "iPhone", brand: "Apple", badge: "Pre-order", rating: 5.0, reviewsCount: 0, pictureUrl: IMG.iphone_black, desc: "Pro-level performance with A19 chip and advanced camera system." },
    { name: "iPhone 17 Pro 256GB Silver", color: "Silver", storage: "256GB", price: 1099, category: "iPhone", brand: "Apple", badge: "Pre-order", rating: 5.0, reviewsCount: 0, pictureUrl: IMG.iphone_white, desc: "Pro-level performance with A19 chip and advanced camera system." },

    // ── iPhone 16 Pro Max ──────────────────────────────────────────────────
    { name: "iPhone 16 Pro Max 256GB Black Titanium", color: "Black Titanium", storage: "256GB", price: 1199, category: "iPhone", brand: "Apple", badge: "New", rating: 4.9, reviewsCount: 1250, pictureUrl: IMG.iphone_black, desc: "The ultimate iPhone with A18 Pro chip, 48MP camera, and titanium design." },
    { name: "iPhone 16 Pro Max 512GB Black Titanium", color: "Black Titanium", storage: "512GB", price: 1399, category: "iPhone", brand: "Apple", badge: "New", rating: 4.9, reviewsCount: 420, pictureUrl: IMG.iphone_black, desc: "The ultimate iPhone with A18 Pro chip, 48MP camera, and titanium design." },
    { name: "iPhone 16 Pro Max 1TB Black Titanium", color: "Black Titanium", storage: "1TB", price: 1599, category: "iPhone", brand: "Apple", badge: "New", rating: 5.0, reviewsCount: 150, pictureUrl: IMG.iphone_black, desc: "The ultimate iPhone with A18 Pro chip, 48MP camera, and titanium design." },
    { name: "iPhone 16 Pro Max 256GB White Titanium", color: "White Titanium", storage: "256GB", price: 1199, category: "iPhone", brand: "Apple", badge: "New", rating: 4.8, reviewsCount: 890, pictureUrl: IMG.iphone_white, desc: "The ultimate iPhone with A18 Pro chip, 48MP camera, and titanium design." },
    { name: "iPhone 16 Pro Max 512GB White Titanium", color: "White Titanium", storage: "512GB", price: 1399, category: "iPhone", brand: "Apple", badge: "New", rating: 4.9, reviewsCount: 320, pictureUrl: IMG.iphone_white, desc: "The ultimate iPhone with A18 Pro chip, 48MP camera, and titanium design." },
    { name: "iPhone 16 Pro Max 256GB Natural Titanium", color: "Natural Titanium", storage: "256GB", price: 1199, category: "iPhone", brand: "Apple", badge: "New", rating: 4.9, reviewsCount: 1100, pictureUrl: IMG.iphone_yellow, desc: "The ultimate iPhone with A18 Pro chip, 48MP camera, and titanium design." },

    // ── iPhone 16 Pro ──────────────────────────────────────────────────────
    { name: "iPhone 16 Pro 128GB Black Titanium", color: "Black Titanium", storage: "128GB", price: 999, category: "iPhone", brand: "Apple", badge: "New", rating: 4.8, reviewsCount: 950, pictureUrl: IMG.iphone_black, desc: "Pro camera system, A18 Pro chip, titanium design." },
    { name: "iPhone 16 Pro 256GB Black Titanium", color: "Black Titanium", storage: "256GB", price: 1099, category: "iPhone", brand: "Apple", badge: "New", rating: 4.9, reviewsCount: 650, pictureUrl: IMG.iphone_black, desc: "Pro camera system, A18 Pro chip, titanium design." },
    { name: "iPhone 16 Pro 128GB Blue Titanium", color: "Blue Titanium", storage: "128GB", price: 999, category: "iPhone", brand: "Apple", badge: "New", rating: 4.8, reviewsCount: 820, pictureUrl: IMG.iphone_blue, desc: "Pro camera system, A18 Pro chip, titanium design." },
    { name: "iPhone 16 Pro 256GB Blue Titanium", color: "Blue Titanium", storage: "256GB", price: 1099, category: "iPhone", brand: "Apple", badge: "New", rating: 4.8, reviewsCount: 420, pictureUrl: IMG.iphone_blue, desc: "Pro camera system, A18 Pro chip, titanium design." },

    // ── iPhone 16 ──────────────────────────────────────────────────────────
    { name: "iPhone 16 128GB Midnight", color: "Midnight", storage: "128GB", price: 799, category: "iPhone", brand: "Apple", badge: "New", rating: 4.7, reviewsCount: 1500, pictureUrl: IMG.iphone_black, desc: "A18 chip, advanced dual-camera system, Dynamic Island." },
    { name: "iPhone 16 256GB Midnight", color: "Midnight", storage: "256GB", price: 899, category: "iPhone", brand: "Apple", badge: "New", rating: 4.7, reviewsCount: 800, pictureUrl: IMG.iphone_black, desc: "A18 chip, advanced dual-camera system, Dynamic Island." },
    { name: "iPhone 16 128GB Pink", color: "Pink", storage: "128GB", price: 799, category: "iPhone", brand: "Apple", badge: "New", rating: 4.8, reviewsCount: 1200, pictureUrl: IMG.iphone_pink, desc: "A18 chip, advanced dual-camera system, Dynamic Island." },
    { name: "iPhone 16 128GB Teal", color: "Teal", storage: "128GB", price: 799, category: "iPhone", brand: "Apple", badge: "New", rating: 4.7, reviewsCount: 980, pictureUrl: IMG.iphone_teal, desc: "A18 chip, advanced dual-camera system, Dynamic Island." },
    { name: "iPhone 16 128GB Ultramarine", color: "Ultramarine", storage: "128GB", price: 799, category: "iPhone", brand: "Apple", badge: "New", rating: 4.8, reviewsCount: 1050, pictureUrl: IMG.iphone_blue, desc: "A18 chip, advanced dual-camera system, Dynamic Island." },
    { name: "iPhone 16 128GB White", color: "White", storage: "128GB", price: 799, category: "iPhone", brand: "Apple", badge: "New", rating: 4.7, reviewsCount: 1300, pictureUrl: IMG.iphone_white, desc: "A18 chip, advanced dual-camera system, Dynamic Island." },

    // ── iPhone 15 Pro Max ──────────────────────────────────────────────────
    { name: "iPhone 15 Pro Max 256GB Natural Titanium", color: "Natural Titanium", storage: "256GB", price: 1099, category: "iPhone", brand: "Apple", badge: "Sale", rating: 4.9, reviewsCount: 5000, pictureUrl: IMG.iphone14_white, desc: "Titanium design. A17 Pro chip. Action button." },
    { name: "iPhone 15 Pro Max 256GB Blue Titanium", color: "Blue Titanium", storage: "256GB", price: 1099, category: "iPhone", brand: "Apple", badge: "Sale", rating: 4.9, reviewsCount: 4200, pictureUrl: IMG.iphone14_blue, desc: "Titanium design. A17 Pro chip. Action button." },
    { name: "iPhone 15 Pro Max 256GB Black Titanium", color: "Black Titanium", storage: "256GB", price: 1099, category: "iPhone", brand: "Apple", badge: "Sale", rating: 4.9, reviewsCount: 4800, pictureUrl: IMG.iphone14_black, desc: "Titanium design. A17 Pro chip. Action button." },

    // ── iPhone 15 ──────────────────────────────────────────────────────────
    { name: "iPhone 15 128GB Black", color: "Black", storage: "128GB", price: 699, category: "iPhone", brand: "Apple", badge: "", rating: 4.7, reviewsCount: 3200, pictureUrl: IMG.iphone14_black, desc: "Dynamic Island. 48MP camera. A16 Bionic chip." },
    { name: "iPhone 15 128GB Blue", color: "Blue", storage: "128GB", price: 699, category: "iPhone", brand: "Apple", badge: "", rating: 4.7, reviewsCount: 2800, pictureUrl: IMG.iphone14_blue, desc: "Dynamic Island. 48MP camera. A16 Bionic chip." },

    // ── MacBook Air M3 ─────────────────────────────────────────────────────
    { name: "MacBook Air 13\" M3 8GB 256GB Midnight", color: "Midnight", storage: "256GB", price: 1099, category: "Mac", brand: "Apple", badge: "M3", rating: 4.9, reviewsCount: 450, pictureUrl: IMG.macbook_dark, desc: "Supercharged by M3. 13.6-inch Liquid Retina display. Up to 18 hours battery life." },
    { name: "MacBook Air 13\" M3 16GB 512GB Midnight", color: "Midnight", storage: "512GB", price: 1299, category: "Mac", brand: "Apple", badge: "M3", rating: 4.9, reviewsCount: 200, pictureUrl: IMG.macbook_dark, desc: "Supercharged by M3. 13.6-inch Liquid Retina display. Up to 18 hours battery life." },
    { name: "MacBook Air 13\" M3 8GB 256GB Silver", color: "Silver", storage: "256GB", price: 1099, category: "Mac", brand: "Apple", badge: "M3", rating: 4.8, reviewsCount: 340, pictureUrl: IMG.macbook_silver, desc: "Supercharged by M3. 13.6-inch Liquid Retina display. Up to 18 hours battery life." },
    { name: "MacBook Air 15\" M3 8GB 256GB Starlight", color: "Starlight", storage: "256GB", price: 1299, category: "Mac", brand: "Apple", badge: "M3", rating: 4.9, reviewsCount: 410, pictureUrl: IMG.macbook_silver, desc: "15.3-inch Liquid Retina display. Supercharged by M3." },

    // ── MacBook Pro ────────────────────────────────────────────────────────
    { name: "MacBook Pro 14\" M3 Pro 18GB 512GB Space Black", color: "Space Black", storage: "512GB", price: 1999, category: "Mac", brand: "Apple", badge: "Pro", rating: 5.0, reviewsCount: 890, pictureUrl: IMG.macbook_dark, desc: "Mind-blowing. Head-turning. M3 Pro chip. Liquid Retina XDR display." },
    { name: "MacBook Pro 16\" M3 Max 36GB 1TB Space Black", color: "Space Black", storage: "1TB", price: 3499, category: "Mac", brand: "Apple", badge: "Max", rating: 5.0, reviewsCount: 420, pictureUrl: IMG.macbook_dark, desc: "Mind-blowing. Head-turning. M3 Max chip. Longest battery life ever in a Mac." },
    { name: "MacBook Pro 14\" M3 8GB 512GB Silver", color: "Silver", storage: "512GB", price: 1599, category: "Mac", brand: "Apple", badge: "", rating: 4.7, reviewsCount: 650, pictureUrl: IMG.macbook_silver, desc: "M3 chip. 14.2-inch Liquid Retina XDR display. Up to 22 hours battery life." },

    // ── iMac ───────────────────────────────────────────────────────────────
    { name: "iMac 24\" M3 8GB 256GB Silver", color: "Silver", storage: "256GB", price: 1299, category: "Mac", brand: "Apple", badge: "M3", rating: 4.8, reviewsCount: 310, pictureUrl: IMG.macbook_silver, desc: "All-in-one. All in colour. M3 chip. 4.5K Retina display." },
    { name: "iMac 24\" M3 8GB 256GB Blue", color: "Blue", storage: "256GB", price: 1299, category: "Mac", brand: "Apple", badge: "M3", rating: 4.8, reviewsCount: 280, pictureUrl: IMG.macbook_dark, desc: "All-in-one. All in colour. M3 chip. 4.5K Retina display." },

    // ── Mac Mini ───────────────────────────────────────────────────────────
    { name: "Mac Mini M2 8GB 256GB Silver", color: "Silver", storage: "256GB", price: 599, category: "Mac", brand: "Apple", badge: "", rating: 4.7, reviewsCount: 520, pictureUrl: IMG.macbook_silver, desc: "Do more with M2. Compact design. Versatile connectivity." },

    // ── iPad Pro M4 ────────────────────────────────────────────────────────
    { name: "iPad Pro 13-inch M4 256GB Space Black", color: "Space Black", storage: "256GB", price: 1299, category: "iPad", brand: "Apple", badge: "M4", rating: 4.9, reviewsCount: 300, pictureUrl: IMG.ipad_gray, desc: "Ultra Retina XDR. Incredibly thin. Outrageous performance with M4 chip." },
    { name: "iPad Pro 13-inch M4 512GB Space Black", color: "Space Black", storage: "512GB", price: 1499, category: "iPad", brand: "Apple", badge: "M4", rating: 5.0, reviewsCount: 150, pictureUrl: IMG.ipad_gray, desc: "Ultra Retina XDR. Incredibly thin. Outrageous performance with M4 chip." },
    { name: "iPad Pro 11-inch M4 256GB Silver", color: "Silver", storage: "256GB", price: 999, category: "iPad", brand: "Apple", badge: "M4", rating: 4.8, reviewsCount: 220, pictureUrl: IMG.ipad_gray, desc: "Ultra Retina XDR. Incredibly thin. Outrageous performance with M4 chip." },

    // ── iPad Air M2 ────────────────────────────────────────────────────────
    { name: "iPad Air 11-inch M2 128GB Blue", color: "Blue", storage: "128GB", price: 599, category: "iPad", brand: "Apple", badge: "M2", rating: 4.8, reviewsCount: 450, pictureUrl: IMG.ipad_blue, desc: "Supercharged by M2. Two sizes. Infinite possibilities." },
    { name: "iPad Air 11-inch M2 256GB Purple", color: "Purple", storage: "256GB", price: 699, category: "iPad", brand: "Apple", badge: "M2", rating: 4.8, reviewsCount: 320, pictureUrl: IMG.ipad_pink, desc: "Supercharged by M2. Two sizes. Infinite possibilities." },
    { name: "iPad Air 13-inch M2 256GB Space Gray", color: "Space Gray", storage: "256GB", price: 799, category: "iPad", brand: "Apple", badge: "M2", rating: 4.8, reviewsCount: 190, pictureUrl: IMG.ipad_gray, desc: "Supercharged by M2. 13-inch Liquid Retina display." },

    // ── iPad & iPad Mini ───────────────────────────────────────────────────
    { name: "iPad 10th Gen 64GB Blue", color: "Blue", storage: "64GB", price: 449, category: "iPad", brand: "Apple", badge: "", rating: 4.6, reviewsCount: 1100, pictureUrl: IMG.ipad_blue, desc: "Colourful. Powerful. Your thing. A14 Bionic chip." },
    { name: "iPad Mini 6th Gen 64GB Pink", color: "Pink", storage: "64GB", price: 499, category: "iPad", brand: "Apple", badge: "", rating: 4.7, reviewsCount: 890, pictureUrl: IMG.ipad_pink, desc: "Small in size. Huge in capability. A15 Bionic chip. 8.3-inch display." },

    // ── Apple Watch ─────────────────────────────────────────────────────────
    { name: "Apple Watch Ultra 2 49mm Titanium", color: "Titanium", storage: "32GB", price: 799, category: "Watch", brand: "Apple", badge: "Rugged", rating: 4.9, reviewsCount: 1100, pictureUrl: IMG.watch_ultra, desc: "Next-level adventure. The most rugged and capable Apple Watch." },
    { name: "Apple Watch Series 9 45mm Midnight", color: "Midnight", storage: "32GB", price: 399, category: "Watch", brand: "Apple", badge: "", rating: 4.7, reviewsCount: 2300, pictureUrl: IMG.watch_midnight, desc: "Smarter. Brighter. Mightier. S9 SiP chip." },
    { name: "Apple Watch Series 9 41mm Starlight", color: "Starlight", storage: "32GB", price: 399, category: "Watch", brand: "Apple", badge: "", rating: 4.8, reviewsCount: 1500, pictureUrl: IMG.watch_silver, desc: "Smarter. Brighter. Mightier. S9 SiP chip." },
    { name: "Apple Watch SE 44mm Midnight", color: "Midnight", storage: "32GB", price: 249, category: "Watch", brand: "Apple", badge: "Value", rating: 4.6, reviewsCount: 3100, pictureUrl: IMG.watch_midnight, desc: "A great way to start your Apple Watch journey." },
    { name: "Apple Watch SE 40mm Starlight", color: "Starlight", storage: "32GB", price: 249, category: "Watch", brand: "Apple", badge: "Value", rating: 4.6, reviewsCount: 2800, pictureUrl: IMG.watch_silver, desc: "A great way to start your Apple Watch journey." },

    // ── AirPods ─────────────────────────────────────────────────────────────
    { name: "AirPods Pro 2nd Generation", color: "White", storage: "-", price: 249, category: "AirPods", brand: "Apple", badge: "Best Seller", rating: 4.9, reviewsCount: 12500, pictureUrl: IMG.airpods_pro, desc: "Adaptive Audio. Up to 2x more Active Noise Cancellation. USB-C charging." },
    { name: "AirPods Max Space Gray", color: "Space Gray", storage: "-", price: 549, category: "AirPods", brand: "Apple", badge: "", rating: 4.7, reviewsCount: 2100, pictureUrl: IMG.airpods_max, desc: "High-fidelity audio. Active Noise Cancellation with Transparency mode." },
    { name: "AirPods Max Silver", color: "Silver", storage: "-", price: 549, category: "AirPods", brand: "Apple", badge: "", rating: 4.8, reviewsCount: 1800, pictureUrl: IMG.airpods_max, desc: "High-fidelity audio. Active Noise Cancellation with Transparency mode." },
    { name: "AirPods 3rd Generation", color: "White", storage: "-", price: 169, category: "AirPods", brand: "Apple", badge: "", rating: 4.6, reviewsCount: 4500, pictureUrl: IMG.airpods_3, desc: "Spatial audio with dynamic head tracking. Sweat and water resistant." },
    { name: "AirPods 2nd Generation", color: "White", storage: "-", price: 129, category: "AirPods", brand: "Apple", badge: "Value", rating: 4.5, reviewsCount: 9800, pictureUrl: IMG.airpods_3, desc: "Effortless setup. Rich, high-quality audio. Lightning charging case." },
];

const SeedDatabase = ({ onComplete }) => {
    const [seeding, setSeeding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const handleSeed = async () => {
        if (!window.confirm(`This will add ${MOCK_PRODUCTS.length} Apple products to your database. Continue?`)) return;

        setSeeding(true);
        setError('');
        setProgress(0);

        try {
            // First get brands and categories
            const [brandRes, catRes] = await Promise.all([
                api.get('/Product/Brands'),
                api.get('/Product/Categories')
            ]);

            const brands = brandRes.data || [];
            const categories = catRes.data || [];

            // Find or assign IDs
            let defaultBrandId = brands.length > 0 ? brands[0].id : 1;
            const appleBrand = brands.find(b => b.name.toLowerCase() === 'apple');
            if (appleBrand) defaultBrandId = appleBrand.id;

            // Mapping for categories
            const categoryMap = {};
            for (const c of categories) {
                categoryMap[c.name.toLowerCase()] = c.id;
            }

            let defaultCatId = categories.length > 0 ? categories[0].id : 1;

            // Load existing product names so re-seeding does not create duplicates
            const PAGE_SIZE = 20;
            const firstRes = await adminApi.getProducts(1, PAGE_SIZE);
            const firstRaw = firstRes.data;
            const firstData = extractListFromApiData(firstRaw);
            const totalCount = firstRaw?.totalCount ?? firstRaw?.TotalCount ?? firstData.length;
            let existingProducts = [...firstData];
            const totalPages = Math.ceil(totalCount / PAGE_SIZE);
            if (totalPages > 1) {
                const pagePromises = [];
                for (let p = 2; p <= totalPages; p++) {
                    pagePromises.push(adminApi.getProducts(p, PAGE_SIZE));
                }
                const responses = await Promise.all(pagePromises);
                for (const res of responses) {
                    existingProducts = existingProducts.concat(extractListFromApiData(res.data));
                }
            }
            existingProducts = dedupeProductsById(existingProducts);
            const existingNames = new Set(
                existingProducts.map((p) => (p.name ?? '').trim().toLowerCase()).filter(Boolean)
            );

            let count = 0;
            let skipped = 0;
            for (const product of MOCK_PRODUCTS) {
                const nameKey = product.name.trim().toLowerCase();
                if (existingNames.has(nameKey)) {
                    skipped++;
                    count++;
                    setProgress(Math.round((count / MOCK_PRODUCTS.length) * 100));
                    continue;
                }
                const catId = categoryMap[product.category.toLowerCase()] || defaultCatId;

                const payload = {
                    name: product.name,
                    description: product.desc,
                    pictureUrl: product.pictureUrl,
                    price: product.price,
                    brandId: defaultBrandId,
                    categoryId: catId,
                    badge: product.badge || null,
                    rating: product.rating,
                    reviewsCount: product.reviewsCount,
                    specsJson: JSON.stringify({ color: product.color, storage: product.storage })
                };

                try {
                    await adminApi.createProduct(payload);
                    existingNames.add(nameKey);
                } catch (err) {
                    console.warn(`Failed to seed "${product.name}":`, err.message);
                }
                count++;
                setProgress(Math.round((count / MOCK_PRODUCTS.length) * 100));
            }

            useAdminStore.getState().fetchProducts();
            if (onComplete) {
                onComplete(
                    skipped > 0
                        ? `Catalog updated. Skipped ${skipped} product(s) that already exist.`
                        : undefined
                );
            }

        } catch (err) {
            console.error("Seed error", err);
            setError('Failed to seed database. ' + (err.response?.data?.message || err.message));
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div style={{ marginLeft: '16px' }}>
            <button
                className="admin-btn"
                style={{ background: '#30d158', color: 'white' }}
                onClick={handleSeed}
                disabled={seeding}
            >
                {seeding ? (
                    <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Seeding ({progress}%)
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-database"></i> Seed Apple Catalog
                    </>
                )}
            </button>
            {error && <div style={{ color: '#ff453a', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
        </div>
    );
};

export default SeedDatabase;
