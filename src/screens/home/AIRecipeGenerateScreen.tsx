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

const MOCK_RECIPE = {
    title: '고단백 아침 식단',
    subtitle: '에그 스크램블 · 아보카도 샐러드 · 통밀빵\n그릭요거트 · 블루베리',
    kcal: 380,
    cookTime: '15분',
    difficulty: '쉬움',
    ingredients: [
        '달걀 2개',
        '아보카도 1/2개',
        '방울토마토 5개',
        '어린잎 채소 1컵',
        '통밀빵 1조각',
        '그릭요거트 100g',
        '블루베리 1/4컵',
        '올리브오일 1작은술',
        '소금, 후추 약간',
    ],
    steps: [
        '달걀을 볼에 깨고 소금, 후추를 넣어 잘 풀어줍니다.',
        '올리브오일을 두른 팬에 스크램블 에그를 만들어줍니다.',
        '아보카도는 슬라이스하고, 방울토마토는 반으로 잘라줍니다.',
        '어린잎 채소 위에 아보카도와 토마토를 올려 샐러드를 만듭니다.',
        '통밀빵을 살짝 구운 뒤 접시에 함께 담습니다.',
        '그릭요거트에 블루베리를 얹어 곁들입니다.',
    ],
    nutrition: {protein: 28, carb: 35, fat: 18, fiber: 6},
    aiComment:
        '단백질과 건강한 지방이 풍부한 균형 잡힌 아침 식단이에요.\n포만감이 높아 오전 내내 에너지를 유지할 수 있어요! 💪',
};

