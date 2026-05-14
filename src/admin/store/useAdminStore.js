import { create } from 'zustand';
import adminApi from '../services/adminApi';

const useAdminStore = create((set, get) => ({
    orders: [],
    products: [],
    loadingOrders: false,
    loadingProducts: false,
    errorOrders: null,
    errorProducts: null,

    fetchOrders: async () => {
        set({ loadingOrders: true, errorOrders: null });
        try {
            const res = await adminApi.getOrders();
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            set({ orders: data, loadingOrders: false });
        } catch (error) {
            set({ errorOrders: error.message, loadingOrders: false });
            console.error("Failed to fetch admin orders", error);
        }
    },

    fetchProducts: async (page = 1, pageSize = 100) => {
        set({ loadingProducts: true, errorProducts: null });
        try {
            const res = await adminApi.getProducts(page, pageSize);
            const data = res.data?.data || res.data || [];
            set({ products: data, loadingProducts: false });
        } catch (error) {
            set({ errorProducts: error.message, loadingProducts: false });
            console.error("Failed to fetch admin products", error);
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            await adminApi.updateOrderStatus(orderId, status);
            set((state) => ({
                orders: state.orders.map((o) =>
                    o.id === orderId ? { ...o, status } : o
                ),
            }));
            return true;
        } catch (error) {
            console.error("Failed to update order status", error);
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
            console.error("Failed to delete product", error);
            throw error;
        }
    }
}));

export default useAdminStore;
