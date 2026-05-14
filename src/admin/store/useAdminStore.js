import { create } from 'zustand';
import adminApi from '../services/adminApi';
import { extractListFromApiData } from '../utils/adminOrdersUtils';
import { loadAdminOrdersFromApi } from '../services/adminOrdersService';

const useAdminStore = create((set) => ({
    orders: [],
    products: [],
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

    fetchProducts: async (page = 1, pageSize = 100) => {
        set({ loadingProducts: true, errorProducts: null });
        try {
            const res = await adminApi.getProducts(page, pageSize);
            const data = extractListFromApiData(res.data);
            set({ products: data, loadingProducts: false, errorProducts: null });
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
            set((state) => ({
                products: state.products.filter((p) => p.id !== productId),
            }));
            return true;
        } catch (error) {
            console.error('Failed to delete product', error);
            throw error;
        }
    },
}));

export default useAdminStore;
