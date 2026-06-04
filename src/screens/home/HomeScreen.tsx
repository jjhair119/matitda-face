import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuthStore} from '../../store/authStore';
import {useMealStore} from '../../store/mealStore';
import {useNotificationStore} from '../../store/notificationStore';
import {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

function MacroBar({label, value, total, color}: {label: string; value: number; total: number; color: string}) {
    const pct = Math.min(1, value / total);
    return (
        <View style={mb.row}>
            <Text style={mb.label}>{label}</Text>
            <View style={mb.track}>
                <View style={[mb.fill, {width: `${pct * 100}%` as any, backgroundColor: color}]}/>
            </View>
            <Text style={mb.val}>{Math.round(pct * 100)}%</Text>
        </View>
    );
}

const mb = StyleSheet.create({
    row: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5},
    label: {width: 18, fontSize: 11, color: colors.sub},
    track: {flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden'},
    fill: {height: '100%', borderRadius: 2},
    val: {width: 28, fontSize: 10, color: colors.sub, textAlign: 'right'},
});

export function HomeScreen({navigation}: Props) {
    const user = useAuthStore((s) => s.user);
    const meals = useMealStore((s) => s.meals);
    const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

    const tdee = user?.tdee ?? 1820;
    const nickname = user?.nickname ?? '사용자';

    const totalConsumed = meals.reduce((sum, m) => sum + (m.actualKcal ?? 0), 0);
    const caloriePct = Math.min(1, totalConsumed / tdee);

    const today = new Date();
    const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`;

    const totalMacros = meals.reduce(
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

    return (
        <SafeAreaView style={s.container}>
            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 24}}>
                {/* 헤더 */}
                <View style={s.header}>
                    <View>
                        <Text style={s.greeting}>안녕하세요, {nickname}님 👋</Text>
                        <Text style={s.greetingSub}>오늘도 건강한 하루!</Text>
                    </View>
                    <TouchableOpacity
                        style={s.bellBtn}
                        onPress={() => navigation.navigate('Notification')}
                    >
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
                                {totalConsumed.toLocaleString()}
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

                {/* 식단 섹션 */}
                <Text style={s.sectionTitle}>오늘 식단 · {dateLabel}</Text>
                {meals.map((meal) => (
                    <View key={meal.id} style={[s.mealCard, meal.score !== null && s.mealCardDone]}>
                        <View style={s.mealLeft}>
                            <Text style={s.mealEmoji}>{meal.emoji}</Text>
                        </View>
                        <View style={s.mealMid}>
                            <Text style={s.mealMeta}>{meal.label} · {meal.expectedKcal}kcal</Text>
                            <Text style={s.mealIngredients} numberOfLines={1}>{meal.ingredients}</Text>
                        </View>
                        {meal.score !== null ? (
                            <View style={s.scoreBox}>
                                <Text style={s.scoreNum}>{meal.score}</Text>
                                <Text style={s.scoreUnit}>점</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={s.recordBtn}
                                onPress={() => navigation.navigate('MealUpload', {mealId: meal.id})}
                            >
                                <Text style={s.recordBtnText}>📸 기록</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                {/* 레시피북 */}
                <TouchableOpacity
                    style={s.recipeBookCard}
                    onPress={() => navigation.navigate('RecipeBook')}
                >
                    <View style={s.recipeBookLeft}>
                        <Text style={s.recipeBookIcon}>📸</Text>

                        <View>
                            <Text style={s.recipeBookTitle}>
                                레시피북 보기
                            </Text>

                            <Text style={s.recipeBookDesc}>
                                저장한 레시피 · 이전 식단 · AI 생성 레시피
                            </Text>
                        </View>
                    </View>

                    <View style={s.recipeBookArrow}>
                        <Text style={{color: colors.text}}>›</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
        recipeBookCard: {
        marginTop: 10,
        marginBottom: 12,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        backgroundColor: colors.surface2,

        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.35)',

        borderRadius: 16,

        paddingHorizontal: 16,
        paddingVertical: 16,
    },

    recipeBookLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    recipeBookIcon: {
        fontSize: 22,
        marginRight: 14,
    },

    recipeBookTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },

    recipeBookDesc: {
        marginTop: 2,
        fontSize: 11,
        color: colors.sub,
    },

    recipeBookArrow: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.surface,

        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {flex: 1, backgroundColor: colors.bg},
    scroll: {flex: 1, paddingHorizontal: 16},
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 56,
    },
    bellBtn: {padding: 4, position: 'relative'},
    bellBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: colors.accent2,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    bellBadgeText: {fontSize: 9, fontWeight: '700', color: '#fff'},
    greeting: {fontSize: 16, fontWeight: '700', color: colors.text},
    greetingSub: {fontSize: 11, color: colors.sub, marginTop: 2},
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calorieCard: {
        backgroundColor: colors.surface2,
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    calorieTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    calorieSmall: {fontSize: 10, color: colors.sub, marginBottom: 2},
    calorieNum: {fontSize: 22, fontWeight: '700', color: colors.accent},
    calorieUnit: {fontSize: 13, fontWeight: '400', color: colors.sub},
    calorieTrack: {
        height: 5,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 12,
    },
    calorieFill: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: 3,
    },
    macroSection: {gap: 0},
    sectionTitle: {
        fontSize: 11,
        color: colors.sub,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 10,
    },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 10,
    },
    mealCardDone: {
        borderColor: 'rgba(184,255,78,0.18)',
    },
    mealLeft: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mealEmoji: {fontSize: 18},
    mealMid: {flex: 1},
    mealMeta: {fontSize: 11, color: colors.sub, marginBottom: 2},
    mealIngredients: {fontSize: 13, fontWeight: '500', color: colors.text},
    scoreBox: {alignItems: 'center', minWidth: 36},
    scoreNum: {fontSize: 18, fontWeight: '700', color: colors.accent},
    scoreUnit: {fontSize: 9, color: colors.sub},
    recordBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.35)',
    },
    recordBtnText: {fontSize: 11, color: colors.accent},
});
