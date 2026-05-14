import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const decodeTokenPayload = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            role: null,

            get isAuthenticated() {
                const { token } = get();
                if (!token) return false;
                const payload = decodeTokenPayload(token);
                if (!payload || !payload.exp) return true;
                return payload.exp * 1000 > Date.now();
            },

            get isAdmin() {
                return get().role === 'Admin';
            },

            login: (userData, token, role) => {
                set({ user: userData, token, role: role || userData?.role || null });
            },

            logout: () => {
                set({ user: null, token: null, role: null });
            },

            updateUser: (data) => {
                set({ user: { ...get().user, ...data } });
            },

            isTokenExpired: () => {
                const { token } = get();
                if (!token) return true;
                const payload = decodeTokenPayload(token);
                if (!payload || !payload.exp) return false;
                return payload.exp * 1000 <= Date.now();
            },

            checkAndLogout: () => {
                if (get().isTokenExpired()) {
                    get().logout();
                    return true;
                }
                return false;
            },
        }),
        {
            name: 'apple-auth-storage',
        }
    )
);

export default useAuthStore;
