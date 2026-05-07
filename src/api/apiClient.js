const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const buildHeaders = (headers = {}) => {
    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
    };
};

const apiRequest = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: buildHeaders(options.headers)
    });

    if (!response.ok) {
        let message = 'Request failed';

        try {
            const errorData = await response.json();
            message = errorData.message || errorData.title || errorData.error || message;
        } catch {
            const errorText = await response.text();
            message = errorText || message;
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export default apiRequest;
