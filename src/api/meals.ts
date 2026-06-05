import {api} from './client';

export interface DailyMealSummary {
    date: string;
    records: {id: string; meal_type: string; calories: number; carbs_g: number; protein_g: number; fat_g: number; score: number | null}[];
    totals: {calories: number; carbs_g: number; protein_g: number; fat_g: number};
}

export async function getDailyMeals(date: string): Promise<DailyMealSummary> {
    const {data} = await api.get('/meals', {params: {date}});
    return data;
}

export interface MealAnalysisResult {
    actualKcal: number;
    macros: {carb: number; protein: number; fat: number};
    score: number;
    foods: string[];
    feedback: string;
}

const FEEDBACKS_BY_SCORE: {min: number; messages: string[]}[] = [
    {min: 90, messages: ['완벽한 식단이에요! 내일도 이렇게 해봐요 💪', '목표를 완벽히 달성했어요! 🎉']},
    {min: 80, messages: ['훌륭해요! 단백질 섭취가 정말 좋습니다 👍', '균형 잡힌 식사네요 🥗']},
    {min: 70, messages: ['잘 하셨어요! 조금만 더 신경 써봐요 😊']},
    {min: 0, messages: ['식사량을 조금 더 조절해봐요. 내일은 더 잘 할 수 있어요!', '지방 섭취가 살짝 높아요. 조리법을 바꿔보는 건 어떨까요?']},
];

function getFeedback(score: number): string {
    const bucket = FEEDBACKS_BY_SCORE.find((b) => score >= b.min)!;
    return bucket.messages[Math.floor(Math.random() * bucket.messages.length)];
}

export async function analyzeMealPhoto(params: {
    emptyPhotoUri: string;
    foodPhotoUri: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    mealDate: string;
}): Promise<MealAnalysisResult> {
    const form = new FormData();

    form.append('empty_image', {
        uri: params.emptyPhotoUri,
        name: 'empty.jpg',
        type: 'image/jpeg',
    } as any);

    form.append('food_image', {
        uri: params.foodPhotoUri,
        name: 'food.jpg',
        type: 'image/jpeg',
    } as any);

    form.append('meal_type', params.mealType);
    form.append('meal_date', params.mealDate);

    const {data} = await api.post('/meals/analyze', form, {
        headers: {'Content-Type': 'multipart/form-data'},
        timeout: 60000,
    });

    const nutrition = data.nutrition ?? data;
    const calories = Math.round(nutrition.calories ?? nutrition.kcal ?? 0);
    const score = data.score ?? Math.round((data.ai_confidence ?? 0.75) * 100);

    return {
        actualKcal: calories,
        macros: {
            carb: Math.round(nutrition.carbs_g ?? nutrition.carbs ?? nutrition.carbohydrate ?? 0),
            protein: Math.round(nutrition.protein_g ?? nutrition.protein ?? 0),
            fat: Math.round(nutrition.fat_g ?? nutrition.fat ?? 0),
        },
        score,
        foods: (data.foods ?? data.food_names ?? []).map((f: any) => typeof f === 'string' ? f : f.name),
        feedback: getFeedback(score),
    };
}
