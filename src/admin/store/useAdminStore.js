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
            let data = [];
            if (Array.isArray(res.data)) data = res.data;
            else if (Array.isArray(res.data?.data)) data = res.data.data;
            else if (Array.isArray(res.data?.$values)) data = res.data.$values;
            else if (Array.isArray(res.data?.items)) data = res.data.items;
            
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
            let data = [];
            if (Array.isArray(res.data)) data = res.data;
            else if (Array.isArray(res.data?.data)) data = res.data.data;
            else if (Array.isArray(res.data?.$values)) data = res.data.$values;
            else if (Array.isArray(res.data?.items)) data = res.data.items;
            
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
