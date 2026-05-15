import { create } from 'zustand';
import adminApi from '../services/adminApi';
import { extractListFromApiData } from '../utils/adminOrdersUtils';
import { loadAdminOrdersFromApi } from '../services/adminOrdersService';
import {
    dedupeProductsById,
    getDuplicateProductIdsToDelete,
} from '../utils/productUtils';
import {
    getProductImageUrl,
    getApiImageUrl,
    needsProductImageFix,
    withFixedProductImages,
} from '../../utils/productImages';

const useAdminStore = create((set, get) => ({
    orders: [],
    products: [],
    totalProducts: 0,
    loadingOrders: false,
    loadingProducts: false,
    errorOrders: null,
    errorProducts: null,

    fetchOrders: async () => {
        set({ loadingOrders: true, errorOrders: null });
        try {
            const orders = await loadAdminOrdersFromApi();
            set({ orders, loadingOrders: false, errorOrders: null });
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                error?.message ||
                'Failed to load orders';
            set({ errorOrders: message, loadingOrders: false });
            console.error('Failed to fetch admin orders', error);
        }
    },

    fetchProducts: async () => {
        set({ loadingProducts: true, errorProducts: null });
        try {
            // Backend caps pageSize at 20 — must fetch all pages
            const PAGE_SIZE = 20;
            const firstRes = await adminApi.getProducts(1, PAGE_SIZE);
            const firstRaw = firstRes.data;
            const firstData = extractListFromApiData(firstRaw);
            const totalCount = firstRaw?.totalCount ?? firstRaw?.TotalCount ?? firstData.length;
            
            let allProducts = [...firstData];
            const totalPages = Math.ceil(totalCount / PAGE_SIZE);
            
            // Fetch remaining pages in parallel (pages 2..N)
            if (totalPages > 1) {
                const pagePromises = [];
                for (let p = 2; p <= totalPages; p++) {
                    pagePromises.push(adminApi.getProducts(p, PAGE_SIZE));
                }
                const responses = await Promise.all(pagePromises);
                for (const res of responses) {
                    const pageData = extractListFromApiData(res.data);
                    allProducts = allProducts.concat(pageData);
                }
            }
            
            const products = dedupeProductsById(allProducts).map(withFixedProductImages);
            set({
                products,
                totalProducts: products.length,
                loadingProducts: false,
                errorProducts: null,
            });
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                error?.message ||
                'Failed to load products';
            set({ errorProducts: message, loadingProducts: false });
            console.error('Failed to fetch admin products', error);
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            await adminApi.updateOrderStatus(orderId, status);
            set((state) => ({
                orders: state.orders.map((o) =>
                    String(o.id) === String(orderId) ? { ...o, status } : o
                ),
            }));
            return true;
        } catch (error) {
            console.error('Failed to update order status', error);
            throw error;
        }
    },

    deleteProduct: async (productId) => {
        try {
            await adminApi.deleteProduct(productId);
            set((state) => {
                const products = state.products.filter(
                    (p) => String(p.id) !== String(productId)
                );
                return { products, totalProducts: products.length };
            });
            return true;
        } catch (error) {
            console.error('Failed to delete product', error);
            throw error;
        }
    },

    /** Persist local image URLs for products still pointing at broken external hosts. */
    fixBrokenProductImages: async () => {
        const { products } = get();
        const toFix = products.filter(needsProductImageFix);
        if (toFix.length === 0) {
            return { updated: 0, failed: 0 };
        }

        let updated = 0;
        let failed = 0;
        for (const product of toFix) {
            // Use full https:// URL for the API — local paths cause 400 errors
            const pictureUrl = getApiImageUrl(product);
            try {
                await adminApi.updateProduct(product.id, {
                    name: product.name,
                    description: product.description ?? product.desc ?? '',
                    pictureUrl,
                    price: Number(product.price) || 0,
                    brandId: product.brandId,
                    categoryId: product.categoryId,
                    badge: product.badge ?? null,
                    rating: product.rating ? Number(product.rating) : 0,
                    reviewsCount: product.reviewsCount ?? product.reviews ?? 0,
                    specsJson: product.specsJson ?? null,
                });
                updated += 1;
            } catch (error) {
                failed += 1;
                console.warn(`Failed to update image for product ${product.id}`, error);
            }
        }

        await get().fetchProducts();
        return { updated, failed };
    },

    removeDuplicateProducts: async () => {
        const products = get().products;
        const idsToDelete = getDuplicateProductIdsToDelete(products);
        if (idsToDelete.length === 0) {
            return { removed: 0, failed: 0 };
        }

        let removed = 0;
        let failed = 0;
        for (const id of idsToDelete) {
            try {
                await adminApi.deleteProduct(id);
                removed += 1;
            } catch (error) {
                failed += 1;
                console.warn(`Failed to delete duplicate product ${id}`, error);
            }
        }

        await get().fetchProducts();
        return { removed, failed };
    },
}));

export default useAdminStore;
