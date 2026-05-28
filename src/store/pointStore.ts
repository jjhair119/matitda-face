import {create} from 'zustand';

export interface Coupon {
    id: string;
    title: string;
    description: string;
    discount: string;
    minOrder: number;
    expiresAt: string;
    used: boolean;
    badge: string;
}

export interface PointTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
}

interface PointState {
    points: number;
    coupons: Coupon[];
    history: PointTransaction[];
    useCoupon: (id: string) => void;
    addPoints: (amount: number, description: string) => void;
}

const INITIAL_HISTORY: PointTransaction[] = [
    {id: '1', date: '2026.05.28', description: '오늘 식단 기록 완료 (88점)', amount: 300},
    {id: '2', date: '2026.05.27', description: '점심 식단 기록 완료 (92점)', amount: 200},
    {id: '3', date: '2026.05.27', description: '아침 식단 기록 완료 (88점)', amount: 100},
    {id: '4', date: '2026.05.26', description: '7일 연속 달성 보너스 🎉', amount: 500},
    {id: '5', date: '2026.05.25', description: '식재료 구매 결제', amount: -1000},
    {id: '6', date: '2026.05.24', description: '오늘 식단 기록 완료 (76점)', amount: 200},
    {id: '7', date: '2026.05.23', description: '오늘 식단 기록 완료 (85점)', amount: 200},
    {id: '8', date: '2026.05.22', description: '커뮤니티 게시글 작성', amount: 100},
    {id: '9', date: '2026.05.20', description: '식재료 구매 결제', amount: -750},
    {id: '10', date: '2026.05.18', description: '오늘 식단 기록 완료 (90점)', amount: 300},
    {id: '11', date: '2026.05.16', description: '5일 연속 달성 보너스 🎉', amount: 300},
    {id: '12', date: '2026.05.14', description: '오늘 식단 기록 완료 (88점)', amount: 200},
];

const INITIAL_COUPONS: Coupon[] = [
    {
        id: 'c1',
        title: '🥇 금수저 10% 할인쿠폰',
        description: '식재료 구매 10% 할인',
        discount: '10%',
        minOrder: 5000,
        expiresAt: '2026.05.31',
        used: false,
        badge: '🥇 금수저',
    },
    {
        id: 'c2',
        title: '🌱 신규 회원 1,000원 할인',
        description: '10,000원 이상 주문 시 사용 가능',
        discount: '1,000원',
        minOrder: 10000,
        expiresAt: '2026.06.15',
        used: false,
        badge: '',
    },
    {
        id: 'c3',
        title: '🎉 가입 축하 쿠폰',
        description: '전 품목 5% 할인',
        discount: '5%',
        minOrder: 3000,
        expiresAt: '2026.04.30',
        used: true,
        badge: '',
    },
];

export const usePointStore = create<PointState>((set) => ({
    points: 9000,
    coupons: INITIAL_COUPONS,
    history: INITIAL_HISTORY,
    useCoupon: (id) =>
        set((state) => ({
            coupons: state.coupons.map((c) => (c.id === id ? {...c, used: true} : c)),
        })),
    addPoints: (amount, description) =>
        set((state) => ({
            points: state.points + amount,
            history: [
                {id: Date.now().toString(), date: '2026.05.28', description, amount},
                ...state.history,
            ],
        })),
}));
