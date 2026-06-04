import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'AIRecipeGenerate'>;
type Step = 1 | 2 | 3;
const DURATION_OPTIONS = ['1일', '3일', '7일'] as const;
type Duration = (typeof DURATION_OPTIONS)[number];

const MEAL_OPTIONS = [
    {id: 'breakfast', label: '아침', emoji: '🌅'},
    {id: 'lunch', label: '점심', emoji: '☀️'},
    {id: 'dinner', label: '저녁', emoji: '🌙'},
    {id: 'snack', label: '간식', emoji: '🍪'},
];

const STYLE_OPTIONS = [
    {id: 'low_cal', label: '저칼로리', emoji: '↓'},
    {id: 'high_protein', label: '고단백', emoji: '↑'},
    {id: 'low_carb', label: '저탄수', emoji: '🌾'},
    {id: 'vegan', label: '채식', emoji: '🥦'},
    {id: 'korean', label: '한식', emoji: '🇰🇷'},
    {id: 'western', label: '양식', emoji: '🍽️'},
    {id: 'japanese', label: '일식', emoji: '🍱'},
    {id: 'simple', label: '간편식', emoji: '⚡'},
];

type Recipe = {
    title: string;
    kcal: number;
    cookTime: string;
    difficulty: string;
    ingredients: string[];
    steps: string[];
    nutrition: {protein: number; carb: number; fat: number; fiber: number};
    aiComment: string;
};

type MealPlanDay = {
    breakfast: Recipe;
    lunch: Recipe;
    dinner: Recipe;
    snack: Recipe;
};

