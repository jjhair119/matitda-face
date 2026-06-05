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
    Alert,
    ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {colors} from '../../theme';
import {recommendRecipes, reviseRecipes, saveRecipe} from '../../api/recipes';

type Props = NativeStackScreenProps<HomeStackParamList, 'AIRecipeGenerate'>;
type Step = 1 | 2 | 3;
const DURATION_OPTIONS = ['1일', '3일', '7일'] as const;
type Duration = (typeof DURATION_OPTIONS)[number];

const MEAL_OPTIONS = [
    {id: 'breakfast', label: '아침', emoji: '🌅'},
    {id: 'lunch', label: '점심', emoji: '☀️'},
    {id: 'dinner', label: '저녁', emoji: '🌙'},
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

const MEAL_ID_ORDER = ['breakfast', 'lunch', 'dinner'];

// ─── Plan normalizer ──────────────────────────────────────────────

type NormalizedRecipe = {
    title: string; kcal: number; cookTime: string; difficulty: string;
    ingredients: string[]; steps: string[];
    nutrition: {protein: number; carb: number; fat: number; fiber: number};
    aiComment: string;
};

type NormalizedDay = {dayLabel: string; meals: Array<{mealId: string; recipe: NormalizedRecipe; rawMeal: any}>};

function normalizePlan(planData: any): NormalizedDay[] {
    const plan = planData?.plan ?? planData;
    if (!Array.isArray(plan)) return [];
    return plan.map((dayObj: any) => ({
        dayLabel: `${dayObj.day}일차`,
        meals: (dayObj.meals ?? []).map((m: any) => ({
            mealId: m.meal ?? m.id ?? '',
            rawMeal: m,
            recipe: {
                title: m.title ?? '레시피',
                kcal: Math.round(m.nutrition?.calories ?? 0),
                cookTime: m.cookTime ?? m.cook_time ?? '-',
                difficulty: m.difficulty ?? '-',
                ingredients: Array.isArray(m.ingredients) ? m.ingredients : [],
                steps: Array.isArray(m.steps) ? m.steps : [],
                nutrition: {
                    protein: Math.round(m.nutrition?.protein_g ?? 0),
                    carb: Math.round(m.nutrition?.carbs_g ?? 0),
                    fat: Math.round(m.nutrition?.fat_g ?? 0),
                    fiber: 0,
                },
                aiComment: m.description ?? '',
            },
        })),
    }));
}

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

function RecipeCard({mealId, recipe, onSave, saved}: {mealId: string; recipe: NormalizedRecipe; onSave?: () => void; saved?: boolean}) {
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
                        {/*<Text style={rc.cardMetaText}>⏱ {recipe.cookTime}</Text>*/}
                        <Text style={rc.cardMetaDot}>·</Text>
                        <Text style={rc.cardMetaText}>{recipe.difficulty}</Text>
                    </View>
                </View>
                <Text style={[rc.expandIcon, {color: textColor}]}>{expanded ? '▲' : '▽'}</Text>
                {onSave && (
                    <TouchableOpacity
                        onPress={e => { e.stopPropagation?.(); onSave(); }}
                        style={[rc.mealSaveBtn, saved && rc.mealSaveBtnDone]}
                        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    >
                        <Text style={[rc.mealSaveBtnText, saved && {color: colors.sub}]}>{saved ? '✓' : '🔖'}</Text>
                    </TouchableOpacity>
                )}
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
    mealSaveBtn: {marginLeft: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(184,255,78,0.4)', backgroundColor: 'rgba(184,255,78,0.08)'},
    mealSaveBtnDone: {borderColor: colors.border, backgroundColor: colors.surface},
    mealSaveBtnText: {fontSize: 12, color: colors.accent},
});

// ─── ResultStep ───────────────────────────────────────────────────
function ResultStep({duration, meals, plan, onRegenerate, onSave, onRevise, onSaveMeal, saving, saved}: {
    duration: Duration;
    meals: string[];
    plan: any;
    onRegenerate: () => void;
    onSave: () => void;
    onRevise: (prompt: string) => void;
    onSaveMeal: (rawMeal: any) => Promise<void>;
    saving: boolean;
    saved: boolean;
}) {
    const [modifyText, setModifyText] = useState('');
    const [revising, setRevising] = useState(false);
    const [savedMeals, setSavedMeals] = useState<Set<string>>(new Set());
    const [savingMeal, setSavingMeal] = useState<string | null>(null);

    const handleSaveMeal = async (rawMeal: any) => {
        const key = rawMeal.id ?? rawMeal.meal;
        if (savedMeals.has(key) || savingMeal) return;
        setSavingMeal(key);
        try {
            await onSaveMeal(rawMeal);
            setSavedMeals(prev => new Set(prev).add(key));
        } catch {
            Alert.alert('저장 실패', '메뉴 저장에 실패했어요.');
        } finally {
            setSavingMeal(null);
        }
    };

    const orderedMeals = MEAL_ID_ORDER.filter(m => meals.includes(m));
    const normalizedDays = normalizePlan(plan);
    const totalMeals = normalizedDays.reduce((s, d) => s + d.meals.length, 0);
    const totalKcal = normalizedDays.reduce((s, d) => s + d.meals.reduce((ms, m) => ms + m.recipe.kcal, 0), 0);
    const avgKcal = normalizedDays.length > 0 ? Math.round(totalKcal / normalizedDays.length) : 0;

    const handleRevise = async () => {
        if (!modifyText.trim() || revising) return;
        setRevising(true);
        onRevise(modifyText.trim());
    };

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
            {normalizedDays.map((dayData, dayIndex) => {
                const dayKcal = dayData.meals.reduce((s, m) => s + m.recipe.kcal, 0);
                return (
                    <View key={dayIndex} style={rs.daySection}>
                        <View style={rs.dayHeader}>
                            <Text style={rs.dayTitle}>{dayData.dayLabel}</Text>
                            {dayKcal > 0 && <Text style={rs.dayKcal}>🔥 {dayKcal} kcal</Text>}
                        </View>
                        {dayData.meals.map(({mealId, recipe, rawMeal}) => (
                            <RecipeCard
                                key={rawMeal.id ?? mealId}
                                mealId={mealId}
                                recipe={recipe}
                                onSave={() => handleSaveMeal(rawMeal)}
                                saved={savedMeals.has(rawMeal.id ?? rawMeal.meal)}
                            />
                        ))}
                    </View>
                );
            })}

            {/* 액션 버튼 */}
            <View style={rs.actionRow}>
                <TouchableOpacity style={[rs.saveBtn, saved && rs.saveBtnDone]} onPress={onSave} disabled={saving || saved}>
                    {saving ? (
                        <ActivityIndicator size="small" color={colors.accent}/>
                    ) : (
                        <Text style={rs.saveBtnText}>{saved ? '✓ 저장됨' : '🔖 전체 저장하기'}</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={rs.regenBtn} onPress={onRegenerate}>
                    <Text style={rs.regenBtnText}>🔄 다시 생성</Text>
                </TouchableOpacity>
            </View>

            {/* 수정하기 */}
            <View style={rs.modifyCard}>
                <Text style={rs.modifyTitle}>식단 수정 요청하기</Text>
                <Text style={rs.modifySub}>원하는 변경사항을 입력해주세요.</Text>
                <View style={rs.inputBox}>
                    <TextInput style={rs.input} placeholder="예: 탄수화물을 줄이고 싶어요, 유제품 빼주세요" placeholderTextColor={colors.sub} value={modifyText} onChangeText={v => setModifyText(v.slice(0, 100))} multiline editable={!revising}/>
                    <Text style={rs.charCount}>{modifyText.length}/100</Text>
                </View>
                <TouchableOpacity style={[rs.modifyBtn, (!modifyText.trim() || revising) && {opacity: 0.5}]} onPress={handleRevise} disabled={!modifyText.trim() || revising}>
                    {revising ? (
                        <ActivityIndicator size="small" color="#111"/>
                    ) : (
                        <Text style={rs.modifyBtnText}>✦ 수정 적용하기</Text>
                    )}
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
    saveBtn: {flex: 2, height: 44, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(184,255,78,0.35)', backgroundColor: 'rgba(184,255,78,0.08)', alignItems: 'center', justifyContent: 'center'},
    saveBtnDone: {borderColor: colors.border, backgroundColor: colors.surface2},
    saveBtnText: {fontSize: 12, color: colors.accent, fontWeight: '600'},
    regenBtn: {flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center'},
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
    const [generatedPlan, setGeneratedPlan] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const toggleMeal = (id: string) => setMeals(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    const toggleStyle = (id: string) => setStyleIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

    const buildPrompt = () => {
        const parts = [
            ...styleIds.map(id => STYLE_OPTIONS.find(o => o.id === id)?.label).filter(Boolean),
            excluded ? `제외: ${excluded}` : '',
            requests,
        ].filter(Boolean);
        return parts.join(', ') || undefined;
    };

    const handleGenerate = async () => {
        setStep(2);
        setSaved(false);
        const dayCount = duration === '1일' ? 1 : duration === '3일' ? 3 : 7;
        try {
            const data = await recommendRecipes({days: dayCount, meals, prompt: buildPrompt()});
            setGeneratedPlan(data);
            setStep(3);
        } catch {
            Alert.alert('생성 실패', 'AI 레시피 생성에 실패했어요. 다시 시도해주세요.');
            setStep(1);
        }
    };

    const handleSave = async () => {
        if (!generatedPlan || saved || saving) return;
        setSaving(true);
        const dayCount = duration === '1일' ? 1 : duration === '3일' ? 3 : 7;
        try {
            await saveRecipe({days: dayCount, meals, prompt: buildPrompt(), plan: generatedPlan, source: 'openai'});
            setSaved(true);
        } catch {
            Alert.alert('저장 실패', '레시피 저장에 실패했어요.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSingleMeal = async (rawMeal: any) => {
        const singleDayPlan = {plan: [{day: 1, meals: [rawMeal]}]};
        await saveRecipe({days: 1, meals: [rawMeal.meal], prompt: undefined, plan: singleDayPlan, source: 'openai'});
    };

    const handleRevise = async (prompt: string) => {
        setStep(2);
        setSaved(false);
        try {
            const data = await reviseRecipes({current_plan: generatedPlan, prompt});
            setGeneratedPlan(data);
            setStep(3);
        } catch {
            Alert.alert('수정 실패', '레시피 수정에 실패했어요. 다시 시도해주세요.');
            setStep(3);
        }
    };

    return (
        <SafeAreaView style={main.container} edges={['top', 'left', 'right']}>
            <View style={main.header}>
                <TouchableOpacity onPress={() => { if (step === 1) navigation.goBack(); else if (step === 3) setStep(1); else setStep(1); }}>
                    <Text style={main.backBtn}>←</Text>
                </TouchableOpacity>
                <Text style={main.title}>{step === 3 ? 'AI 레시피 결과' : 'AI 레시피 생성'}</Text>
                <View style={main.headerRight}/>
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
                {step === 3 && (
                    <ResultStep
                        duration={duration}
                        meals={meals}
                        plan={generatedPlan}
                        onRegenerate={handleGenerate}
                        onSave={handleSave}
                        onRevise={handleRevise}
                        onSaveMeal={handleSaveSingleMeal}
                        saving={saving}
                        saved={saved}
                    />
                )}
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
