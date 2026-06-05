import React, {useEffect, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import {getDailyMeals, DailyMealSummary} from '../../api/meals';
import {getTodayPlan, TodayPlan} from '../../api/recipes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuthStore} from '../../store/authStore';
import {useMealStore} from '../../store/mealStore';
import {useNotificationStore} from '../../store/notificationStore';
import {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

// ── 날짜 유틸 ────────────────────────────────────────────────────────────────

function toDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDates(): Date[] {
    const today = new Date();
    const dow = today.getDay(); // 0=일
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dow + 6) % 7));
    return Array.from({length: 7}, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const MEAL_TYPE_LABEL: Record<string, string> = {
    breakfast: '아침',
    lunch: '점심',
    dinner: '저녁',
};

const MEAL_TYPE_EMOJI: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
};

const MEAL_LABEL_KO: Record<string, string> = {
    breakfast: '아침',
    lunch: '점심',
    dinner: '저녁',
};

// ── TodayPlanBanner ──────────────────────────────────────────────────────────

function TodayPlanBanner({plan}: {plan: TodayPlan}) {
    const pct = (plan.day / plan.total_days) * 100;
    return (
        <View style={tp.banner}>
            <View style={tp.bannerLeft}>
                <Text style={tp.bannerBadge}>▶ 플랜 진행 중</Text>
                <Text style={tp.bannerDay}>{plan.day}일차 / {plan.total_days}일</Text>
            </View>
            <View style={tp.bannerTrackWrap}>
                <View style={tp.bannerTrack}>
                    <View style={[tp.bannerFill, {width: `${pct}%` as any}]}/>
                </View>
                <Text style={tp.bannerPct}>{Math.round(pct)}%</Text>
            </View>
        </View>
    );
}