const MEAL_PLAN: MealPlanDay[] = [
    // Day 1
    {
        breakfast: {
            title: '고단백 에그 스크램블',
            kcal: 380, cookTime: '15분', difficulty: '쉬움',
            ingredients: ['달걀 2개', '아보카도 1/2개', '방울토마토 5개', '어린잎 채소 1컵', '통밀빵 1조각', '그릭요거트 100g', '올리브오일 1작은술', '소금·후추 약간'],
            steps: ['달걀을 풀어 소금·후추로 간합니다.', '올리브오일 팬에 스크램블 에그를 만듭니다.', '아보카도를 슬라이스하고 토마토를 반으로 자릅니다.', '통밀빵을 살짝 구워 접시에 함께 담습니다.', '그릭요거트를 곁들입니다.'],
            nutrition: {protein: 28, carb: 35, fat: 18, fiber: 6},
            aiComment: '단백질과 건강한 지방이 풍부해 오전 내내 에너지를 유지할 수 있어요! 💪',
        },
        lunch: {
            title: '닭가슴살 샐러드 도시락',
            kcal: 450, cookTime: '20분', difficulty: '쉬움',
            ingredients: ['닭가슴살 150g', '로메인 상추 2줌', '방울토마토 8개', '오이 1/2개', '삶은 달걀 1개', '올리브오일 드레싱 2큰술'],
            steps: ['닭가슴살을 소금·후추로 밑간해 구워줍니다.', '채소를 한 입 크기로 자릅니다.', '달걀을 삶아 반으로 자릅니다.', '모든 재료를 담고 드레싱을 뿌립니다.'],
            nutrition: {protein: 42, carb: 18, fat: 14, fiber: 5},
            aiComment: '저탄수 고단백 조합으로 다이어트에 최적이에요! 🥗',
        },
        dinner: {
            title: '구운 연어 & 브로콜리',
            kcal: 520, cookTime: '25분', difficulty: '보통',
            ingredients: ['연어 필레 150g', '브로콜리 1/2개', '마늘 3쪽', '레몬 1/2개', '올리브오일 1큰술', '허브믹스 약간'],
            steps: ['연어에 소금·후추·허브로 밑간합니다.', '브로콜리를 작게 잘라 올리브오일에 버무립니다.', '180°C 오븐에서 연어 15분, 브로콜리 20분 굽습니다.', '레몬즙을 뿌려 완성합니다.'],
            nutrition: {protein: 38, carb: 15, fat: 26, fiber: 4},
            aiComment: '오메가3가 풍부한 연어로 하루를 마무리해보세요! 🐟',
        },
        snack: {
            title: '아몬드 & 다크초콜릿',
            kcal: 180, cookTime: '0분', difficulty: '쉬움',
            ingredients: ['아몬드 20g', '다크초콜릿 (70%) 20g', '호두 10g'],
            steps: ['아몬드, 호두, 다크초콜릿을 적당량 담아 바로 즐깁니다.'],
            nutrition: {protein: 5, carb: 14, fat: 12, fiber: 3},
            aiComment: '항산화 성분이 풍부한 건강 간식이에요! 🍫',
        },
    },
    // Day 2
    {
        breakfast: {
            title: '오트밀 베리 볼',
            kcal: 320, cookTime: '10분', difficulty: '쉬움',
            ingredients: ['오트밀 50g', '우유 200ml', '블루베리 1/4컵', '딸기 5개', '꿀 1작은술', '치아씨드 1작은술'],
            steps: ['오트밀에 우유를 넣고 전자레인지 2분 가열합니다.', '블루베리와 딸기를 올립니다.', '치아씨드와 꿀을 뿌려 완성합니다.'],
            nutrition: {protein: 12, carb: 52, fat: 6, fiber: 8},
            aiComment: '식이섬유가 풍부해 포만감이 오래 지속돼요! 🫐',
        },
        lunch: {
            title: '현미 채소 비빔밥',
            kcal: 480, cookTime: '25분', difficulty: '보통',
            ingredients: ['현미밥 200g', '시금치 나물 50g', '당근 나물 50g', '콩나물 50g', '달걀 1개', '고추장 1큰술', '참기름 1작은술'],
            steps: ['현미를 미리 삶아둡니다.', '각 나물을 무쳐 준비합니다.', '달걀 프라이를 만듭니다.', '밥 위에 나물과 달걀을 올리고 고추장·참기름으로 비벼 먹습니다.'],
            nutrition: {protein: 16, carb: 72, fat: 10, fiber: 7},
            aiComment: '다양한 채소로 영양소를 균형 있게 섭취할 수 있어요! 🌿',
        },
        dinner: {
            title: '닭가슴살 스테이크 & 샐러드',
            kcal: 480, cookTime: '20분', difficulty: '보통',
            ingredients: ['닭가슴살 200g', '아스파라거스 5줄기', '방울토마토 6개', '발사믹 글레이즈 1큰술', '올리브오일', '소금·후추'],
            steps: ['닭가슴살을 밑간 후 팬에 양면 굽습니다.', '아스파라거스를 올리브오일로 볶습니다.', '모두 담고 발사믹 글레이즈를 뿌립니다.'],
            nutrition: {protein: 45, carb: 12, fat: 18, fiber: 3},
            aiComment: '고단백 저칼로리의 대표 식단이에요! 💪',
        },
        snack: {
            title: '사과 & 땅콩버터',
            kcal: 200, cookTime: '0분', difficulty: '쉬움',
            ingredients: ['사과 1/2개', '땅콩버터 1큰술'],
            steps: ['사과를 슬라이스하고 땅콩버터를 곁들여 먹습니다.'],
            nutrition: {protein: 4, carb: 22, fat: 8, fiber: 3},
            aiComment: '천연 당분과 단백질의 완벽한 조합이에요! 🍎',
        },
    },
    // Day 3
    {
        breakfast: {
            title: '아보카도 토스트',
            kcal: 350, cookTime: '10분', difficulty: '쉬움',
            ingredients: ['통밀빵 2장', '아보카도 1개', '달걀 1개', '레몬즙 약간', '레드페퍼 플레이크', '소금'],
            steps: ['통밀빵을 토스터에 굽습니다.', '아보카도를 으깨고 레몬즙·소금으로 간합니다.', '반숙 달걀 프라이를 만듭니다.', '토스트에 아보카도를 바르고 달걀을 올립니다.'],
            nutrition: {protein: 14, carb: 36, fat: 18, fiber: 7},
            aiComment: '건강한 불포화지방산으로 뇌 건강에도 좋아요! 🥑',
        },
        lunch: {
            title: '두부 스테이크 & 현미밥',
            kcal: 390, cookTime: '20분', difficulty: '쉬움',
            ingredients: ['두부 300g', '현미밥 150g', '깻잎 5장', '간장 2큰술', '마늘 2쪽', '참기름 1작은술'],
            steps: ['두부를 2cm 두께로 썰어 물기를 제거합니다.', '팬에 올리브오일을 두르고 노릇하게 굽습니다.', '간장·마늘 소스를 만들어 두부에 얹습니다.', '현미밥과 함께 냅니다.'],
            nutrition: {protein: 22, carb: 48, fat: 10, fiber: 4},
            aiComment: '식물성 단백질로 가볍고 건강한 점심이에요! 🌱',
        },
        dinner: {
            title: '두부 된장찌개 & 잡곡밥',
            kcal: 350, cookTime: '20분', difficulty: '쉬움',
            ingredients: ['두부 200g', '애호박 1/3개', '감자 1/2개', '된장 2큰술', '대파 1/3대', '잡곡밥 150g'],
            steps: ['다시마 육수를 끓입니다.', '된장을 풀어 넣습니다.', '두부·감자·애호박을 넣고 끓입니다.', '대파를 넣어 마무리합니다.'],
            nutrition: {protein: 18, carb: 42, fat: 8, fiber: 5},
            aiComment: '발효 식품으로 장 건강도 챙기는 건강식이에요! 🫘',
        },
        snack: {
            title: '그릭요거트 & 꿀',
            kcal: 120, cookTime: '0분', difficulty: '쉬움',
            ingredients: ['그릭요거트 150g', '꿀 1작은술', '그래놀라 20g'],
            steps: ['그릭요거트에 꿀과 그래놀라를 올려 바로 먹습니다.'],
            nutrition: {protein: 12, carb: 16, fat: 3, fiber: 1},
            aiComment: '프로바이오틱스로 소화 건강을 챙겨보세요! 🥛',
        },
    },
    // Day 4
    {
        breakfast: {
            title: '그릭요거트 그래놀라 파르페',
            kcal: 290, cookTime: '5분', difficulty: '쉬움',
            ingredients: ['그릭요거트 200g', '그래놀라 40g', '블루베리 30g', '키위 1/2개', '꿀 1작은술'],
            steps: ['컵에 그릭요거트를 담습니다.', '그래놀라와 과일을 층층이 올립니다.', '꿀을 뿌려 완성합니다.'],
            nutrition: {protein: 16, carb: 38, fat: 6, fiber: 4},
            aiComment: '색깔 예쁜 파르페로 아침을 활기차게 시작해요! 🍓',
        },
        lunch: {
            title: '퀴노아 채소 볼',
            kcal: 420, cookTime: '25분', difficulty: '보통',
            ingredients: ['퀴노아 80g', '구운 고구마 100g', '삶은 병아리콩 50g', '아루굴라 1줌', '레몬 타히니 드레싱 2큰술'],
            steps: ['퀴노아를 삶아 식힙니다.', '고구마를 큐브로 썰어 오븐에 굽습니다.', '모든 재료를 볼에 담고 드레싱을 뿌립니다.'],
            nutrition: {protein: 18, carb: 58, fat: 12, fiber: 9},
            aiComment: '완전 단백질 퀴노아로 영양 균형을 완성해요! 🌾',
        },
        dinner: {
            title: '새우 볶음밥',
            kcal: 460, cookTime: '20분', difficulty: '보통',
            ingredients: ['새우 150g', '현미밥 200g', '달걀 2개', '대파 1/2대', '당근 40g', '냉동 완두콩 30g', '간장 1큰술'],
            steps: ['달걀을 스크램블합니다.', '새우를 볶아 익힙니다.', '채소를 볶다가 밥을 넣고 함께 볶습니다.', '간장으로 간하고 대파를 넣어 마무리합니다.'],
            nutrition: {protein: 32, carb: 52, fat: 12, fiber: 3},
            aiComment: '단백질 풍부한 새우로 맛있게 저녁을 즐겨요! 🍤',
        },
        snack: {
            title: '견과류 믹스',
            kcal: 210, cookTime: '0분', difficulty: '쉬움',
            ingredients: ['아몬드 15g', '호두 10g', '캐슈너트 10g', '해바라기씨 5g'],
            steps: ['견과류를 한 줌 덜어 바로 먹습니다.'],
            nutrition: {protein: 6, carb: 10, fat: 16, fiber: 2},
            aiComment: '뇌 건강에 좋은 오메가3가 풍부해요! 🧠',
        },
    },
    // Day 5
    {
        breakfast: {
            title: '치아씨드 스무디 볼',
            kcal: 310, cookTime: '10분', difficulty: '쉬움',
            ingredients: ['냉동 망고 100g', '바나나 1/2개', '코코넛 밀크 100ml', '치아씨드 1큰술', '코코넛 플레이크 10g', '키위 슬라이스'],
            steps: ['망고·바나나·코코넛 밀크를 블렌더에 갑니다.', '볼에 담고 치아씨드·코코넛·키위를 올립니다.'],
            nutrition: {protein: 8, carb: 48, fat: 10, fiber: 8},
            aiComment: '열대 과일로 상큼하게 하루를 시작해요! 🥭',
        },
        lunch: {
            title: '고구마 닭가슴살 도시락',
            kcal: 500, cookTime: '30분', difficulty: '보통',
            ingredients: ['닭가슴살 150g', '고구마 150g', '브로콜리 80g', '현미밥 100g', '소금·후추·허브'],
            steps: ['닭가슴살을 허브로 밑간해 굽습니다.', '고구마를 삶습니다.', '브로콜리를 데칩니다.', '도시락 통에 현미밥과 함께 담습니다.'],
            nutrition: {protein: 38, carb: 55, fat: 8, fiber: 6},
            aiComment: '완벽한 영양 밸런스의 클린 도시락이에요! 🍱',
        },
        dinner: {
            title: '삼치 구이 & 나물 정식',
            kcal: 400, cookTime: '25분', difficulty: '보통',
            ingredients: ['삼치 1토막', '시금치 나물 80g', '도라지 나물 50g', '잡곡밥 150g', '된장국 1그릇'],
            steps: ['삼치에 소금을 뿌려 10분 두었다가 굽습니다.', '시금치와 도라지를 각각 무칩니다.', '된장국을 끓입니다.', '잡곡밥과 함께 담습니다.'],
            nutrition: {protein: 30, carb: 40, fat: 14, fiber: 5},
            aiComment: '전통 한식으로 영양 균형을 맞춘 저녁이에요! 🐟',
        },
        snack: {
            title: '바나나 프로틴 쉐이크',
            kcal: 240, cookTime: '5분', difficulty: '쉬움',
            ingredients: ['바나나 1개', '단백질 파우더 1스쿱', '우유 200ml', '아몬드버터 1작은술'],
            steps: ['모든 재료를 블렌더에 넣고 갑니다.', '컵에 담아 바로 마십니다.'],
            nutrition: {protein: 22, carb: 28, fat: 6, fiber: 2},
            aiComment: '운동 후 근육 회복에 완벽한 간식이에요! 💪',
        },
    },
    // Day 6
    {
        breakfast: {
            title: '두부 스크램블 토스트',
            kcal: 280, cookTime: '15분', difficulty: '쉬움',
            ingredients: ['두부 200g', '강황 1/4작은술', '파프리카 1/2개', '양파 1/4개', '통밀빵 2장', '올리브오일'],
            steps: ['두부를 으깨 강황·소금으로 간합니다.', '채소를 잘게 썰어 올리브오일에 볶습니다.', '두부를 넣고 함께 볶습니다.', '구운 통밀빵에 올려 냅니다.'],
            nutrition: {protein: 18, carb: 30, fat: 10, fiber: 5},
            aiComment: '비건 스크램블로 콜레스테롤 없이 단백질을 섭취해요! 🌱',
        },
        lunch: {
            title: '연어 포케 볼',
            kcal: 460, cookTime: '15분', difficulty: '쉬움',
            ingredients: ['생연어 120g', '현미밥 150g', '에다마메 50g', '오이 40g', '아보카도 1/2개', '포케 소스 2큰술'],
            steps: ['연어를 한 입 크기로 자릅니다.', '볼에 현미밥을 담습니다.', '연어와 모든 토핑을 올립니다.', '포케 소스를 뿌립니다.'],
            nutrition: {protein: 32, carb: 48, fat: 16, fiber: 5},
            aiComment: '하와이안 포케로 특별한 점심을 즐겨요! 🌺',
        },
        dinner: {
            title: '소고기 채소 볶음 & 잡곡밥',
            kcal: 510, cookTime: '25분', difficulty: '보통',
            ingredients: ['소고기 (우둔살) 120g', '파프리카 1개', '버섯 100g', '브로콜리 80g', '굴소스 1큰술', '잡곡밥 150g'],
            steps: ['소고기를 얇게 썰어 밑간합니다.', '센 불에 소고기를 먼저 볶습니다.', '채소를 넣고 굴소스로 간합니다.', '잡곡밥과 함께 냅니다.'],
            nutrition: {protein: 34, carb: 45, fat: 18, fiber: 5},
            aiComment: '철분 풍부한 소고기로 활력 있는 저녁이에요! 🥩',
        },
        snack: {
            title: '두부 과자 & 낫또',
            kcal: 160, cookTime: '5분', difficulty: '쉬움',
            ingredients: ['두부 과자 30g', '낫또 1팩 (50g)', '간장 1작은술'],
            steps: ['낫또를 간장과 함께 섞습니다.', '두부 과자와 함께 냅니다.'],
            nutrition: {protein: 10, carb: 14, fat: 6, fiber: 2},
            aiComment: '발효 식품 낫또로 장 건강을 챙겨보세요! 🫘',
        },
    },
    // Day 7
    {
        breakfast: {
            title: '연어 크림치즈 베이글',
            kcal: 420, cookTime: '10분', difficulty: '쉬움',
            ingredients: ['통밀 베이글 1개', '훈제 연어 80g', '크림치즈 30g', '케이퍼 1작은술', '적양파 슬라이스', '딜 약간'],
            steps: ['베이글을 반으로 잘라 살짝 굽습니다.', '크림치즈를 바릅니다.', '훈제 연어, 적양파, 케이퍼, 딜을 올립니다.'],
            nutrition: {protein: 26, carb: 44, fat: 14, fiber: 3},
            aiComment: '브런치 카페 부럽지 않은 특별한 아침이에요! 🥯',
        },
        lunch: {
            title: '채소 볶음 현미밥',
            kcal: 440, cookTime: '20분', difficulty: '쉬움',
            ingredients: ['현미밥 200g', '달걀 2개', '케일 30g', '당근 40g', '양파 1/4개', '표고버섯 50g', '간장 1큰술'],
            steps: ['달걀을 스크램블합니다.', '채소를 순서대로 볶습니다.', '밥을 넣고 간장으로 간합니다.', '달걀과 함께 섞어 완성합니다.'],
            nutrition: {protein: 18, carb: 58, fat: 10, fiber: 6},
            aiComment: '냉장고 속 채소를 활용한 알찬 한 끼예요! 🥬',
        },
        dinner: {
            title: '닭가슴살 카레 & 현미밥',
            kcal: 490, cookTime: '30분', difficulty: '보통',
            ingredients: ['닭가슴살 150g', '감자 1개', '당근 1/2개', '양파 1/2개', '카레 루 2조각', '현미밥 150g'],
            steps: ['닭가슴살과 채소를 한 입 크기로 자릅니다.', '올리브오일에 채소를 볶습니다.', '닭가슴살과 물을 넣고 끓입니다.', '카레 루를 넣고 걸쭉해질 때까지 끓입니다.'],
            nutrition: {protein: 36, carb: 55, fat: 12, fiber: 5},
            aiComment: '강황의 항염 효과로 건강하게 마무리해요! 🍛',
        },
        snack: {
            title: '당근 & 후무스 디핑',
            kcal: 150, cookTime: '0분', difficulty: '쉬움',
            ingredients: ['당근 스틱 100g', '셀러리 50g', '후무스 40g'],
            steps: ['당근과 셀러리를 스틱으로 자릅니다.', '후무스에 찍어 먹습니다.'],
            nutrition: {protein: 5, carb: 18, fat: 6, fiber: 5},
            aiComment: '식이섬유와 식물성 단백질의 건강한 조합이에요! 🥕',
        },
    },
];

