import {create} from 'zustand';

export type MealId = 'breakfast' | 'lunch' | 'dinner';

export interface Meal {
    id: MealId;
    label: string;
    emoji: string;
    expectedKcal: number;
    ingredients: string;
    actualKcal: number | null;
    macros: {carb: number; protein: number; fat: number} | null;
    score: number | null;
    photoUri: string | null;
    aiFeedback: string | null;
}

interface MealState {
    meals: Meal[];
    updateMeal: (id: MealId, data: Partial<Meal>) => void;
    resetMeals: () => void;
}

const DEFAULT_MEALS: Meal[] = [
    {
        id: 'breakfast',
        label: '아침',
        emoji: '🌅',
        expectedKcal: 380,
        ingredients: '달걀 2개 · 방울토마토 · 통밀빵',
        actualKcal: null,
        macros: null,
        score: null,
        photoUri: null,
        aiFeedback: null,
    },
    {
        id: 'lunch',
        label: '점심',
        emoji: '☀️',
        expectedKcal: 520,
        ingredients: '닭가슴살 150g · 현미밥 150g · 브로콜리 80g',
        actualKcal: null,
        macros: null,
        score: null,
        photoUri: null,
        aiFeedback: null,
    },
    {
        id: 'dinner',
        label: '저녁',
        emoji: '🌙',
        expectedKcal: 420,
        ingredients: '두부 200g · 된장국 · 나물반찬',
        actualKcal: null,
        macros: null,
        score: null,
        photoUri: null,
        aiFeedback: null,
    },
];

export const useMealStore = create<MealState>((set) => ({
    meals: DEFAULT_MEALS,
    updateMeal: (id, data) =>
        set((state) => ({
            meals: state.meals.map((m) => (m.id === id ? {...m, ...data} : m)),
        })),
    resetMeals: () => set({meals: DEFAULT_MEALS}),
}));