const tp = StyleSheet.create({
    banner: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(184,255,78,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(184,255,78,0.25)'},
    bannerLeft: {gap: 2},
    bannerBadge: {fontSize: 10, fontWeight: '700', color: colors.accent},
    bannerDay: {fontSize: 11, color: colors.sub},
    bannerTrackWrap: {flexDirection: 'row', alignItems: 'center', gap: 6},
    bannerTrack: {width: 80, height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden'},
    bannerFill: {height: '100%', backgroundColor: colors.accent, borderRadius: 2},
    bannerPct: {fontSize: 10, color: colors.accent, fontWeight: '600', minWidth: 28, textAlign: 'right'},
});

// ── MacroBar ─────────────────────────────────────────────────────────────────

function MacroBar({label, value, total, color}: {label: string; value: number; total: number; color: string}) {
    const pct = Math.min(1, total > 0 ? value / total : 0);
    return (
        <View style={mb.row}>
            <Text style={mb.label}>{label}</Text>
            <View style={mb.track}>
                <View style={[mb.fill, {width: `${pct * 100}%` as any, backgroundColor: color}]}/>
            </View>
            <Text style={mb.val}>{Math.round(value)}g</Text>
        </View>
    );
}

const mb = StyleSheet.create({
    row: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5},
    label: {width: 18, fontSize: 11, color: colors.sub},
    track: {flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden'},
    fill: {height: '100%', borderRadius: 2},
    val: {width: 34, fontSize: 10, color: colors.sub, textAlign: 'right'},
});

// ── 식단 상세 모달 ──────────────────────────────────────────────────────────

function DietDetailModal({
    visible,
    onClose,
    summary,
    dateLabel,
    tdee,
    loading,
    mealType,
}: {
    visible: boolean;
    onClose: () => void;
    summary: DailyMealSummary | null;
    dateLabel: string;
    tdee: number;
    loading: boolean;
    mealType?: string;
}) {
    const allRecords = summary?.records ?? [];
    const records = mealType ? allRecords.filter((r) => r.meal_type === mealType) : allRecords;
    const totals = mealType
        ? records.length > 0
            ? {
                calories: records.reduce((s, r) => s + r.calories, 0),
                carbs_g: records.reduce((s, r) => s + r.carbs_g, 0),
                protein_g: records.reduce((s, r) => s + r.protein_g, 0),
                fat_g: records.reduce((s, r) => s + r.fat_g, 0),
              }
            : null
        : summary?.totals;
    const targetMacros = {
        carb: Math.round((tdee * 0.45) / 4),
        protein: Math.round((tdee * 0.3) / 4),
        fat: Math.round((tdee * 0.25) / 9),
    };

    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
            <Pressable style={md.overlay} onPress={onClose}>
                <Pressable style={md.sheet} onPress={() => {}}>
                    <View style={md.handle}/>
                    <View style={md.titleRow}>
                        <Text style={md.title}>{dateLabel} {mealType ? (MEAL_TYPE_LABEL[mealType] ?? mealType) : '식단'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{fontSize: 16, color: colors.sub}}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color={colors.accent} style={{marginTop: 32}}/>
                    ) : records.length === 0 ? (
                        <View style={md.empty}>
                            <Text style={md.emptyText}>기록된 식단이 없어요</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {records.map((r) => (
                                <View key={r.id} style={md.recordRow}>
                                    <Text style={md.recordEmoji}>{MEAL_TYPE_EMOJI[r.meal_type] ?? '🍽️'}</Text>
                                    <View style={{flex: 1}}>
                                        <Text style={md.recordType}>{MEAL_TYPE_LABEL[r.meal_type] ?? r.meal_type}</Text>
                                        <Text style={md.recordMacro}>
                                            탄 {Math.round(r.carbs_g)}g · 단 {Math.round(r.protein_g)}g · 지 {Math.round(r.fat_g)}g
                                        </Text>
                                    </View>
                                    <View style={{alignItems: 'flex-end', gap: 2}}>
                                        <Text style={md.recordCal}>{Math.round(r.calories)}<Text style={md.recordCalUnit}> kcal</Text></Text>
                                        {r.score !== null && r.score !== undefined && (
                                            <Text style={md.recordScore}>{r.score}<Text style={md.recordScoreUnit}>점</Text></Text>
                                        )}
                                    </View>
                                </View>
                            ))}

                            {totals && (
                                <View style={md.totalsBox}>
                                    <View style={md.totalsRow}>
                                        <Text style={md.totalsLabel}>총 칼로리</Text>
                                        <Text style={md.totalsValue}>{Math.round(totals.calories).toLocaleString()} kcal</Text>
                                    </View>
                                    <View style={md.divider}/>
                                    <MacroBar label="탄" value={Math.round(totals.carbs_g)} total={targetMacros.carb} color={colors.accent3}/>
                                    <MacroBar label="단" value={Math.round(totals.protein_g)} total={targetMacros.protein} color={colors.teal}/>
                                    <MacroBar label="지" value={Math.round(totals.fat_g)} total={targetMacros.fat} color={colors.amber}/>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const md = StyleSheet.create({
    overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end'},
    sheet: {
        backgroundColor: colors.surface2,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 36,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: colors.border,
    },
    handle: {width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16},
    titleRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
    title: {fontSize: 15, fontWeight: '700', color: colors.text},
    empty: {alignItems: 'center', paddingVertical: 40},
    emptyText: {fontSize: 13, color: colors.sub},
    recordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    recordEmoji: {fontSize: 20, width: 28, textAlign: 'center'},
    recordType: {fontSize: 13, fontWeight: '500', color: colors.text, marginBottom: 2},
    recordMacro: {fontSize: 10, color: colors.sub},
    recordCal: {fontSize: 14, fontWeight: '700', color: colors.accent},
    recordCalUnit: {fontSize: 10, fontWeight: '400', color: colors.sub},
    recordScore: {fontSize: 12, fontWeight: '700', color: colors.teal},
    recordScoreUnit: {fontSize: 9, fontWeight: '400', color: colors.sub},
    totalsBox: {
        marginTop: 14,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    totalsRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
    totalsLabel: {fontSize: 11, color: colors.sub},
    totalsValue: {fontSize: 15, fontWeight: '700', color: colors.accent},
    divider: {height: 1, backgroundColor: colors.border, marginBottom: 10},
});

// ── 주간 스트립 ───────────────────────────────────────────────────────────────

function WeekStrip({
    weekDates,
    weekData,
    weekLoading,
    tdee,
    today,
    onDayPress,
}: {
    weekDates: Date[];
    weekData: (DailyMealSummary | null)[];
    weekLoading: boolean;
    tdee: number;
    today: string;
    onDayPress: (idx: number) => void;
}) {
    return (
        <View style={ws.container}>
            <Text style={ws.sectionLabel}>이번 주 식단</Text>
            <View style={ws.row}>
                {weekDates.map((d, i) => {
                    const dateStr = toDateStr(d);
                    const isToday = dateStr === today;
                    const isFuture = dateStr > today;
                    const cal = weekData[i]?.totals.calories ?? 0;
                    const pct = Math.min(1, tdee > 0 ? cal / tdee : 0);
                    const hasData = !isFuture && cal > 0;

                    return (
                        <TouchableOpacity
                            key={dateStr}
                            style={ws.dayCol}
                            onPress={() => !isFuture && onDayPress(i)}
                            disabled={isFuture || weekLoading}
                            activeOpacity={0.7}
                        >
                            <Text style={[ws.dayLabel, isToday && ws.dayLabelToday]}>{WEEK_LABELS[i]}</Text>
                            <View style={ws.barTrack}>
                                {weekLoading ? (
                                    <View style={[ws.barFill, {height: '30%', opacity: 0.3, backgroundColor: colors.border}]}/>
                                ) : hasData ? (
                                    <View style={[
                                        ws.barFill,
                                        {height: `${Math.max(pct * 100, 8)}%` as any},
                                        isToday && ws.barFillToday,
                                    ]}/>
                                ) : null}
                            </View>
                            <Text style={[ws.calLabel, isToday && {color: colors.accent}]}>
                                {isFuture ? '' : hasData ? `${Math.round(cal / 100) * 100 >= 1000 ? `${(cal / 1000).toFixed(1)}k` : Math.round(cal)}` : '-'}
                            </Text>
                            {isToday && <View style={ws.todayDot}/>}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const ws = StyleSheet.create({
    container: {
        backgroundColor: colors.surface2,
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionLabel: {fontSize: 10, color: colors.sub, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10},
    row: {flexDirection: 'row', justifyContent: 'space-between'},
    dayCol: {flex: 1, alignItems: 'center', gap: 4},
    dayLabel: {fontSize: 10, color: colors.sub},
    dayLabelToday: {color: colors.accent, fontWeight: '700'},
    barTrack: {
        width: 20,
        height: 24,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    barFill: {width: '100%', backgroundColor: 'rgba(184,255,78,0.5)', borderRadius: 4},
    barFillToday: {backgroundColor: colors.accent},
    calLabel: {fontSize: 9, color: colors.sub},
    todayDot: {width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent},
});

// ── HomeScreen ────────────────────────────────────────────────────────────────

export function HomeScreen({navigation}: Props) {
    const user = useAuthStore((s) => s.user);
    const meals = useMealStore((s) => s.meals);
    const updateMeal = useMealStore((s) => s.updateMeal);
    const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

    const tdee = user?.tdee ?? 1820;
    const nickname = user?.nickname ?? '사용자';

    const today = toDateStr(new Date());
    const weekDates = getWeekDates();

    const [todaySummary, setTodaySummary] = useState<DailyMealSummary | null>(null);
    const [weekData, setWeekData] = useState<(DailyMealSummary | null)[]>(Array(7).fill(null));
    const [weekLoading, setWeekLoading] = useState(true);
    const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);

    // 모달 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [modalSummary, setModalSummary] = useState<DailyMealSummary | null>(null);
    const [modalDateLabel, setModalDateLabel] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [modalMealType, setModalMealType] = useState<string | undefined>(undefined);

    const loadTodayData = useCallback(() => {
        getTodayPlan().then(p => { if (p.active) setTodayPlan(p); else setTodayPlan(null); }).catch(() => {});
        getDailyMeals(today)
            .then((summary) => {
                setTodaySummary(summary);
                // 주간 데이터에서 오늘 날짜 업데이트
                const todayIdx = weekDates.findIndex(d => toDateStr(d) === today);
                if (todayIdx !== -1) {
                    setWeekData(prev => {
                        const next = [...prev];
                        next[todayIdx] = summary;
                        return next;
                    });
                }
                const grouped: Record<string, typeof summary.records> = {};
                for (const r of summary.records) {
                    (grouped[r.meal_type] ??= []).push(r);
                }
                for (const [mealType, records] of Object.entries(grouped)) {
                    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) continue;
                    const cal = records.reduce((s, r) => s + r.calories, 0);
                    const carb = records.reduce((s, r) => s + r.carbs_g, 0);
                    const protein = records.reduce((s, r) => s + r.protein_g, 0);
                    const fat = records.reduce((s, r) => s + r.fat_g, 0);
                    const scores = records.map((r) => r.score).filter((s): s is number => s !== null);
                    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
                    updateMeal(mealType as any, {
                        actualKcal: Math.round(cal),
                        macros: {carb: Math.round(carb), protein: Math.round(protein), fat: Math.round(fat)},
                        score: avgScore,
                    });
                }
            })
            .catch(() => {});
    }, [today]);

    useFocusEffect(useCallback(() => {
        loadTodayData();
    }, [loadTodayData]));

    useEffect(() => {
        (async () => {
            setWeekLoading(true);
            const results = await Promise.allSettled(
                weekDates.map((d) => getDailyMeals(toDateStr(d)))
            );
            setWeekData(results.map((r) => (r.status === 'fulfilled' ? r.value : null)));
            setWeekLoading(false);
        })();
    }, []);

    const openDayModal = useCallback(async (idx: number) => {
        const d = weekDates[idx];
        const dateStr = toDateStr(d);
        const label = `${d.getMonth() + 1}월 ${d.getDate()}일`;
        setModalDateLabel(label);

        if (weekData[idx]) {
            setModalSummary(weekData[idx]);
            setModalLoading(false);
        } else {
            setModalSummary(null);
            setModalLoading(true);
            try {
                const data = await getDailyMeals(dateStr);
                setModalSummary(data);
                setWeekData((prev) => {
                    const next = [...prev];
                    next[idx] = data;
                    return next;
                });
            } catch {
                setModalSummary(null);
            } finally {
                setModalLoading(false);
            }
        }
        setModalMealType(undefined);
        setModalVisible(true);
    }, [weekData, weekDates]);

    const openTodayModal = (mealType?: string) => {
        const d = new Date();
        setModalDateLabel(`${d.getMonth() + 1}월 ${d.getDate()}일`);
        setModalSummary(todaySummary);
        setModalMealType(mealType);
        setModalLoading(false);
        setModalVisible(true);
    };

    const totalConsumed = todaySummary?.totals.calories
        ?? meals.reduce((sum, m) => sum + (m.actualKcal ?? 0), 0);
    const caloriePct = Math.min(1, totalConsumed / tdee);

    const totalMacros = todaySummary
        ? {carb: Math.round(todaySummary.totals.carbs_g), protein: Math.round(todaySummary.totals.protein_g), fat: Math.round(todaySummary.totals.fat_g)}
        : meals.reduce(
            (acc, m) => ({
                carb: acc.carb + (m.macros?.carb ?? 0),
                protein: acc.protein + (m.macros?.protein ?? 0),
                fat: acc.fat + (m.macros?.fat ?? 0),
            }),
            {carb: 0, protein: 0, fat: 0},
        );
    const targetMacros = {
        carb: Math.round((tdee * 0.45) / 4),
        protein: Math.round((tdee * 0.3) / 4),
        fat: Math.round((tdee * 0.25) / 9),
    };

    const dateLabel = (() => {
        const d = new Date();
        return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    })();

    return (
        <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 24}}>
                {/* 헤더 */}
                <View style={s.header}>
                    <View>
                        <Text style={s.greeting}>안녕하세요, {nickname}님 👋</Text>
                        <Text style={s.greetingSub}>오늘도 건강한 하루!</Text>
                    </View>
                    <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notification')}>
                        <Text style={{fontSize: 20}}>🔔</Text>
                        {unreadCount > 0 && (
                            <View style={s.bellBadge}>
                                <Text style={s.bellBadgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* 칼로리 카드 */}
                <View style={s.calorieCard}>
                        <View style={s.calorieTop}>
                            <View>
                                <Text style={s.calorieSmall}>오늘 섭취</Text>
                                <Text style={s.calorieNum}>
                                    {Math.round(totalConsumed).toLocaleString()}
                                    <Text style={s.calorieUnit}> kcal</Text>
                                </Text>
                            </View>
                            <View style={{alignItems: 'flex-end'}}>
                                <Text style={s.calorieSmall}>목표</Text>
                                <Text style={[s.calorieNum, {color: colors.sub, fontSize: 16}]}>
                                    {tdee.toLocaleString()} kcal
                                </Text>
                            </View>
                        </View>
                        <View style={s.calorieTrack}>
                            <View style={[s.calorieFill, {width: `${caloriePct * 100}%` as any}]}/>
                        </View>
                        <View style={s.macroSection}>
                            <MacroBar label="탄" value={totalMacros.carb} total={targetMacros.carb} color={colors.accent3}/>
                            <MacroBar label="단" value={totalMacros.protein} total={targetMacros.protein} color={colors.teal}/>
                            <MacroBar label="지" value={totalMacros.fat} total={targetMacros.fat} color={colors.amber}/>
                        </View>
                    </View>

                {/* 주간 스트립 */}
                <WeekStrip
                    weekDates={weekDates}
                    weekData={weekData}
                    weekLoading={weekLoading}
                    tdee={tdee}
                    today={today}
                    onDayPress={openDayModal}
                />

                {/* 진행 중인 플랜 배너 */}
                {/*{todayPlan && <TodayPlanBanner plan={todayPlan}/>}*/}

                {/* 오늘 식단 섹션 */}
                <Text style={s.sectionTitle}>
                    오늘 식단 · {dateLabel} · {todayPlan ? `▶ 플랜 진행 중 - ${todayPlan.day}일차 / ${todayPlan.total_days}일` : ''}
                </Text>

                {meals.map((meal) => {
                    const planMeal = todayPlan?.meals.find(m => m.meal === meal.id);
                    const displayKcal = planMeal ? Math.round(planMeal.nutrition.calories) : null;
                    const displayIngredients = planMeal ? planMeal.title : '-';
                    return (
                    <TouchableOpacity
                        key={meal.id}
                        style={[s.mealCard, meal.actualKcal !== null && s.mealCardDone]}
                        activeOpacity={0.75}
                        onPress={() => openTodayModal(meal.id)}
                    >
                        <View style={s.mealLeft}>
                            <Text style={s.mealEmoji}>{meal.emoji}</Text>
                        </View>
                        <View style={s.mealMid}>
                            <Text style={s.mealMeta}>{meal.label}{displayKcal != null ? ` · ${displayKcal}kcal` : ''}</Text>
                            <Text style={s.mealIngredients} numberOfLines={1}>{displayIngredients}</Text>
                        </View>
                        {meal.actualKcal !== null ? (
                            <View style={s.doneBox}>
                                {meal.score !== null
                                    ? <Text style={s.scoreNum}>{meal.score}<Text style={s.scoreUnit}> 점</Text></Text>
                                    : <Text style={s.scoreNum}>{meal.actualKcal}<Text style={s.scoreUnit}> kcal</Text></Text>
                                }
                                <TouchableOpacity
                                    style={s.retakeBtn}
                                    onPress={(e) => { e.stopPropagation(); navigation.navigate('MealUpload', {mealId: meal.id}); }}
                                >
                                    <Text style={s.retakeBtnText}>재촬영</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={s.recordBtn}
                                onPress={(e) => { e.stopPropagation(); navigation.navigate('MealUpload', {mealId: meal.id}); }}
                            >
                                <Text style={s.recordBtnText}>📸 기록</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                    );
                })}

                {/* 레시피북 */}
                <TouchableOpacity style={s.recipeBookCard} onPress={() => navigation.navigate('RecipeBook')}>
                    <View style={s.recipeBookLeft}>
                        <Text style={s.recipeBookIcon}>📖</Text>
                        <View>
                            <Text style={s.recipeBookTitle}>레시피북 보기</Text>
                            <Text style={s.recipeBookDesc}>저장한 레시피 · 이전 식단 · AI 생성 레시피</Text>
                        </View>
                    </View>
                    <View style={s.recipeBookArrow}>
                        <Text style={{color: colors.text}}>›</Text>
                    </View>
                </TouchableOpacity>

                {/*/!* AI 레시피 생성 *!/*/}
                {/*<TouchableOpacity style={s.aiGenerateBtn} onPress={() => navigation.navigate('AIRecipeGenerate')}>*/}
                {/*    <Text style={s.aiGenerateBtnText}>✦ AI 레시피 생성하기</Text>*/}
                {/*</TouchableOpacity>*/}
            </ScrollView>

            <DietDetailModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                summary={modalSummary}
                dateLabel={modalDateLabel}
                tdee={tdee}
                loading={modalLoading}
                mealType={modalMealType}
            />
        </SafeAreaView>
    );
}

// ── 스타일 ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    scroll: {flex: 1, paddingHorizontal: 16},
    header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56},
    bellBtn: {padding: 4, position: 'relative'},
    bellBadge: {
        position: 'absolute', top: 2, right: 2,
        backgroundColor: colors.accent2,
        borderRadius: 8, minWidth: 16, height: 16,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
    },
    bellBadgeText: {fontSize: 9, fontWeight: '700', color: '#fff'},
    greeting: {fontSize: 16, fontWeight: '700', color: colors.text},
    greetingSub: {fontSize: 11, color: colors.sub, marginTop: 2},

    calorieCard: {
        backgroundColor: colors.surface2,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    calorieTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10},
    calorieSmall: {fontSize: 10, color: colors.sub, marginBottom: 2},
    calorieNum: {fontSize: 22, fontWeight: '700', color: colors.accent},
    calorieUnit: {fontSize: 13, fontWeight: '400', color: colors.sub},
    calorieTrack: {height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 12},
    calorieFill: {height: '100%', backgroundColor: colors.accent, borderRadius: 3},
    macroSection: {gap: 0},
    detailHint: {fontSize: 10, color: colors.sub, textAlign: 'right', marginTop: 6, opacity: 0.6},

    sectionTitle: {
        fontSize: 11, color: colors.sub,
        textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10,
    },
    mealCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface2, borderRadius: 12,
        padding: 12, marginBottom: 8,
        borderWidth: 1, borderColor: colors.border, gap: 10,
    },
    mealCardDone: {borderColor: 'rgba(184,255,78,0.18)'},
    mealLeft: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },
    mealEmoji: {fontSize: 18},
    mealMid: {flex: 1},
    mealMeta: {fontSize: 11, color: colors.sub, marginBottom: 2},
    mealIngredients: {fontSize: 13, fontWeight: '500', color: colors.text},
    doneBox: {alignItems: 'center', gap: 4},
    scoreBox: {alignItems: 'center', minWidth: 36},
    scoreNum: {fontSize: 16, fontWeight: '700', color: colors.accent},
    scoreUnit: {fontSize: 12, fontWeight: '400', color: colors.sub},
    retakeBtn: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: colors.border},
    retakeBtnText: {fontSize: 10, color: colors.sub},
    recordBtn: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(184,255,78,0.35)'},
    recordBtnText: {fontSize: 11, color: colors.accent},

    recipeBookCard: {
        marginTop: 10, marginBottom: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.surface2,
        borderWidth: 1, borderColor: 'rgba(184,255,78,0.35)',
        borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16,
    },
    recipeBookLeft: {flexDirection: 'row', alignItems: 'center'},
    recipeBookIcon: {fontSize: 22, marginRight: 14},
    recipeBookTitle: {fontSize: 16, fontWeight: '700', color: colors.text},
    recipeBookDesc: {marginTop: 2, fontSize: 11, color: colors.sub},
    recipeBookArrow: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },
    aiGenerateBtn: {
        height: 52, width: '100%', borderRadius: 14,
        backgroundColor: colors.accent,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    aiGenerateBtnText: {fontSize: 15, fontWeight: '700', color: '#111'},
});