const MEAL_ID_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

// ─── StepIndicator ───────────────────────────────────────────────
function StepIndicator({step}: {step: Step}) {
    const steps = [{num: 1, label: '설정'}, {num: 2, label: '생성 중'}, {num: 3, label: '결과'}];
    return (
        <View style={ind.container}>
            {steps.map((s, i) => {
                const done = step > s.num;
                const active = step === s.num;
                return (
                    <React.Fragment key={s.num}>
                        <View style={ind.item}>
                            <View style={[ind.circle, active && ind.circleActive, done && ind.circleDone]}>
                                <Text style={[ind.circleText, (active || done) && ind.circleTextActive]}>
                                    {done ? '✓' : s.num}
                                </Text>
                            </View>
                            <Text style={[ind.label, (active || done) && ind.labelActive]}>{s.label}</Text>
                        </View>
                        {i < steps.length - 1 && <View style={[ind.line, step > s.num && ind.lineDone]}/>}
                    </React.Fragment>
                );
            })}
        </View>
    );
}

const ind = StyleSheet.create({
    container: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16},
    item: {alignItems: 'center', gap: 4},
    circle: {width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center'},
    circleActive: {backgroundColor: colors.accent, borderColor: colors.accent},
    circleDone: {backgroundColor: colors.accent, borderColor: colors.accent},
    circleText: {fontSize: 12, color: colors.sub, fontWeight: '600'},
    circleTextActive: {color: '#111'},
    label: {fontSize: 10, color: colors.sub},
    labelActive: {color: colors.accent, fontWeight: '600'},
    line: {width: 48, height: 1, backgroundColor: colors.border, marginBottom: 14, marginHorizontal: 4},
    lineDone: {backgroundColor: colors.accent},
});

