import apiRequest from './apiClient';

export const createOrder = (order) => apiRequest('/api/Orders', {
    method: 'POST',
    body: JSON.stringify(order)
});

export const getOrders = () => apiRequest('/api/Orders');

export const getOrderById = (id) => apiRequest(`/api/Orders/${id}`);
