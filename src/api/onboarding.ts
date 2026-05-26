export interface LoginResult {
    id: string;
    provider: 'kakao' | 'google';
}

export interface OnboardingSubmission {
    id: string;
    nickname: string;
    age: number;
    gender: 'M' | 'F';
    height: number;
    weight: number;
    activityLevel: 'low' | 'normal' | 'high';
    allergies: string[];
    diseases: string[];
    dietStyle: 'vegetarian' | 'normal' | 'keto';
    preferredIngredients: string[];
    dietGoal: 'lose' | 'maintain' | 'gain';
    tdee: number;
}

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export async function loginWithKakao(): Promise<LoginResult> {
    await delay(900);
    return {id: `kakao_${Date.now()}`, provider: 'kakao'};
}

export async function loginWithGoogle(): Promise<LoginResult> {
    await delay(900);
    return {id: `google_${Date.now()}`, provider: 'google'};
}

export async function submitOnboarding(profile: OnboardingSubmission): Promise<{success: boolean}> {
    await delay(1200);
    return {success: true};
}
