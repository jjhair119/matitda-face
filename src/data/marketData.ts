export type CategoryKey = 'all' | 'meat' | 'fish' | 'veggie' | 'fruit' | 'dairy' | 'grain';

export const CATEGORIES: {key: CategoryKey; label: string}[] = [
    {key: 'all', label: '전체'},
    {key: 'meat', label: '🥩 육류'},
    {key: 'fish', label: '🐟 수산'},
    {key: 'veggie', label: '🥦 채소'},
    {key: 'fruit', label: '🍎 과일'},
    {key: 'dairy', label: '🥚 계란/유제품'},
    {key: 'grain', label: '🌾 곡물'},
];

export interface Product {
    id: string;
    storeId: string;
    name: string;
    price: number;
    unit: string;
    category: CategoryKey;
    emoji: string;
    badge?: string;
}

export interface MarketStore {
    id: string;
    name: string;
    deliveryTime: number;
    deliveryFee: number;
    badges: string[];
    emoji: string;
    distance: string;
    minOrder: number;
    rating: number;
}

export const STORES: MarketStore[] = [
    {
        id: 'gs',
        name: 'GS더프레시 마포점',
        deliveryTime: 20,
        deliveryFee: 0,
        badges: ['🥕 못난이 취급'],
        emoji: '🏪',
        distance: '0.8km',
        minOrder: 15000,
        rating: 4.7,
    },
    {
        id: 'emart24',
        name: '이마트24 합정점',
        deliveryTime: 15,
        deliveryFee: 1900,
        badges: [],
        emoji: '🏬',
        distance: '0.5km',
        minOrder: 10000,
        rating: 4.5,
    },
    {
        id: 'ugly',
        name: '어글리어스 배달',
        deliveryTime: 30,
        deliveryFee: 0,
        badges: ['🥕 못난이 전문', '🌱 친환경'],
        emoji: '🥕',
        distance: '온라인',
        minOrder: 20000,
        rating: 4.9,
    },
];

