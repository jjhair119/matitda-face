import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'RecipeDetail'>;

type Recipe = {
    id: string;
    emoji: string;
    title: string;
    kcal: number;
    cookTime: string;
    difficulty: string;
    nutrition: {protein: number; carb: number; fat: number; fiber: number};
    ingredients: string[];
    steps: string[];
    tip?: string;
};

const RECIPES: Record<string, Recipe> = {
    '1': {
        id: '1',
        emoji: '🍝',
        title: '닭가슴살 토마토 파스타',
        kcal: 510,
        cookTime: '25분',
        difficulty: '보통',
        nutrition: {protein: 38, carb: 55, fat: 10, fiber: 4},
        ingredients: [
            '닭가슴살 150g',
            '스파게티 면 100g',
            '방울토마토 10개',
            '마늘 3쪽',
            '올리브오일 2큰술',
            '파마산 치즈 20g',
            '바질 약간',
            '소금·후추 약간',
        ],
        steps: [
            '스파게티 면을 소금물에 알덴테로 삶아줍니다.',
            '닭가슴살을 소금·후추로 밑간 후 팬에 노릇하게 굽고 슬라이스합니다.',
            '같은 팬에 올리브오일을 두르고 다진 마늘을 볶습니다.',
            '방울토마토를 넣고 터질 때까지 볶아 소스를 만듭니다.',
            '면과 닭가슴살을 넣고 함께 볶습니다.',
            '파마산 치즈와 바질을 올려 완성합니다.',
        ],
        tip: '면 삶은 물을 소스에 조금 넣으면 더욱 부드러운 소스가 완성돼요.',
    },
    '2': {
        id: '2',
        emoji: '🥗',
        title: '두부 스테이크 샐러드',
        kcal: 340,
        cookTime: '20분',
        difficulty: '쉬움',
        nutrition: {protein: 22, carb: 18, fat: 16, fiber: 5},
        ingredients: [
            '두부 300g',
            '어린잎 채소 2줌',
            '방울토마토 8개',
            '오이 1/2개',
            '적양파 1/4개',
            '간장 2큰술',
            '참기름 1작은술',
            '올리브오일 1큰술',
            '레몬즙 1큰술',
        ],
        steps: [
            '두부를 2cm 두께로 썰어 키친타월로 물기를 제거합니다.',
            '간장·참기름·레몬즙을 섞어 마리네이드를 만듭니다.',
            '두부에 마리네이드를 바르고 10분 재웁니다.',
            '올리브오일을 두른 팬에 두부를 양면 노릇하게 굽습니다.',
            '채소와 토마토, 적양파를 접시에 담습니다.',
            '구운 두부를 올리고 남은 마리네이드를 드레싱으로 뿌립니다.',
        ],
        tip: '두부는 무거운 것으로 눌러 물기를 확실히 빼야 겉이 바삭하게 구워져요.',
    },
    '3': {
        id: '3',
        emoji: '🥣',
        title: '오트밀 요거트 볼',
        kcal: 310,
        cookTime: '10분',
        difficulty: '쉬움',
        nutrition: {protein: 14, carb: 46, fat: 7, fiber: 6},
        ingredients: [
            '오트밀 50g',
            '그릭요거트 150g',
            '우유 100ml',
            '블루베리 30g',
            '딸기 4개',
            '바나나 1/2개',
            '꿀 1작은술',
            '치아씨드 1작은술',
            '그래놀라 20g',
        ],
        steps: [
            '오트밀에 우유를 넣고 전자레인지에서 2분 가열합니다.',
            '잠시 식힌 후 그릭요거트를 위에 올립니다.',
            '블루베리, 슬라이스한 딸기와 바나나를 보기 좋게 얹습니다.',
            '그래놀라와 치아씨드를 뿌립니다.',
            '꿀을 한 바퀴 둘러 완성합니다.',
        ],
        tip: '전날 밤 오트밀에 우유를 담가 냉장고에 넣어두면 아침에 바로 먹을 수 있어요 (overnight oats).',
    },
    '4': {
        id: '4',
        emoji: '🥗',
        title: '연어 샐러드',
        kcal: 420,
        cookTime: '15분',
        difficulty: '쉬움',
        nutrition: {protein: 38, carb: 22, fat: 14, fiber: 3},
        ingredients: [
            '연어 150g',
            '양상추 3장',
            '방울토마토 8개',
            '오이 1/2개',
            '아보카도 1/2개',
            '올리브오일 드레싱 2큰술',
            '레몬 1/4개',
            '소금·후추 약간',
        ],
        steps: [
            '연어에 소금·후추를 뿌려 밑간합니다.',
            '팬에 올리브오일을 두르고 연어를 겉면이 노릇해질 때까지 굽습니다.',
            '양상추를 한 입 크기로 뜯고 채소를 준비합니다.',
            '아보카도를 슬라이스하고 방울토마토를 반으로 자릅니다.',
            '접시에 채소를 깔고 연어를 올립니다.',
            '드레싱을 뿌리고 레몬즙을 짜서 완성합니다.',
        ],
        tip: '연어는 너무 익히지 말고 겉만 구워 촉촉하게 먹는 게 더 맛있어요.',
    },
    '5': {
        id: '5',
        emoji: '🤖',
        title: 'AI 저탄고단 도시락',
        kcal: 480,
        cookTime: '30분',
        difficulty: '보통',
        nutrition: {protein: 45, carb: 28, fat: 18, fiber: 5},
        ingredients: [
            '닭가슴살 180g',
            '브로콜리 100g',
            '삶은 달걀 2개',
            '방울토마토 6개',
            '아몬드 15g',
            '올리브오일 1큰술',
            '허브믹스·소금·후추',
        ],
        steps: [
            '닭가슴살을 허브·소금·후추로 밑간 후 굽습니다.',
            '브로콜리를 한 입 크기로 잘라 살짝 데칩니다.',
            '달걀을 완숙으로 삶아 반으로 자릅니다.',
            '도시락 통에 닭가슴살, 브로콜리, 달걀, 토마토를 담습니다.',
            '아몬드를 곁들여 완성합니다.',
        ],
        tip: 'AI가 저탄수·고단백 조합으로 설계한 식단이에요. 탄수화물 섭취를 줄이고 근육 유지에 최적화되어 있어요.',
    },
    '6': {
        id: '6',
        emoji: '🤖',
        title: 'AI 다이어트 브런치',
        kcal: 360,
        cookTime: '15분',
        difficulty: '쉬움',
        nutrition: {protein: 24, carb: 32, fat: 14, fiber: 6},
        ingredients: [
            '달걀 2개',
            '통밀빵 1장',
            '아보카도 1/2개',
            '그릭요거트 100g',
            '블루베리 30g',
            '어린잎 채소 1줌',
            '올리브오일 1작은술',
            '소금·후추 약간',
        ],
        steps: [
            '통밀빵을 토스터에 굽습니다.',
            '아보카도를 으깨 소금·레몬즙으로 간합니다.',
            '달걀을 반숙 프라이로 만듭니다.',
            '토스트에 아보카도 스프레드를 바르고 달걀을 올립니다.',
            '그릭요거트에 블루베리를 얹어 곁들입니다.',
            '어린잎 채소를 올리브오일과 함께 사이드로 냅니다.',
        ],
        tip: 'AI가 설계한 브런치로 포만감은 높이고 칼로리는 낮춘 균형 잡힌 한 끼예요.',
    },
};

