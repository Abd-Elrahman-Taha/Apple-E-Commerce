import apiRequest from './apiClient';

export const getBasket = (key) => apiRequest(`/api/Basket?key=${encodeURIComponent(key)}`);

export const saveBasket = (basket) => apiRequest('/api/Basket', {
    method: 'POST',
    body: JSON.stringify(basket)
});

export const deleteBasket = (key) => apiRequest(`/api/Basket/${encodeURIComponent(key)}`, {
    method: 'DELETE'
});
