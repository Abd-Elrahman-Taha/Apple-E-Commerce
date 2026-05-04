import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            cart: [],
            orders: [],
            
            addToCart: (product) => {
                const { cart } = get();
                const existingItemIndex = cart.findIndex(item => item.id === product.id);
                
                if (existingItemIndex >= 0) {
                    const newCart = [...cart];
                    newCart[existingItemIndex].quantity += 1;
                    set({ cart: newCart });
                } else {
                    set({ cart: [...cart, { ...product, quantity: 1 }] });
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
            
            placeOrder: (orderDetails) => {
                const newOrder = {
                    id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    date: new Date().toISOString(),
                    items: get().cart,
                    total: orderDetails.total,
                    paymentMethod: orderDetails.paymentMethod,
                    deliveryInfo: orderDetails.deliveryInfo,
                    status: 'Pending'
                };
                
                set({ 
                    orders: [newOrder, ...get().orders],
                    cart: []
                });
                
                return newOrder.id;
            }
        }),
        {
            name: 'apple-store-storage',
        }
    )
);

export default useStore;