function StepIndicator({step}: { step: Step }) {
    const steps = [
        {num: 1, label: '설정'},
        {num: 2, label: '생성 중'},
        {num: 3, label: '결과'},
    ];
    return (
        <View style={ind.container}>
            {steps.map((s, i) => {
                const done = step > s.num;
                const active = step === s.num;
                return (
                    <React.Fragment key={s.num}>
                        <View style={ind.item}>
                            <View
                                style={[
                                    ind.circle,
                                    active && ind.circleActive,
                                    done && ind.circleDone,
                                ]}>
                                <Text
                                    style={[
                                        ind.circleText,
                                        (active || done) && ind.circleTextActive,
                                    ]}>
                                    {done ? '✓' : s.num}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    ind.label,
                                    (active || done) && ind.labelActive,
                                ]}>
                                {s.label}
                            </Text>
                        </View>
                        {i < steps.length - 1 && (
                            <View
                                style={[
                                    ind.line,
                                    step > s.num && ind.lineDone,
                                ]}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </View>
    );
}

const ind = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 0,
    },
    item: {alignItems: 'center', gap: 4},
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    circleDone: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    circleText: {fontSize: 12, color: colors.sub, fontWeight: '600'},
    circleTextActive: {color: '#111'},
    label: {fontSize: 10, color: colors.sub},
    labelActive: {color: colors.accent, fontWeight: '600'},
    line: {
        width: 48,
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 14,
        marginHorizontal: 4,
    },
    lineDone: {backgroundColor: colors.accent},
});

function SettingStep({
                         duration,
                         setDuration,
                         meals,
                         toggleMeal,
                         styles: selectedStyles,
                         toggleStyle,
                         excluded,
                         setExcluded,
                         requests,
                         setRequests,
                         onGenerate,
                     }: {
    duration: Duration;
    setDuration: (d: Duration) => void;
    meals: string[];
    toggleMeal: (id: string) => void;
    styles: string[];
    toggleStyle: (id: string) => void;
    excluded: string;
    setExcluded: (v: string) => void;
    requests: string;
    setRequests: (v: string) => void;
    onGenerate: () => void;
}) {
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 100}}>
            {/* 기간 선택 */}
            <Text style={f.sectionLabel}>기간 선택</Text>
            <View style={f.chipRow}>
                {DURATION_OPTIONS.map(d => (
                    <TouchableOpacity
                        key={d}
                        style={[f.durationChip, duration === d && f.durationChipActive]}
                        onPress={() => setDuration(d)}>
                        <Text
                            style={[
                                f.durationChipText,
                                duration === d && f.durationChipTextActive,
                            ]}>
                            {d}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 식사 선택 */}
            <Text style={f.sectionLabel}>식사 선택</Text>
            <View style={f.chipRow}>
                {MEAL_OPTIONS.map(m => {
                    const on = meals.includes(m.id);
                    return (
                        <TouchableOpacity
                            key={m.id}
                            style={[f.mealChip, on && f.mealChipActive]}
                            onPress={() => toggleMeal(m.id)}>
                            <Text style={f.mealEmoji}>{m.emoji}</Text>
                            <Text
                                style={[
                                    f.mealChipText,
                                    on && f.mealChipTextActive,
                                ]}>
                                {m.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* 선호 스타일 */}
            <Text style={f.sectionLabel}>
                선호하는 스타일{' '}
                <Text style={f.optional}>(선택)</Text>
            </Text>
            <View style={f.styleGrid}>
                {STYLE_OPTIONS.map(o => {
                    const on = selectedStyles.includes(o.id);
                    return (
                        <TouchableOpacity
                            key={o.id}
                            style={[f.styleChip, on && f.styleChipActive]}
                            onPress={() => toggleStyle(o.id)}>
                            <Text style={f.styleChipText}>
                                {o.emoji} {o.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* 제외 식재료 */}
            <Text style={f.sectionLabel}>
                제외하고 싶은 식재료{' '}
                <Text style={f.optional}>(선택)</Text>
            </Text>
            <View style={f.inputBox}>
                <TextInput
                    style={f.input}
                    placeholder="예: 양파, 고수, 견과류 등"
                    placeholderTextColor={colors.sub}
                    value={excluded}
                    onChangeText={v => setExcluded(v.slice(0, 100))}
                    multiline
                />
                <Text style={f.charCount}>{excluded.length}/100</Text>
            </View>

            {/* 추가 요청 */}
            <Text style={f.sectionLabel}>
                추가 요청사항{' '}
                <Text style={f.optional}>(선택)</Text>
            </Text>
            <View style={f.inputBox}>
                <TextInput
                    style={f.input}
                    placeholder="예: 매운 음식은 피해주세요, 아이도 먹을 수 있는"
                    placeholderTextColor={colors.sub}
                    value={requests}
                    onChangeText={v => setRequests(v.slice(0, 100))}
                    multiline
                />
                <Text style={f.charCount}>{requests.length}/100</Text>
            </View>
        </ScrollView>
    );
}

const f = StyleSheet.create({
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 10,
        marginTop: 18,
    },
    optional: {fontSize: 12, fontWeight: '400', color: colors.sub},
    chipRow: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
    durationChip: {
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface2,
    },
    durationChipActive: {
        borderColor: colors.accent,
        backgroundColor: 'rgba(184,255,78,0.12)',
    },
    durationChipText: {fontSize: 14, color: colors.sub, fontWeight: '500'},
    durationChipTextActive: {color: colors.accent, fontWeight: '700'},
    mealChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface2,
    },
    mealChipActive: {
        borderColor: colors.accent,
        backgroundColor: 'rgba(184,255,78,0.12)',
    },
    mealEmoji: {fontSize: 16},
    mealChipText: {fontSize: 13, color: colors.sub, fontWeight: '500'},
    mealChipTextActive: {color: colors.accent, fontWeight: '700'},
    styleGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    styleChip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface2,
    },
    styleChipActive: {
        borderColor: colors.accent,
        backgroundColor: 'rgba(184,255,78,0.12)',
    },
    styleChipText: {fontSize: 12, color: colors.sub},
    inputBox: {
        backgroundColor: colors.surface2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        minHeight: 72,
    },
    input: {
        color: colors.text,
        fontSize: 13,
        minHeight: 44,
    },
    charCount: {
        fontSize: 10,
        color: colors.sub,
        textAlign: 'right',
        marginTop: 4,
    },
});

function GeneratingStep() {
    const glowAnim = useRef(new Animated.Value(0.4)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.4,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ).start();

        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    }, [glowAnim, progressAnim]);

    return (
        <View style={g.container}>
            <Animated.View style={[g.iconWrap, {opacity: glowAnim}]}>
                <Text style={g.icon}>👨‍🍳</Text>
            </Animated.View>
            <Text style={g.title}>AI가 맞춤 레시피를{'\n'}생성하고 있어요...</Text>
            <View style={g.progressTrack}>
                <Animated.View
                    style={[
                        g.progressFill,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '85%'],
                            }),
                        },
                    ]}
                />
            </View>
            <Text style={g.sub}>
                영양 밸런스와 취향을 고려하여{'\n'}최적의 레시피를 추천해드릴게요!{'\n'}잠시만 기다려주세요 😊
            </Text>
        </View>
    );
}

