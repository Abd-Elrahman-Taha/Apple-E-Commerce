import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { withFixedProductImages, getApiImageUrl } from '../utils/productImages';
import api from '../api/api';

const useStore = create(
    persist(
        (set, get) => ({
            cart: [],
            orders: [],

            addToCart: (product) => {
                const { cart } = get();
                const item = withFixedProductImages(product);
                const existingItemIndex = cart.findIndex((i) => i.id === item.id);

                if (existingItemIndex >= 0) {
                    const newCart = [...cart];
                    newCart[existingItemIndex].quantity += 1;
                    set({ cart: newCart });
                } else {
                    set({ cart: [...cart, { ...item, quantity: 1 }] });
                }
            },

            removeFromCart: (productId) => {
                set({ cart: get().cart.filter(item => item.id !== productId) });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeFromCart(productId);
                    return;
                }
                set({
                    cart: get().cart.map(item =>
                        item.id === productId ? { ...item, quantity } : item
                    )
                });
            },

            clearCart: () => set({ cart: [] }),

            placeOrder: async (orderDetails) => {
                const { cart } = get();
                const basketId = 'BASKET-' + Math.random().toString(36).substr(2, 9).toUpperCase();

                const basketItems = cart.map(item => {
                    const apiImageUrl = getApiImageUrl(item);
                    return {
                        id: Number(item.id),
                        name: item.name || 'Unknown Item',
                        pictureUrl: apiImageUrl,
                        image: apiImageUrl,
                        price: Number(item.price) || 0,
                        quantity: Number(item.quantity) || 1,
                        category: item.categoryName || item.category || '',
                        storage: item.storage || '',
                        color: item.color || ''
                    };
                });

                await api.post('/Basket', {
                    id: basketId,
                    items: basketItems
                });

                const createOrderDto = {
                    basketId,
                    deliveryInfo: orderDetails.deliveryInfo,
                    paymentMethod: orderDetails.paymentMethod
                };

                const orderRes = await api.post('/Orders', createOrderDto);
                const createdOrder = orderRes.data;

                set({
                    orders: [createdOrder, ...get().orders],
                    cart: []
                });

                return createdOrder;
            }
        }),
        {
            name: 'apple-store-storage',
        }
    )
);

export default useStore;
