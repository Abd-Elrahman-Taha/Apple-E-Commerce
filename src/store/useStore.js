import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBasket, saveBasket, deleteBasket } from '../api/basket';
import { createOrder } from '../api/orders';
import { mapBasketItem, mapOrder, parsePrice } from '../utils/storeData';

const BASKET_ID_KEY = 'basketId';

const createBasketId = () => `basket-${crypto.randomUUID()}`;

const ensureBasketId = () => {
    const existingBasketId = localStorage.getItem(BASKET_ID_KEY);

    if (existingBasketId) {
        return existingBasketId;
    }

    const newBasketId = createBasketId();
    localStorage.setItem(BASKET_ID_KEY, newBasketId);
    return newBasketId;
};

const buildBasketPayload = (cart, basketId) => ({
    id: basketId,
    items: cart.map(item => ({
        id: item.id,
        name: item.name,
        pictureUrl: item.pictureUrl || item.image || '',
        image: item.image || item.pictureUrl || '',
        price: parsePrice(item.priceValue ?? item.price),
        quantity: item.quantity,
        category: item.category || item.categoryName || ''
    }))
});

const useStore = create(
    persist(
        (set, get) => ({
            cart: [],
            orders: [],
            basketLoaded: false,
            
            syncBasket: async (cartOverride) => {
                const cart = cartOverride || get().cart;
                const basketId = ensureBasketId();
                const savedBasket = await saveBasket(buildBasketPayload(cart, basketId));
                const basketItems = (savedBasket?.items || cart).map(mapBasketItem);

                set({
                    cart: basketItems,
                    basketLoaded: true
                });

                return savedBasket;
            },

            loadBasket: async () => {
                const basketId = localStorage.getItem(BASKET_ID_KEY);

                if (!basketId) {
                    set({ basketLoaded: true });
                    return null;
                }

                try {
                    const basket = await getBasket(basketId);
                    const cart = (basket?.items || []).map(mapBasketItem);

                    set({
                        cart,
                        basketLoaded: true
                    });

                    return basket;
                } catch (error) {
                    set({ basketLoaded: true });
                    throw error;
                }
            },

            addToCart: async (product) => {
                const { cart } = get();
                const normalizedProduct = mapBasketItem(product);
                const existingItemIndex = cart.findIndex(item => item.id === normalizedProduct.id);
                let nextCart;
                
                if (existingItemIndex >= 0) {
                    nextCart = [...cart];
                    nextCart[existingItemIndex].quantity += 1;
                } else {
                    nextCart = [...cart, { ...normalizedProduct, quantity: 1 }];
                }

                set({ cart: nextCart });
                await get().syncBasket(nextCart);
            },
            
            removeFromCart: async (productId) => {
                const nextCart = get().cart.filter(item => item.id !== productId);
                set({ cart: nextCart });
                await get().syncBasket(nextCart);
            },
            
            updateQuantity: async (productId, quantity) => {
                if (quantity <= 0) {
                    await get().removeFromCart(productId);
                    return;
                }

                const nextCart = get().cart.map(item => 
                        item.id === productId ? { ...item, quantity } : item
                    );

                set({ cart: nextCart });
                await get().syncBasket(nextCart);
            },
            
            clearCart: async () => {
                const basketId = localStorage.getItem(BASKET_ID_KEY);

                if (basketId) {
                    try {
                        await deleteBasket(basketId);
                    } catch (error) {
                        console.error('Failed to clear basket:', error);
                    }
                }

                localStorage.removeItem(BASKET_ID_KEY);
                set({ cart: [] });
            },
            
            placeOrder: async (orderDetails) => {
                const basketId = localStorage.getItem(BASKET_ID_KEY) || ensureBasketId();
                const createdOrder = await createOrder({
                    basketId,
                    deliveryInfo: orderDetails.deliveryInfo,
                    paymentMethod: orderDetails.paymentMethod
                });
                const mappedOrder = mapOrder({
                    ...createdOrder,
                    items: createdOrder?.items?.length ? createdOrder.items : get().cart,
                    total: createdOrder?.total ?? orderDetails.total,
                    paymentMethod: createdOrder?.paymentMethod || orderDetails.paymentMethod,
                    deliveryInfo: createdOrder?.deliveryInfo || orderDetails.deliveryInfo
                });

                set({
                    orders: [mappedOrder, ...get().orders],
                    cart: []
                });

                try {
                    await deleteBasket(basketId);
                } catch (error) {
                    console.error('Failed to delete basket after checkout:', error);
                }

                localStorage.removeItem(BASKET_ID_KEY);

                return mappedOrder.id;
            }
        }),
        {
            name: 'apple-store-storage',
        }
    )
);

export default useStore;
