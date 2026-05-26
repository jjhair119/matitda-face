const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export interface MealAnalysisResult {
    actualKcal: number;
    macros: {carb: number; protein: number; fat: number};
    score: number;
    feedback: string;
}

const FEEDBACKS = [
    '완벽한 식단이에요! 내일도 이렇게 해봐요 💪',
    '훌륭해요! 단백질 섭취가 정말 좋습니다 👍',
    '균형 잡힌 식사네요. 식이섬유도 충분해요 🥗',
    '오늘 식사량이 조금 적었어요. 저녁은 충분히 드세요!',
    '지방 섭취가 살짝 높아요. 조리법을 바꿔보는 건 어떨까요?',
];

export async function analyzeMealPhoto(expectedKcal: number): Promise<MealAnalysisResult> {
    await delay(2200);

    const variance = Math.floor(Math.random() * 80) - 30;
    const actualKcal = Math.max(100, expectedKcal + variance);
    const ratio = actualKcal / expectedKcal;
    const score = Math.min(99, Math.max(62, Math.round(100 - Math.abs(ratio - 1) * 80)));

    return {
        actualKcal,
        macros: {
            carb: Math.round((actualKcal * 0.45) / 4),
            protein: Math.round((actualKcal * 0.3) / 4),
            fat: Math.round((actualKcal * 0.25) / 9),
        },
        score,
        feedback: FEEDBACKS[Math.floor(Math.random() * FEEDBACKS.length)],
    };
}