export const PRODUCTS: Product[] = [
    // ── GS더프레시 ──────────────────────────
    {id: 'gs-1',  storeId: 'gs', name: '닭가슴살',         price: 2900, unit: '100g×2', category: 'meat',  emoji: '🍗'},
    {id: 'gs-2',  storeId: 'gs', name: '돼지 불고기용',     price: 5800, unit: '200g',   category: 'meat',  emoji: '🥩'},
    {id: 'gs-3',  storeId: 'gs', name: '소 불고기용',       price: 8900, unit: '150g',   category: 'meat',  emoji: '🥩'},
    {id: 'gs-4',  storeId: 'gs', name: '연어 (노르웨이산)', price: 6500, unit: '150g',   category: 'fish',  emoji: '🐟', badge: '🌊 신선'},
    {id: 'gs-5',  storeId: 'gs', name: '고등어',           price: 3200, unit: '1마리',  category: 'fish',  emoji: '🐟'},
    {id: 'gs-6',  storeId: 'gs', name: '브로콜리',          price: 2200, unit: '1개',    category: 'veggie',emoji: '🥦'},
    {id: 'gs-7',  storeId: 'gs', name: '대파',              price: 1800, unit: '1단',    category: 'veggie',emoji: '🧅'},
    {id: 'gs-8',  storeId: 'gs', name: '양파',              price: 2500, unit: '3개',    category: 'veggie',emoji: '🧅'},
    {id: 'gs-9',  storeId: 'gs', name: '시금치',            price: 2800, unit: '200g',   category: 'veggie',emoji: '🥬'},
    {id: 'gs-10', storeId: 'gs', name: '방울토마토',         price: 3500, unit: '500g',   category: 'veggie',emoji: '🍅'},
    {id: 'gs-11', storeId: 'gs', name: '사과',              price: 4500, unit: '3개',    category: 'fruit', emoji: '🍎'},
    {id: 'gs-12', storeId: 'gs', name: '바나나',             price: 2900, unit: '1송이',  category: 'fruit', emoji: '🍌'},
    {id: 'gs-13', storeId: 'gs', name: '달걀',              price: 3800, unit: '10개',   category: 'dairy', emoji: '🥚'},
    {id: 'gs-14', storeId: 'gs', name: '두부',              price: 1200, unit: '300g',   category: 'dairy', emoji: '🫘'},
    {id: 'gs-15', storeId: 'gs', name: '그릭요거트',         price: 2800, unit: '150g',   category: 'dairy', emoji: '🥛', badge: '고단백'},
    {id: 'gs-16', storeId: 'gs', name: '현미쌀',            price: 4500, unit: '1kg',    category: 'grain', emoji: '🌾'},
    {id: 'gs-17', storeId: 'gs', name: '오트밀',             price: 5500, unit: '500g',   category: 'grain', emoji: '🌾'},
    {id: 'gs-18', storeId: 'gs', name: '된장',              price: 3200, unit: '450g',   category: 'grain', emoji: '🫙'},

    // ── 이마트24 ────────────────────────────
    {id: 'em-1', storeId: 'emart24', name: '훈제 닭가슴살',  price: 1800, unit: '100g',    category: 'meat',  emoji: '🍗', badge: '간편'},
    {id: 'em-2', storeId: 'emart24', name: '참치캔',         price: 1500, unit: '150g',    category: 'fish',  emoji: '🐟'},
    {id: 'em-3', storeId: 'emart24', name: '샐러드 키트',    price: 3800, unit: '1봉',     category: 'veggie',emoji: '🥗', badge: '간편'},
    {id: 'em-4', storeId: 'emart24', name: '방울토마토',     price: 2900, unit: '300g',    category: 'veggie',emoji: '🍅'},
    {id: 'em-5', storeId: 'emart24', name: '달걀',           price: 4200, unit: '10개',    category: 'dairy', emoji: '🥚'},
    {id: 'em-6', storeId: 'emart24', name: '두부',           price: 1400, unit: '300g',    category: 'dairy', emoji: '🫘'},
    {id: 'em-7', storeId: 'emart24', name: '즉석 현미밥',    price: 2200, unit: '210g×3',  category: 'grain', emoji: '🍚', badge: '즉석'},
    {id: 'em-8', storeId: 'emart24', name: '오트밀',         price: 6000, unit: '500g',    category: 'grain', emoji: '🌾'},
    {id: 'em-9', storeId: 'emart24', name: '바나나',         price: 3200, unit: '1송이',   category: 'fruit', emoji: '🍌'},

    // ── 어글리어스 ──────────────────────────
    {id: 'ug-1', storeId: 'ugly', name: '못난이 당근',     price: 1500, unit: '500g', category: 'veggie',emoji: '🥕', badge: '🥕 못난이'},
    {id: 'ug-2', storeId: 'ugly', name: '못난이 감자',     price: 2000, unit: '1kg',  category: 'veggie',emoji: '🥔', badge: '🥕 못난이'},
    {id: 'ug-3', storeId: 'ugly', name: '못난이 토마토',   price: 2800, unit: '500g', category: 'veggie',emoji: '🍅', badge: '🥕 못난이'},
    {id: 'ug-4', storeId: 'ugly', name: '못난이 오이',     price: 1800, unit: '3개',  category: 'veggie',emoji: '🥒', badge: '🥕 못난이'},
    {id: 'ug-5', storeId: 'ugly', name: '못난이 브로콜리', price: 1800, unit: '1개',  category: 'veggie',emoji: '🥦', badge: '🥕 못난이'},
    {id: 'ug-6', storeId: 'ugly', name: '친환경 파프리카', price: 2500, unit: '3개',  category: 'veggie',emoji: '🫑', badge: '🌱 친환경'},
    {id: 'ug-7', storeId: 'ugly', name: '친환경 사과',     price: 5500, unit: '5개',  category: 'fruit', emoji: '🍎', badge: '🌱 친환경'},
    {id: 'ug-8', storeId: 'ugly', name: '친환경 달걀',     price: 5500, unit: '15개', category: 'dairy', emoji: '🥚', badge: '🌱 친환경'},
    {id: 'ug-9', storeId: 'ugly', name: '유기농 현미쌀',   price: 6800, unit: '2kg',  category: 'grain', emoji: '🌾', badge: '🌱 유기농'},
];

// 오늘 저녁 식단 기반 AI 추천 (두부 된장찌개)
export const AI_RECOMMENDATION = {
    meal: '두부 된장찌개',
    productIds: ['gs-14', 'gs-18', 'gs-7', 'gs-16'],
    storeId: 'gs',
};