const g = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    iconWrap: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(184,255,78,0.1)',
        borderWidth: 2,
        borderColor: 'rgba(184,255,78,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    icon: {fontSize: 52},
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 26,
    },
    progressTrack: {
        width: '100%',
        height: 6,
        backgroundColor: colors.surface2,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 24,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: 3,
    },
    sub: {
        fontSize: 13,
        color: colors.sub,
        textAlign: 'center',
        lineHeight: 20,
    },
});

function ResultStep({
                        duration,
                        meals,
                        onRegenerate,
                        onSave,
                        onBuy,
                        navigation,
                    }: {
    duration: Duration;
    meals: string[];
    onRegenerate: () => void;
    onSave: () => void;
    onBuy: () => void;
    navigation: Props['navigation'];
}) {
    const [tab, setTab] = useState<'recipe' | 'nutrition'>('recipe');
    const [modifyText, setModifyText] = useState('');
    const [liked, setLiked] = useState(false);

    const mealLabel =
        meals.includes('breakfast')
            ? '아침'
            : meals.includes('lunch')
                ? '점심'
                : meals.includes('dinner')
                    ? '저녁'
                    : '간식';

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 40}}>
            {/* 배지 */}
            <View style={r.badgeRow}>
                <View style={r.badge}>
                    <Text style={r.badgeText}>
                        {duration} · {mealLabel}
                    </Text>
                </View>
            </View>

            {/* 레시피 타이틀 카드 */}
            <View style={r.titleCard}>
                <Text style={r.recipeTitle}>{MOCK_RECIPE.title}</Text>
                <Text style={r.recipeSubtitle}>{MOCK_RECIPE.subtitle}</Text>
                <View style={r.statsRow}>
                    <View style={r.statItem}>
                        <Text style={r.statLabel}>총 칼로리</Text>
                        <Text style={r.statValue}>{MOCK_RECIPE.kcal} kcal</Text>
                    </View>
                    <View style={r.statDivider}/>
                    <View style={r.statItem}>
                        <Text style={r.statLabel}>조리시간</Text>
                        <Text style={r.statValue}>{MOCK_RECIPE.cookTime}</Text>
                    </View>
                    <View style={r.statDivider}/>
                    <View style={r.statItem}>
                        <Text style={r.statLabel}>난이도</Text>
                        <Text style={r.statValue}>{MOCK_RECIPE.difficulty}</Text>
                    </View>
                </View>
            </View>

            {/* 탭 */}
            <View style={r.tabRow}>
                <TouchableOpacity
                    style={[r.tab, tab === 'recipe' && r.tabActive]}
                    onPress={() => setTab('recipe')}>
                    <Text
                        style={[
                            r.tabText,
                            tab === 'recipe' && r.tabTextActive,
                        ]}>
                        레시피 정보
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[r.tab, tab === 'nutrition' && r.tabActive]}
                    onPress={() => setTab('nutrition')}>
                    <Text
                        style={[
                            r.tabText,
                            tab === 'nutrition' && r.tabTextActive,
                        ]}>
                        영양 정보
                    </Text>
                </TouchableOpacity>
            </View>

            {tab === 'recipe' ? (
                <View style={r.card}>
                    <Text style={r.cardSectionTitle}>⊙ 재료 (1인분)</Text>
                    {MOCK_RECIPE.ingredients.map((ing, i) => (
                        <Text key={i} style={r.ingredientItem}>
                            • {ing}
                        </Text>
                    ))}
                    <Text style={[r.cardSectionTitle, {marginTop: 16}]}>
                        ⊙ 조리 순서
                    </Text>
                    {MOCK_RECIPE.steps.map((step, i) => (
                        <View key={i} style={r.stepRow}>
                            <View style={r.stepNum}>
                                <Text style={r.stepNumText}>{i + 1}</Text>
                            </View>
                            <Text style={r.stepText}>{step}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={r.card}>
                    <Text style={r.cardSectionTitle}>⊙ 영양 성분</Text>
                    {[
                        {label: '단백질', value: MOCK_RECIPE.nutrition.protein, unit: 'g', color: colors.teal},
                        {label: '탄수화물', value: MOCK_RECIPE.nutrition.carb, unit: 'g', color: colors.accent3},
                        {label: '지방', value: MOCK_RECIPE.nutrition.fat, unit: 'g', color: colors.amber},
                        {label: '식이섬유', value: MOCK_RECIPE.nutrition.fiber, unit: 'g', color: colors.sub},
                    ].map(n => (
                        <View key={n.label} style={r.nutritionRow}>
                            <Text style={r.nutritionLabel}>{n.label}</Text>
                            <View style={r.nutritionTrack}>
                                <View
                                    style={[
                                        r.nutritionFill,
                                        {
                                            width: `${Math.min(100, (n.value / 50) * 100)}%` as any,
                                            backgroundColor: n.color,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={r.nutritionValue}>
                                {n.value}
                                {n.unit}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* 버튼 2개 */}
            <View style={r.actionRow}>
                <TouchableOpacity style={r.buyBtn} onPress={onBuy}>
                    <Text style={r.buyBtnText}>🛒 식재료 구매하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={r.saveBtn} onPress={onSave}>
                    <Text style={r.saveBtnText}>🔖 이 레시피 저장하기</Text>
                </TouchableOpacity>
            </View>

            {/* AI 코멘트 */}
            <View style={r.aiCommentCard}>
                <Text style={r.aiCommentTitle}>🤖 AI 코멘트</Text>
                <Text style={r.aiCommentText}>{MOCK_RECIPE.aiComment}</Text>
            </View>

            {/* 마음에 드나요 */}
            <View style={r.feedbackCard}>
                <Text style={r.feedbackTitle}>이 레시피가 마음에 드시나요?</Text>
                <View style={r.feedbackBtnRow}>
                    <TouchableOpacity
                        style={[r.feedbackBtn, liked && r.feedbackBtnActive]}
                        onPress={() => setLiked(true)}>
                        <Text style={r.feedbackBtnText}>👍 마음에 들어요</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={r.regenBtn}
                        onPress={onRegenerate}>
                        <Text style={r.regenBtnText}>🔄 다시 생성하기</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 레시피 수정하기 */}
            <View style={r.modifyCard}>
                <Text style={r.modifyTitle}>레시피 수정하기</Text>
                <Text style={r.modifySub}>원하는 변경사항을 입력해주세요.</Text>
                <View style={r.modifyInputBox}>
                    <TextInput
                        style={r.modifyInput}
                        placeholder="예: 단수화물을 줄이고 싶어, 고기 추가해주세요"
                        placeholderTextColor={colors.sub}
                        value={modifyText}
                        onChangeText={v => setModifyText(v.slice(0, 100))}
                        multiline
                    />
                    <Text style={r.charCount}>{modifyText.length}/100</Text>
                </View>
                <TouchableOpacity style={r.modifyBtn}>
                    <Text style={r.modifyBtnText}>✦ 수정 적용하기</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const r = StyleSheet.create({
    badgeRow: {flexDirection: 'row', marginBottom: 12},
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: 'rgba(184,255,78,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.3)',
    },
    badgeText: {fontSize: 11, color: colors.accent, fontWeight: '600'},
    titleCard: {
        backgroundColor: colors.surface2,
        borderRadius: 14,
        padding: 16,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    recipeTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
    },
    recipeSubtitle: {
        fontSize: 12,
        color: colors.sub,
        lineHeight: 18,
        marginBottom: 14,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 12,
    },
    statItem: {flex: 1, alignItems: 'center'},
    statDivider: {width: 1, backgroundColor: colors.border, marginVertical: 2},
    statLabel: {fontSize: 10, color: colors.sub, marginBottom: 3},
    statValue: {fontSize: 13, fontWeight: '700', color: colors.text},
    tabRow: {
        flexDirection: 'row',
        marginTop: 12,
        marginBottom: 4,
        backgroundColor: colors.surface2,
        borderRadius: 10,
        padding: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {backgroundColor: colors.surface},
    tabText: {fontSize: 13, color: colors.sub, fontWeight: '500'},
    tabTextActive: {color: colors.text, fontWeight: '700'},
    card: {
        backgroundColor: colors.surface2,
        borderRadius: 14,
        padding: 16,
        marginTop: 4,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.sub,
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    ingredientItem: {
        fontSize: 13,
        color: colors.text,
        marginBottom: 5,
        lineHeight: 20,
    },
    stepRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    stepNum: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(184,255,78,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    stepNumText: {fontSize: 11, color: colors.accent, fontWeight: '700'},
    stepText: {flex: 1, fontSize: 13, color: colors.text, lineHeight: 20},
    nutritionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    nutritionLabel: {width: 52, fontSize: 12, color: colors.sub},
    nutritionTrack: {
        flex: 1,
        height: 6,
        backgroundColor: colors.surface,
        borderRadius: 3,
        overflow: 'hidden',
    },
    nutritionFill: {height: '100%', borderRadius: 3},
    nutritionValue: {width: 36, fontSize: 11, color: colors.text, textAlign: 'right'},
    actionRow: {flexDirection: 'row', gap: 8, marginTop: 12},
    buyBtn: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyBtnText: {fontSize: 12, color: colors.text, fontWeight: '600'},
    saveBtn: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.35)',
        backgroundColor: 'rgba(184,255,78,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {fontSize: 12, color: colors.accent, fontWeight: '600'},
    aiCommentCard: {
        marginTop: 10,
        backgroundColor: colors.surface2,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    aiCommentTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    aiCommentText: {fontSize: 13, color: colors.sub, lineHeight: 20},
    feedbackCard: {
        marginTop: 10,
        backgroundColor: colors.surface2,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    feedbackTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 10,
    },
    feedbackBtnRow: {flexDirection: 'row', gap: 8},
    feedbackBtn: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    feedbackBtnActive: {
        borderColor: colors.accent,
        backgroundColor: 'rgba(184,255,78,0.12)',
    },
    feedbackBtnText: {fontSize: 12, color: colors.text, fontWeight: '600'},
    regenBtn: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    regenBtnText: {fontSize: 12, color: colors.text, fontWeight: '600'},
    modifyCard: {
        marginTop: 10,
        backgroundColor: colors.surface2,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modifyTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    modifySub: {fontSize: 11, color: colors.sub, marginBottom: 10},
    modifyInputBox: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 10,
        minHeight: 64,
        marginBottom: 10,
    },
    modifyInput: {
        color: colors.text,
        fontSize: 13,
        minHeight: 40,
    },
    charCount: {fontSize: 10, color: colors.sub, textAlign: 'right', marginTop: 2},
    modifyBtn: {
        height: 44,
        borderRadius: 10,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modifyBtnText: {fontSize: 14, fontWeight: '700', color: '#111'},
});

export function AIRecipeGenerateScreen({navigation}: Props) {
    const [step, setStep] = useState<Step>(1);
    const [duration, setDuration] = useState<Duration>('1일');
    const [meals, setMeals] = useState<string[]>(['breakfast']);
    const [styleIds, setStyleIds] = useState<string[]>([]);
    const [excluded, setExcluded] = useState('');
    const [requests, setRequests] = useState('');

    const toggleMeal = (id: string) => {
        setMeals(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id],
        );
    };

    const toggleStyle = (id: string) => {
        setStyleIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id],
        );
    };

    const handleGenerate = () => {
        setStep(2);
        setTimeout(() => setStep(3), 3200);
    };

    const handleRegenerate = () => {
        setStep(2);
        setTimeout(() => setStep(3), 3200);
    };

    const headerTitle =
        step === 3 ? 'AI 레시피 결과' : 'AI 레시피 생성';

    return (
        <SafeAreaView style={main.container} edges={['top', 'left', 'right']}>
            {/* 헤더 */}
            <View style={main.header}>
                <TouchableOpacity onPress={() => {
                    if (step === 1) navigation.goBack();
                    else setStep(s => (s - 1) as Step);
                }}>
                    <Text style={main.backBtn}>←</Text>
                </TouchableOpacity>
                <Text style={main.title}>{headerTitle}</Text>
                {step === 3 ? (
                    <View style={main.headerRight}>
                        <TouchableOpacity style={main.iconBtn}>
                            <Text style={main.iconBtnText}>☆</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={main.iconBtn}>
                            <Text style={main.iconBtnText}>≡</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={main.headerRight}/>
                )}
            </View>

            {/* 스텝 인디케이터 (결과 제외) */}
            {step !== 3 && <StepIndicator step={step}/>}

            {/* 콘텐츠 */}
            <View style={main.content}>
                {step === 1 && (
                    <SettingStep
                        duration={duration}
                        setDuration={setDuration}
                        meals={meals}
                        toggleMeal={toggleMeal}
                        styles={styleIds}
                        toggleStyle={toggleStyle}
                        excluded={excluded}
                        setExcluded={setExcluded}
                        requests={requests}
                        setRequests={setRequests}
                        onGenerate={handleGenerate}
                    />
                )}
                {step === 2 && <GeneratingStep/>}
                {step === 3 && (
                    <ResultStep
                        duration={duration}
                        meals={meals}
                        onRegenerate={handleRegenerate}
                        onSave={() => {
                        }}
                        onBuy={() => {
                        }}
                        navigation={navigation}
                    />
                )}
            </View>

            {/* 하단 버튼 (설정 단계만) */}
            {step === 1 && (
                <View style={main.footer}>
                    <TouchableOpacity
                        style={[
                            main.generateBtn,
                            meals.length === 0 && main.generateBtnDisabled,
                        ]}
                        onPress={handleGenerate}
                        disabled={meals.length === 0}>
                        <Text style={main.generateBtnText}>
                            ✦ AI 레시피 생성하기
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const main = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg, paddingBottom: 0},
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {fontSize: 22, color: colors.text, marginRight: 10},
    title: {flex: 1, fontSize: 17, fontWeight: '700', color: colors.text},
    headerRight: {
        flexDirection: 'row',
        gap: 4,
        width: 72,
        justifyContent: 'flex-end',
    },
    iconBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconBtnText: {fontSize: 16, color: colors.text},
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    footer: {
        height: 68,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.bg,
    },
    generateBtn: {
        height: 52,
        width: '100%',
        borderRadius: 14,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generateBtnDisabled: {
        backgroundColor: colors.surface2,
    },
    generateBtnText: {fontSize: 15, fontWeight: '700', color: '#111'},
});
