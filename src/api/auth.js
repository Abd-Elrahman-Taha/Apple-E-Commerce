import apiRequest from './apiClient';

export const login = (email, password) => apiRequest('/api/Auth/Login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
});

export const register = (name, email, password) => apiRequest('/api/Auth/Register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
});

export const getCurrentUser = () => apiRequest('/api/Auth/Me');
