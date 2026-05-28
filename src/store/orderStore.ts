import {create} from 'zustand';

export interface OrderItem {
    name: string;
    emoji: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    storeName: string;
    storeEmoji: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    couponDiscount: number;
    pointDiscount: number;
    finalTotal: number;
    earnedPoints: number;
    payMethod: string;
    orderedAt: string;
    deliveryTime: number;
}

interface OrderState {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'orderedAt'>) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
    orders: [
        {
            id: 'MAT-482910',
            storeName: 'GS더프레시 마포점',
            storeEmoji: '🛒',
            items: [
                {name: '닭가슴살', emoji: '🍗', price: 6900, quantity: 2},
                {name: '두부', emoji: '🤍', price: 1800, quantity: 1},
                {name: '브로콜리', emoji: '🥦', price: 2900, quantity: 1},
            ],
            subtotal: 18500,
            deliveryFee: 0,
            couponDiscount: 0,
            pointDiscount: 1000,
            finalTotal: 17500,
            earnedPoints: 1700,
            payMethod: '카카오페이',
            orderedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            deliveryTime: 20,
        },
        {
            id: 'MAT-371028',
            storeName: '이마트24 홍대점',
            storeEmoji: '🏪',
            items: [
                {name: '한우 등심', emoji: '🥩', price: 32000, quantity: 1},
                {name: '달걀 10구', emoji: '🥚', price: 3200, quantity: 1},
            ],
            subtotal: 35200,
            deliveryFee: 3000,
            couponDiscount: 3520,
            pointDiscount: 0,
            finalTotal: 34680,
            earnedPoints: 3400,
            payMethod: '신용카드',
            orderedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            deliveryTime: 35,
        },
        {
            id: 'MAT-259341',
            storeName: '어글리어스',
            storeEmoji: '🌿',
            items: [
                {name: '못난이 당근', emoji: '🥕', price: 1900, quantity: 3},
                {name: '못난이 감자', emoji: '🥔', price: 1500, quantity: 2},
                {name: '못난이 양파', emoji: '🧅', price: 1200, quantity: 2},
            ],
            subtotal: 11100,
            deliveryFee: 2500,
            couponDiscount: 1110,
            pointDiscount: 0,
            finalTotal: 12490,
            earnedPoints: 1200,
            payMethod: '카카오페이',
            orderedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            deliveryTime: 30,
        },
    ],
    addOrder: (order) =>
        set((state) => ({
            orders: [
                {
                    ...order,
                    id: `MAT-${Date.now().toString().slice(-6)}`,
                    orderedAt: new Date().toISOString(),
                },
                ...state.orders,
            ],
        })),
}));
