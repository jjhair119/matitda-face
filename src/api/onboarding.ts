import {api} from './client';

// PATCH /users/me — 온보딩 1단계: 기본 신체 정보
export async function saveBasicInfo(params: {
    nickname: string;
    age: number;
    gender: 'M' | 'F';
    height_cm: number;
    weight_kg: number;
    activity_level: 'low' | 'medium' | 'high';
    diet_goal: string;
}): Promise<{user: Record<string, unknown>}> {
    const {data} = await api.patch('/users/me', params);
    return data;
}

// PATCH /users/me/health — 온보딩 2단계: 건강 정보
export async function saveHealthInfo(params: {
    allergies: string[];
    diseases: string[];
    diet_style: '일반' | '채식' | '키토';
}): Promise<void> {
    await api.patch('/users/me/health', params);
}

// PATCH /users/me/preferences — 온보딩 3단계: 선호/비선호 식재료
export async function savePreferences(preferences: {
    ingredient_name: string;
    category: string;
    preference: 'like' | 'dislike';
}[]): Promise<void> {
    await api.patch('/users/me/preferences', {preferences});
}

// GET /users/me — 내 정보 조회
export async function getMyInfo() {
    const {data} = await api.get('/users/me');
    return data;
}
