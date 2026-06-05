import {api} from './client';

export interface RecipeMeal {
    id: string;
    title: string;
    description?: string;
    ingredients: string[];
    steps: string[];
    nutrition: {calories: number; carbs_g: number; protein_g: number; fat_g: number};
    meal: string;
    meal_label: string;
}

export interface RecipePlanDay {
    day: number;
    meals: RecipeMeal[];
}

export interface SavedRecipe {
    id: string;
    days: number;
    meals: string[];
    prompt?: string;
    plan: {plan: RecipePlanDay[]} | RecipePlanDay[];
    source?: string;
    created_at: string;
}

export async function recommendRecipes(params: {
    days: number;
    meals: string[];
    prompt?: string;
}): Promise<any> {
    const {data} = await api.post('/recipes/recommend', params, {timeout: 60000});
    return data;
}

export async function reviseRecipes(params: {
    current_plan: any;
    prompt: string;
    regenerate_items?: {day: number; meal: string}[];
}): Promise<any> {
    const {data} = await api.post('/recipes/revise', params, {timeout: 60000});
    return data;
}

export async function saveRecipe(params: {
    days: number;
    meals: string[];
    prompt?: string;
    plan: any;
    source?: string;
}): Promise<void> {
    await api.post('/recipes/save', params);
}

export async function getSavedRecipes(): Promise<SavedRecipe[]> {
    const {data} = await api.get('/recipes');
    return data.recipes ?? data ?? [];
}

export async function deleteRecipe(id: string): Promise<void> {
    await api.delete(`/recipes/${id}`);
}

export interface TodayPlanMeal {
    id: string;
    title: string;
    meal: string;
    meal_label: string;
    nutrition: {calories: number; carbs_g: number; protein_g: number; fat_g: number};
}

export interface TodayPlan {
    active: boolean;
    day: number;
    total_days: number;
    current_meal: string;
    meals: TodayPlanMeal[];
}

export async function activateRecipe(id: string): Promise<void> {
    await api.post(`/recipes/${id}/activate`);
}

export async function getTodayPlan(): Promise<TodayPlan> {
    const {data} = await api.get('/recipes/today');
    return data;
}
