import {create} from 'zustand';
import {Product} from '../data/marketData';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    storeId: string | null;
    items: CartItem[];
    appliedCouponId: string | null;
    usePoints: boolean;
    setStore: (storeId: string) => void;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    applyCoupon: (couponId: string | null) => void;
    togglePoints: () => void;
    clearCart: () => void;
    totalCount: () => number;
    subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    storeId: null,
    items: [],
    appliedCouponId: null,
    usePoints: false,

    setStore: (storeId) => set({storeId, items: [], appliedCouponId: null, usePoints: false}),

    addItem: (product) =>
        set((state) => {
            const existing = state.items.find((i) => i.product.id === product.id);
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        i.product.id === product.id
                            ? {...i, quantity: i.quantity + 1}
                            : i,
                    ),
                };
            }
            return {items: [...state.items, {product, quantity: 1}]};
        }),

    removeItem: (productId) =>
        set((state) => ({
            items: state.items.filter((i) => i.product.id !== productId),
        })),

    updateQuantity: (productId, delta) =>
        set((state) => {
            const updated = state.items
                .map((i) =>
                    i.product.id === productId
                        ? {...i, quantity: Math.max(0, i.quantity + delta)}
                        : i,
                )
                .filter((i) => i.quantity > 0);
            return {items: updated};
        }),

    applyCoupon: (couponId) => set({appliedCouponId: couponId}),

    togglePoints: () => set((state) => ({usePoints: !state.usePoints})),

    clearCart: () =>
        set({storeId: null, items: [], appliedCouponId: null, usePoints: false}),

    totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

    subtotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}));
