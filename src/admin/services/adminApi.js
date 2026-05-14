import api from '../../api/api';

export const adminApi = {
    // Products
    getProducts: (page = 1, pageSize = 50) =>
        api.get(`/Product?pageIndex=${page}&pageSize=${pageSize}`),

    getProduct: (id) => api.get(`/Product/${id}`),

    createProduct: (data) => api.post('/Admin/Products', data),

    updateProduct: (id, data) => api.put(`/Admin/Products/${id}`, data),

    deleteProduct: (id) => api.delete(`/Admin/Products/${id}`),

    // Orders
    getOrders: () => api.get('/Admin/Orders'),

    getOrder: (id) => api.get(`/Admin/Orders/${id}`),

    updateOrderStatus: (id, status) =>
        api.put(`/Admin/Orders/${id}/status`, { status }),
};

export default adminApi;
