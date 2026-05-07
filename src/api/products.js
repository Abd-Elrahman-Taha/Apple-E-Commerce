import apiRequest from './apiClient';

export const getProducts = (query = '') => {
    const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);

    if (!params.has('pageSize')) {
        params.set('pageSize', '100');
    }

    const search = params.toString() ? `?${params.toString()}` : '';

    return apiRequest(`/api/Product${search}`);
};

export const getProductById = (id) => apiRequest(`/api/Product/${id}`);

export const getCategories = () => apiRequest('/api/Product/Categories');