export function RecipeDetailScreen({navigation, route}: Props) {
    const {recipeId, fromType} = route.params;
    const recipe = RECIPES[recipeId];
    const [saved, setSaved] = useState(false);
    const [tab, setTab] = useState<'recipe' | 'nutrition'>('recipe');

    if (!recipe) {
        return (
            <SafeAreaView style={s.container}>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{color: colors.sub}}>레시피를 찾을 수 없습니다.</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 12}}>
                        <Text style={{color: colors.accent}}>← 돌아가기</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 32}}>
                {/* 헤더 */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.backBtn}>←</Text>
                    </TouchableOpacity>
                </View>

                {/* 타이틀 */}
                <Text style={s.title}>{recipe.emoji} {recipe.title}</Text>
                <Text style={s.kcal}>{recipe.kcal} kcal</Text>

                {/* 통계 카드 */}
                <View style={s.statsRow}>
                    <View style={s.statItem}>
                        <Text style={s.statLabel}>조리시간</Text>
                        <Text style={s.statValue}>{recipe.cookTime}</Text>
                    </View>
                    <View style={s.statDivider}/>
                    <View style={s.statItem}>
                        <Text style={s.statLabel}>난이도</Text>
                        <Text style={s.statValue}>{recipe.difficulty}</Text>
                    </View>
                    <View style={s.statDivider}/>
                    <View style={s.statItem}>
                        <Text style={s.statLabel}>단백질</Text>
                        <Text style={[s.statValue, {color: colors.teal}]}>{recipe.nutrition.protein}g</Text>
                    </View>
                    <View style={s.statDivider}/>
                    <View style={s.statItem}>
                        <Text style={s.statLabel}>탄수화물</Text>
                        <Text style={[s.statValue, {color: colors.accent3}]}>{recipe.nutrition.carb}g</Text>
                    </View>
                </View>

                {/* 탭 */}
                <View style={s.tabRow}>
                    <TouchableOpacity style={[s.tab, tab === 'recipe' && s.tabActive]} onPress={() => setTab('recipe')}>
                        <Text style={[s.tabText, tab === 'recipe' && s.tabTextActive]}>레시피 정보</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.tab, tab === 'nutrition' && s.tabActive]} onPress={() => setTab('nutrition')}>
                        <Text style={[s.tabText, tab === 'nutrition' && s.tabTextActive]}>영양 정보</Text>
                    </TouchableOpacity>
                </View>

                {tab === 'recipe' ? (
                    <View>
                        {/* 재료 */}
                        <Text style={s.sectionTitle}>⊙ 재료 (1인분)</Text>
                        <View style={s.card}>
                            {recipe.ingredients.map((ing, i) => (
                                <Text key={i} style={s.ingredient}>• {ing}</Text>
                            ))}
                        </View>

                        {/* 조리 순서 */}
                        <Text style={s.sectionTitle}>⊙ 조리 순서</Text>
                        <View style={s.card}>
                            {recipe.steps.map((step, i) => (
                                <View key={i} style={s.stepRow}>
                                    <View style={s.stepNum}>
                                        <Text style={s.stepNumText}>{i + 1}</Text>
                                    </View>
                                    <Text style={s.stepText}>{step}</Text>
                                </View>
                            ))}
                        </View>

                        {/* 팁 */}
                        {recipe.tip && (
                            <View style={s.tipCard}>
                                <Text style={s.tipTitle}>💡 요리 팁</Text>
                                <Text style={s.tipText}>{recipe.tip}</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View>
                        <Text style={s.sectionTitle}>⊙ 영양 성분</Text>
                        <View style={s.card}>
                            {[
                                {label: '단백질', value: recipe.nutrition.protein, color: colors.teal},
                                {label: '탄수화물', value: recipe.nutrition.carb, color: colors.accent3},
                                {label: '지방', value: recipe.nutrition.fat, color: colors.amber},
                                {label: '식이섬유', value: recipe.nutrition.fiber, color: colors.sub},
                            ].map(n => (
                                <View key={n.label} style={s.nutritionRow}>
                                    <Text style={s.nutritionLabel}>{n.label}</Text>
                                    <View style={s.nutritionTrack}>
                                        <View style={[s.nutritionFill, {width: `${Math.min(100, (n.value / 50) * 100)}%` as any, backgroundColor: n.color}]}/>
                                    </View>
                                    <Text style={s.nutritionValue}>{n.value}g</Text>
                                </View>
                            ))}
                            <View style={[s.nutritionRow, {marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border}]}>
                                <Text style={[s.nutritionLabel, {color: colors.text, fontWeight: '600'}]}>총 칼로리</Text>
                                <Text style={{flex: 1}}/>
                                <Text style={[s.nutritionValue, {color: colors.accent, fontWeight: '700', width: 'auto' as any}]}>{recipe.kcal} kcal</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* 하단 버튼 (저장한 레시피에서 진입 시 숨김) */}
            {fromType !== 'saved' && (
                <View style={s.footer}>
                    <TouchableOpacity style={[s.saveBtn, saved && s.saveBtnActive]} onPress={() => setSaved(v => !v)}>
                        <Text style={[s.saveBtnText, saved && s.saveBtnTextActive]}>
                            {saved ? '🔖 저장됨' : '🔖 저장하기'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    scroll: {paddingHorizontal: 16},
    header: {flexDirection: 'row', alignItems: 'center', height: 52},
    backBtn: {fontSize: 22, color: colors.text},
    title: {fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 6},
    kcal: {fontSize: 20, fontWeight: '700', color: colors.accent, marginBottom: 16},
    statsRow: {flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border},
    statItem: {flex: 1, alignItems: 'center'},
    statDivider: {width: 1, backgroundColor: colors.border, marginVertical: 2},
    statLabel: {fontSize: 10, color: colors.sub, marginBottom: 4},
    statValue: {fontSize: 13, fontWeight: '700', color: colors.text},
    tabRow: {flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: 10, padding: 3, marginBottom: 14, borderWidth: 1, borderColor: colors.border},
    tab: {flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8},
    tabActive: {backgroundColor: colors.surface},
    tabText: {fontSize: 13, color: colors.sub, fontWeight: '500'},
    tabTextActive: {color: colors.text, fontWeight: '700'},
    sectionTitle: {fontSize: 12, fontWeight: '600', color: colors.sub, marginBottom: 8, letterSpacing: 0.3},
    card: {backgroundColor: colors.surface2, borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border},
    ingredient: {fontSize: 14, color: colors.text, marginBottom: 6, lineHeight: 20},
    stepRow: {flexDirection: 'row', gap: 10, marginBottom: 10},
    stepNum: {width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(184,255,78,0.15)', alignItems: 'center', justifyContent: 'center', marginTop: 1},
    stepNumText: {fontSize: 11, color: colors.accent, fontWeight: '700'},
    stepText: {flex: 1, fontSize: 14, color: colors.text, lineHeight: 22},
    tipCard: {backgroundColor: 'rgba(184,255,78,0.07)', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(184,255,78,0.2)'},
    tipTitle: {fontSize: 13, fontWeight: '700', color: colors.accent, marginBottom: 6},
    tipText: {fontSize: 13, color: colors.sub, lineHeight: 20},
    nutritionRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10},
    nutritionLabel: {width: 56, fontSize: 12, color: colors.sub},
    nutritionTrack: {flex: 1, height: 6, backgroundColor: colors.surface, borderRadius: 3, overflow: 'hidden'},
    nutritionFill: {height: '100%', borderRadius: 3},
    nutritionValue: {width: 36, fontSize: 12, color: colors.text, textAlign: 'right'},
    footer: {paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg},
    saveBtn: {height: 52, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(184,255,78,0.35)', backgroundColor: 'rgba(184,255,78,0.08)', alignItems: 'center', justifyContent: 'center'},
    saveBtnActive: {backgroundColor: colors.accent, borderColor: colors.accent},
    saveBtnText: {fontSize: 15, fontWeight: '700', color: colors.accent},
    saveBtnTextActive: {color: '#111'},
});