// ─── SettingStep ──────────────────────────────────────────────────
function SettingStep({duration, setDuration, meals, toggleMeal, styles: selectedStyles, toggleStyle, excluded, setExcluded, requests, setRequests}: {
    duration: Duration; setDuration: (d: Duration) => void;
    meals: string[]; toggleMeal: (id: string) => void;
    styles: string[]; toggleStyle: (id: string) => void;
    excluded: string; setExcluded: (v: string) => void;
    requests: string; setRequests: (v: string) => void;
}) {
    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
            <Text style={f.sectionLabel}>기간 선택</Text>
            <View style={f.chipRow}>
                {DURATION_OPTIONS.map(d => (
                    <TouchableOpacity key={d} style={[f.durationChip, duration === d && f.durationChipActive]} onPress={() => setDuration(d)}>
                        <Text style={[f.durationChipText, duration === d && f.durationChipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={f.sectionLabel}>식사 선택</Text>
            <View style={f.chipRow}>
                {MEAL_OPTIONS.map(m => {
                    const on = meals.includes(m.id);
                    return (
                        <TouchableOpacity key={m.id} style={[f.mealChip, on && f.mealChipActive]} onPress={() => toggleMeal(m.id)}>
                            <Text style={f.mealEmoji}>{m.emoji}</Text>
                            <Text style={[f.mealChipText, on && f.mealChipTextActive]}>{m.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={f.sectionLabel}>선호하는 스타일 <Text style={f.optional}>(선택)</Text></Text>
            <View style={f.styleGrid}>
                {STYLE_OPTIONS.map(o => {
                    const on = selectedStyles.includes(o.id);
                    return (
                        <TouchableOpacity key={o.id} style={[f.styleChip, on && f.styleChipActive]} onPress={() => toggleStyle(o.id)}>
                            <Text style={f.styleChipText}>{o.emoji} {o.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={f.sectionLabel}>제외하고 싶은 식재료 <Text style={f.optional}>(선택)</Text></Text>
            <View style={f.inputBox}>
                <TextInput style={f.input} placeholder="예: 양파, 고수, 견과류 등" placeholderTextColor={colors.sub} value={excluded} onChangeText={v => setExcluded(v.slice(0, 100))} multiline/>
                <Text style={f.charCount}>{excluded.length}/100</Text>
            </View>

            <Text style={f.sectionLabel}>추가 요청사항 <Text style={f.optional}>(선택)</Text></Text>
            <View style={f.inputBox}>
                <TextInput style={f.input} placeholder="예: 매운 음식은 피해주세요, 아이도 먹을 수 있는" placeholderTextColor={colors.sub} value={requests} onChangeText={v => setRequests(v.slice(0, 100))} multiline/>
                <Text style={f.charCount}>{requests.length}/100</Text>
            </View>
        </ScrollView>
    );
}

const f = StyleSheet.create({
    sectionLabel: {fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 10, marginTop: 18},
    optional: {fontSize: 12, fontWeight: '400', color: colors.sub},
    chipRow: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
    durationChip: {paddingHorizontal: 20, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2},
    durationChipActive: {borderColor: colors.accent, backgroundColor: 'rgba(184,255,78,0.12)'},
    durationChipText: {fontSize: 14, color: colors.sub, fontWeight: '500'},
    durationChipTextActive: {color: colors.accent, fontWeight: '700'},
    mealChip: {flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2},
    mealChipActive: {borderColor: colors.accent, backgroundColor: 'rgba(184,255,78,0.12)'},
    mealEmoji: {fontSize: 16},
    mealChipText: {fontSize: 13, color: colors.sub, fontWeight: '500'},
    mealChipTextActive: {color: colors.accent, fontWeight: '700'},
    styleGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    styleChip: {paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2},
    styleChipActive: {borderColor: colors.accent, backgroundColor: 'rgba(184,255,78,0.12)'},
    styleChipText: {fontSize: 12, color: colors.sub},
    inputBox: {backgroundColor: colors.surface2, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12, minHeight: 72},
    input: {color: colors.text, fontSize: 13, minHeight: 44},
    charCount: {fontSize: 10, color: colors.sub, textAlign: 'right', marginTop: 4},
});

// ─── GeneratingStep ───────────────────────────────────────────────
function GeneratingStep() {
    const glowAnim = useRef(new Animated.Value(0.4)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(glowAnim, {toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
            Animated.timing(glowAnim, {toValue: 0.4, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        ])).start();
        Animated.timing(progressAnim, {toValue: 1, duration: 3000, easing: Easing.out(Easing.quad), useNativeDriver: false}).start();
    }, [glowAnim, progressAnim]);

    return (
        <View style={g.container}>
            <Animated.View style={[g.iconWrap, {opacity: glowAnim}]}>
                <Text style={g.icon}>👨‍🍳</Text>
            </Animated.View>
            <Text style={g.title}>AI가 맞춤 레시피를{'\n'}생성하고 있어요...</Text>
            <View style={g.progressTrack}>
                <Animated.View style={[g.progressFill, {width: progressAnim.interpolate({inputRange: [0, 1], outputRange: ['0%', '85%']})}]}/>
            </View>
            <Text style={g.sub}>영양 밸런스와 취향을 고려하여{'\n'}최적의 레시피를 추천해드릴게요!{'\n'}잠시만 기다려주세요 😊</Text>
        </View>
    );
}

const g = StyleSheet.create({
    container: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
    iconWrap: {width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(184,255,78,0.1)', borderWidth: 2, borderColor: 'rgba(184,255,78,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 28},
    icon: {fontSize: 52},
    title: {fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 24, lineHeight: 26},
    progressTrack: {width: '100%', height: 6, backgroundColor: colors.surface2, borderRadius: 3, overflow: 'hidden', marginBottom: 24},
    progressFill: {height: '100%', backgroundColor: colors.accent, borderRadius: 3},
    sub: {fontSize: 13, color: colors.sub, textAlign: 'center', lineHeight: 20},
});

// ─── RecipeCard (expandable) ──────────────────────────────────────
const MEAL_COLORS: Record<string, string> = {
    breakfast: 'rgba(251,191,36,0.15)',
    lunch: 'rgba(78,201,255,0.12)',
    dinner: 'rgba(52,211,153,0.12)',
    snack: 'rgba(184,255,78,0.1)',
};
const MEAL_BORDER: Record<string, string> = {
    breakfast: 'rgba(251,191,36,0.35)',
    lunch: 'rgba(78,201,255,0.3)',
    dinner: 'rgba(52,211,153,0.3)',
    snack: 'rgba(184,255,78,0.3)',
};
const MEAL_TEXT_COLOR: Record<string, string> = {
    breakfast: colors.amber,
    lunch: colors.accent3,
    dinner: colors.teal,
    snack: colors.accent,
};

function RecipeCard({mealId, recipe}: {mealId: string; recipe: Recipe}) {
    const [expanded, setExpanded] = useState(false);
    const [tab, setTab] = useState<'recipe' | 'nutrition'>('recipe');
    const mealInfo = MEAL_OPTIONS.find(m => m.id === mealId)!;
    const textColor = MEAL_TEXT_COLOR[mealId];

    return (
        <View style={[rc.card, {borderColor: MEAL_BORDER[mealId], backgroundColor: colors.surface2}]}>
            {/* 카드 헤더 */}
            <TouchableOpacity style={rc.cardHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
                <View style={[rc.mealBadge, {backgroundColor: MEAL_COLORS[mealId]}]}>
                    <Text style={rc.mealEmoji}>{mealInfo.emoji}</Text>
                    <Text style={[rc.mealLabel, {color: textColor}]}>{mealInfo.label}</Text>
                </View>
                <View style={rc.cardInfo}>
                    <Text style={rc.cardTitle} numberOfLines={expanded ? undefined : 1}>{recipe.title}</Text>
                    <View style={rc.cardMeta}>
                        <Text style={rc.cardMetaText}>🔥 {recipe.kcal}kcal</Text>
                        <Text style={rc.cardMetaDot}>·</Text>
                        <Text style={rc.cardMetaText}>⏱ {recipe.cookTime}</Text>
                        <Text style={rc.cardMetaDot}>·</Text>
                        <Text style={rc.cardMetaText}>{recipe.difficulty}</Text>
                    </View>
                </View>
                <Text style={[rc.expandIcon, {color: textColor}]}>{expanded ? '▲' : '▽'}</Text>
            </TouchableOpacity>

            {/* 확장 콘텐츠 */}
            {expanded && (
                <View style={rc.expandedContent}>
                    {/* 탭 */}
                    <View style={rc.tabRow}>
                        <TouchableOpacity style={[rc.tab, tab === 'recipe' && rc.tabActive]} onPress={() => setTab('recipe')}>
                            <Text style={[rc.tabText, tab === 'recipe' && rc.tabTextActive]}>레시피 정보</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[rc.tab, tab === 'nutrition' && rc.tabActive]} onPress={() => setTab('nutrition')}>
                            <Text style={[rc.tabText, tab === 'nutrition' && rc.tabTextActive]}>영양 정보</Text>
                        </TouchableOpacity>
                    </View>

                    {tab === 'recipe' ? (
                        <View>
                            <Text style={rc.sectionTitle}>재료 (1인분)</Text>
                            <View style={rc.ingredientsGrid}>
                                {recipe.ingredients.map((ing, i) => (
                                    <Text key={i} style={rc.ingredient}>• {ing}</Text>
                                ))}
                            </View>
                            <Text style={[rc.sectionTitle, {marginTop: 12}]}>조리 순서</Text>
                            {recipe.steps.map((step, i) => (
                                <View key={i} style={rc.stepRow}>
                                    <View style={[rc.stepNum, {backgroundColor: MEAL_COLORS[mealId]}]}>
                                        <Text style={[rc.stepNumText, {color: textColor}]}>{i + 1}</Text>
                                    </View>
                                    <Text style={rc.stepText}>{step}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View>
                            <Text style={rc.sectionTitle}>영양 성분</Text>
                            {[
                                {label: '단백질', value: recipe.nutrition.protein, color: colors.teal},
                                {label: '탄수화물', value: recipe.nutrition.carb, color: colors.accent3},
                                {label: '지방', value: recipe.nutrition.fat, color: colors.amber},
                                {label: '식이섬유', value: recipe.nutrition.fiber, color: colors.sub},
                            ].map(n => (
                                <View key={n.label} style={rc.nutritionRow}>
                                    <Text style={rc.nutritionLabel}>{n.label}</Text>
                                    <View style={rc.nutritionTrack}>
                                        <View style={[rc.nutritionFill, {width: `${Math.min(100, (n.value / 50) * 100)}%` as any, backgroundColor: n.color}]}/>
                                    </View>
                                    <Text style={rc.nutritionValue}>{n.value}g</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* AI 코멘트 */}
                    <View style={rc.commentBox}>
                        <Text style={rc.commentText}>🤖 {recipe.aiComment}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const rc = StyleSheet.create({
    card: {borderRadius: 14, borderWidth: 1, marginBottom: 8, overflow: 'hidden'},
    cardHeader: {flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10},
    mealBadge: {width: 52, paddingVertical: 6, borderRadius: 10, alignItems: 'center', gap: 2},
    mealEmoji: {fontSize: 18},
    mealLabel: {fontSize: 10, fontWeight: '700'},
    cardInfo: {flex: 1},
    cardTitle: {fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4},
    cardMeta: {flexDirection: 'row', alignItems: 'center', gap: 4},
    cardMetaText: {fontSize: 11, color: colors.sub},
    cardMetaDot: {fontSize: 10, color: colors.border},
    expandIcon: {fontSize: 12, fontWeight: '700'},
    expandedContent: {paddingHorizontal: 12, paddingBottom: 12},
    tabRow: {flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 8, padding: 2, marginBottom: 12},
    tab: {flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6},
    tabActive: {backgroundColor: colors.surface2},
    tabText: {fontSize: 12, color: colors.sub},
    tabTextActive: {color: colors.text, fontWeight: '600'},
    sectionTitle: {fontSize: 11, fontWeight: '600', color: colors.sub, marginBottom: 8, letterSpacing: 0.3},
    ingredientsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 2},
    ingredient: {width: '50%', fontSize: 12, color: colors.text, marginBottom: 3, lineHeight: 18},
    stepRow: {flexDirection: 'row', gap: 8, marginBottom: 8},
    stepNum: {width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1},
    stepNumText: {fontSize: 10, fontWeight: '700'},
    stepText: {flex: 1, fontSize: 12, color: colors.text, lineHeight: 18},
    nutritionRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
    nutritionLabel: {width: 52, fontSize: 11, color: colors.sub},
    nutritionTrack: {flex: 1, height: 5, backgroundColor: colors.surface, borderRadius: 3, overflow: 'hidden'},
    nutritionFill: {height: '100%', borderRadius: 3},
    nutritionValue: {width: 32, fontSize: 11, color: colors.text, textAlign: 'right'},
    commentBox: {marginTop: 10, padding: 10, backgroundColor: colors.surface, borderRadius: 8},
    commentText: {fontSize: 12, color: colors.sub, lineHeight: 18},
});

// ─── ResultStep ───────────────────────────────────────────────────
function ResultStep({duration, meals, onRegenerate}: {
    duration: Duration;
    meals: string[];
    onRegenerate: () => void;
}) {
    const [modifyText, setModifyText] = useState('');
    const [liked, setLiked] = useState(false);

    const dayCount = duration === '1일' ? 1 : duration === '3일' ? 3 : 7;
    const orderedMeals = MEAL_ID_ORDER.filter(m => meals.includes(m));
    const totalMeals = dayCount * orderedMeals.length;

    const totalKcal = Array.from({length: dayCount}).reduce<number>((sum, _, di) => {
        const day = MEAL_PLAN[di];
        return sum + orderedMeals.reduce((s, m) => s + day[m as keyof MealPlanDay].kcal, 0);
    }, 0);
    const avgKcal = Math.round(totalKcal / dayCount);

    const mealLabels = orderedMeals.map(m => MEAL_OPTIONS.find(o => o.id === m)!.label).join(' · ');

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
            {/* 요약 헤더 */}
            <View style={rs.summaryCard}>
                <View style={rs.summaryBadgeRow}>
                    <View style={rs.badge}>
                        <Text style={rs.badgeText}>{duration}</Text>
                    </View>
                    {orderedMeals.map(m => {
                        const info = MEAL_OPTIONS.find(o => o.id === m)!;
                        return (
                            <View key={m} style={[rs.badge, {backgroundColor: MEAL_COLORS[m], borderColor: MEAL_BORDER[m]}]}>
                                <Text style={[rs.badgeText, {color: MEAL_TEXT_COLOR[m]}]}>{info.emoji} {info.label}</Text>
                            </View>
                        );
                    })}
                </View>
                <View style={rs.summaryStats}>
                    <View style={rs.summaryStatItem}>
                        <Text style={rs.summaryStatValue}>{totalMeals}</Text>
                        <Text style={rs.summaryStatLabel}>총 식단 수</Text>
                    </View>
                    <View style={rs.summaryDivider}/>
                    <View style={rs.summaryStatItem}>
                        <Text style={rs.summaryStatValue}>{avgKcal}</Text>
                        <Text style={rs.summaryStatLabel}>일 평균 kcal</Text>
                    </View>
                    <View style={rs.summaryDivider}/>
                    <View style={rs.summaryStatItem}>
                        <Text style={rs.summaryStatValue}>{orderedMeals.length}끼</Text>
                        <Text style={rs.summaryStatLabel}>하루 식사</Text>
                    </View>
                </View>
            </View>

            {/* 일차별 식단 */}
            {Array.from({length: dayCount}).map((_, dayIndex) => {
                const day = MEAL_PLAN[dayIndex];
                const dayKcal = orderedMeals.reduce((s, m) => s + day[m as keyof MealPlanDay].kcal, 0);
                return (
                    <View key={dayIndex} style={rs.daySection}>
                        <View style={rs.dayHeader}>
                            <Text style={rs.dayTitle}>{dayIndex + 1}일차</Text>
                            <Text style={rs.dayKcal}>🔥 {dayKcal} kcal</Text>
                        </View>
                        {orderedMeals.map(mealId => (
                            <RecipeCard key={mealId} mealId={mealId} recipe={day[mealId as keyof MealPlanDay]}/>
                        ))}
                    </View>
                );
            })}

            {/* 액션 버튼 */}
            <View style={rs.actionRow}>
                <TouchableOpacity style={rs.saveBtn}>
                    <Text style={rs.saveBtnText}>🔖 전체 저장하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={rs.buyBtn}>
                    <Text style={rs.buyBtnText}>🛒 식재료 구매</Text>
                </TouchableOpacity>
            </View>

            {/* 피드백 */}
            <View style={rs.feedbackCard}>
                <Text style={rs.feedbackTitle}>이 식단 플랜이 마음에 드시나요?</Text>
                <View style={rs.feedbackRow}>
                    <TouchableOpacity style={[rs.feedbackBtn, liked && rs.feedbackBtnActive]} onPress={() => setLiked(true)}>
                        <Text style={rs.feedbackBtnText}>👍 마음에 들어요</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={rs.regenBtn} onPress={onRegenerate}>
                        <Text style={rs.regenBtnText}>🔄 다시 생성하기</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 수정하기 */}
            <View style={rs.modifyCard}>
                <Text style={rs.modifyTitle}>식단 수정 요청하기</Text>
                <Text style={rs.modifySub}>원하는 변경사항을 입력해주세요.</Text>
                <View style={rs.inputBox}>
                    <TextInput style={rs.input} placeholder="예: 탄수화물을 줄이고 싶어요, 유제품 빼주세요" placeholderTextColor={colors.sub} value={modifyText} onChangeText={v => setModifyText(v.slice(0, 100))} multiline/>
                    <Text style={rs.charCount}>{modifyText.length}/100</Text>
                </View>
                <TouchableOpacity style={rs.modifyBtn}>
                    <Text style={rs.modifyBtnText}>✦ 수정 적용하기</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const rs = StyleSheet.create({
    summaryCard: {backgroundColor: colors.surface2, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border},
    summaryBadgeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12},
    badge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(184,255,78,0.12)', borderWidth: 1, borderColor: 'rgba(184,255,78,0.3)'},
    badgeText: {fontSize: 11, color: colors.accent, fontWeight: '600'},
    summaryStats: {flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 10, padding: 12},
    summaryStatItem: {flex: 1, alignItems: 'center'},
    summaryDivider: {width: 1, backgroundColor: colors.border, marginVertical: 2},
    summaryStatValue: {fontSize: 16, fontWeight: '700', color: colors.accent, marginBottom: 2},
    summaryStatLabel: {fontSize: 10, color: colors.sub},
    daySection: {marginBottom: 16},
    dayHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
    dayTitle: {fontSize: 15, fontWeight: '700', color: colors.text},
    dayKcal: {fontSize: 12, color: colors.sub},
    actionRow: {flexDirection: 'row', gap: 8, marginBottom: 10},
    saveBtn: {flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(184,255,78,0.35)', backgroundColor: 'rgba(184,255,78,0.08)', alignItems: 'center', justifyContent: 'center'},
    saveBtnText: {fontSize: 12, color: colors.accent, fontWeight: '600'},
    buyBtn: {flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center'},
    buyBtnText: {fontSize: 12, color: colors.text, fontWeight: '600'},
    feedbackCard: {backgroundColor: colors.surface2, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border},
    feedbackTitle: {fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 10},
    feedbackRow: {flexDirection: 'row', gap: 8},
    feedbackBtn: {flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center'},
    feedbackBtnActive: {borderColor: colors.accent, backgroundColor: 'rgba(184,255,78,0.12)'},
    feedbackBtnText: {fontSize: 12, color: colors.text, fontWeight: '600'},
    regenBtn: {flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center'},
    regenBtnText: {fontSize: 12, color: colors.text, fontWeight: '600'},
    modifyCard: {backgroundColor: colors.surface2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border},
    modifyTitle: {fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4},
    modifySub: {fontSize: 11, color: colors.sub, marginBottom: 10},
    inputBox: {backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 10, minHeight: 64, marginBottom: 10},
    input: {color: colors.text, fontSize: 13, minHeight: 40},
    charCount: {fontSize: 10, color: colors.sub, textAlign: 'right', marginTop: 2},
    modifyBtn: {height: 44, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center'},
    modifyBtnText: {fontSize: 14, fontWeight: '700', color: '#111'},
});

// ─── Main Screen ──────────────────────────────────────────────────
export function AIRecipeGenerateScreen({navigation}: Props) {
    const [step, setStep] = useState<Step>(1);
    const [duration, setDuration] = useState<Duration>('1일');
    const [meals, setMeals] = useState<string[]>(['breakfast']);
    const [styleIds, setStyleIds] = useState<string[]>([]);
    const [excluded, setExcluded] = useState('');
    const [requests, setRequests] = useState('');

    const toggleMeal = (id: string) => setMeals(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    const toggleStyle = (id: string) => setStyleIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

    const handleGenerate = () => {
        setStep(2);
        setTimeout(() => setStep(3), 3200);
    };

    return (
        <SafeAreaView style={main.container} edges={['top', 'left', 'right']}>
            <View style={main.header}>
                <TouchableOpacity onPress={() => { if (step === 1) navigation.goBack(); else setStep(s => (s - 1) as Step); }}>
                    <Text style={main.backBtn}>←</Text>
                </TouchableOpacity>
                <Text style={main.title}>{step === 3 ? 'AI 레시피 결과' : 'AI 레시피 생성'}</Text>
                {step === 3 ? (
                    <View style={main.headerRight}>
                        <TouchableOpacity style={main.iconBtn}><Text style={main.iconBtnText}>☆</Text></TouchableOpacity>
                        <TouchableOpacity style={main.iconBtn}><Text style={main.iconBtnText}>≡</Text></TouchableOpacity>
                    </View>
                ) : (
                    <View style={main.headerRight}/>
                )}
            </View>

            {step !== 3 && <StepIndicator step={step}/>}

            <View style={main.content}>
                {step === 1 && (
                    <SettingStep
                        duration={duration} setDuration={setDuration}
                        meals={meals} toggleMeal={toggleMeal}
                        styles={styleIds} toggleStyle={toggleStyle}
                        excluded={excluded} setExcluded={setExcluded}
                        requests={requests} setRequests={setRequests}
                    />
                )}
                {step === 2 && <GeneratingStep/>}
                {step === 3 && <ResultStep duration={duration} meals={meals} onRegenerate={handleGenerate}/>}
            </View>

            {step === 1 && (
                <View style={main.footer}>
                    <TouchableOpacity
                        style={[main.generateBtn, meals.length === 0 && main.generateBtnDisabled]}
                        onPress={handleGenerate}
                        disabled={meals.length === 0}>
                        <Text style={main.generateBtnText}>✦ AI 레시피 생성하기</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const main = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderBottomWidth: 1, borderBottomColor: colors.border},
    backBtn: {fontSize: 22, color: colors.text, marginRight: 10},
    title: {flex: 1, fontSize: 17, fontWeight: '700', color: colors.text},
    headerRight: {flexDirection: 'row', gap: 4, width: 72, justifyContent: 'flex-end'},
    iconBtn: {width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border},
    iconBtnText: {fontSize: 16, color: colors.text},
    content: {flex: 1, paddingHorizontal: 16},
    footer: {height: 68, paddingHorizontal: 8, alignItems: 'stretch', justifyContent: 'center', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg},
    generateBtn: {height: 52, width: '100%', borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center'},
    generateBtnDisabled: {backgroundColor: colors.surface2},
    generateBtnText: {fontSize: 15, fontWeight: '700', color: '#111'},
});
