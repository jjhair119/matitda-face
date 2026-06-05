import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuthStore} from '../../store/authStore';
import {useMealStore} from '../../store/mealStore';
import {usePointStore} from '../../store/pointStore';
import {useOrderStore} from '../../store/orderStore';
import {MyPageStackParamList} from '../../navigation/MyPageStackNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MyPageStackParamList, 'MyPage'>;

const GOAL_LABELS: Record<string, string> = {
    lose: '🔥 체중 감량',
    maintain: '⚖️ 체중 유지',
    gain: '💪 근육 증가',
};

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const DUMMY_WEEK_SCORES: (number | null)[] = [88, 92, null, 76, null, null, null];

export function MyPageScreen({navigation}: Props) {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const meals = useMealStore((s) => s.meals);
    const points = usePointStore((s) => s.points);
    const coupons = usePointStore((s) => s.coupons);
    const orderCount = useOrderStore((s) => s.orders.length);

    const handleLogout = () => {
        Alert.alert('로그아웃', '정말 로그아웃할까요?', [
            {text: '취소', style: 'cancel'},
            {text: '로그아웃', style: 'destructive', onPress: logout},
        ]);
    };

    const todayScores = meals.filter((m) => m.score !== null).map((m) => m.score!);
    const todayAvg = todayScores.length > 0
        ? Math.round(todayScores.reduce((a, b) => a + b, 0) / todayScores.length)
        : null;

    const todayIdx = 4;
    const weekScores = DUMMY_WEEK_SCORES.map((score, idx) =>
        idx === todayIdx ? todayAvg : score,
    );
    const validScores = weekScores.filter((s): s is number => s !== null);
    const weekAvg = validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : null;

    const infoItems = [
        {label: '나이', value: user ? `${user.age}세` : '-'},
        {label: '키', value: user ? `${user.height}cm` : '-'},
        {label: '몸무게', value: user ? `${user.weight}kg` : '-'},
    ];

    const handle = user?.nickname
        ? `@${user.nickname.toLowerCase().replace(/\s+/g, '')}`
        : '@-';

    const availableCoupons = coupons.filter((c) => !c.used).length;

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 프로필 */}
                <View style={s.profileRow}>
                    <View style={s.avatar}>
                        <Text style={s.avatarEmoji}>🙂</Text>
                    </View>
                    <View style={s.profileInfo}>
                        <Text style={s.profileName}>{user?.nickname ?? '-'}</Text>
                        <Text style={s.profileSub}>{handle}</Text>
                        {user?.id && (
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert('내 ID', user.id, [{text: '확인'}]);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={s.profileId}>ID: {user.id}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('ProfileEdit')}>
                        <Text style={s.editBtnText}>편집</Text>
                    </TouchableOpacity>
                </View>

                {/* 내 정보 */}
                <Text style={s.sectionLabel}>내 정보</Text>
                <View style={s.card}>
                    <View style={s.infoGrid}>
                        {infoItems.map((item, idx) => (
                            <View
                                key={item.label}
                                style={[s.infoCell, idx < infoItems.length - 1 && s.infoCellBorder]}
                            >
                                <Text style={s.infoCellLabel}>{item.label}</Text>
                                <Text style={s.infoCellValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={s.divider}/>

                    <View style={s.infoRow}>
                        <Text style={s.infoRowLabel}>식단 목표</Text>
                        {user?.dietGoal ? (
                            <View style={s.chip}>
                                <Text style={s.chipText}>{GOAL_LABELS[user.dietGoal]}</Text>
                            </View>
                        ) : (
                            <Text style={s.infoRowValue}>-</Text>
                        )}
                    </View>

                    <View style={s.infoRow}>
                        <Text style={s.infoRowLabel}>TDEE</Text>
                        <Text style={s.tdeeValue}>
                            {user ? `${user.tdee.toLocaleString()} kcal/일` : '-'}
                        </Text>
                    </View>
                </View>

                {/* 포인트 & 쿠폰 */}
                <Text style={s.sectionLabel}>보유 포인트 & 쿠폰</Text>
                <TouchableOpacity
                    style={[s.card, s.pointCard]}
                    onPress={() => navigation.navigate('PointCoupon')}
                    activeOpacity={0.85}
                >
                    <View>
                        <Text style={s.pointValue}>{points.toLocaleString()} P</Text>
                        <Text style={s.pointSub}>
                            쿠폰 {availableCoupons}장 보유
                        </Text>
                    </View>
                    <View style={s.historyBtn}>
                        <Text style={s.historyBtnText}>내역 보기</Text>
                    </View>
                </TouchableOpacity>

                {/* 식단 히스토리 — API 미구현으로 임시 비활성화 */}
                {/* <View style={s.historyHeader}>
                    <Text style={s.sectionLabel}>식단 히스토리</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('DietHistory')}>
                        <Text style={s.viewAllBtn}>전체 보기 →</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={s.card}
                    onPress={() => navigation.navigate('DietHistory')}
                    activeOpacity={0.85}
                >
                    <View style={s.weekGrid}>
                        {WEEK_DAYS.map((day, idx) => {
                            const score = weekScores[idx];
                            const isToday = idx === todayIdx;
                            return (
                                <View key={day} style={s.weekCol}>
                                    <Text style={[s.dayLabel, isToday && s.dayLabelToday]}>{day}</Text>
                                    {score != null ? (
                                        <View style={[s.scoreCell, {backgroundColor: `rgba(184,255,78,${score / 100})`}]}>
                                            <Text style={s.scoreCellText}>{score}</Text>
                                        </View>
                                    ) : (
                                        <View style={[s.scoreCell, s.scoreCellEmpty, isToday && s.scoreCellToday]}/>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                    {weekAvg !== null ? (
                        <Text style={s.weekAvg}>
                            이번 주 평균 <Text style={s.weekAvgAccent}>{weekAvg}점</Text>
                        </Text>
                    ) : (
                        <Text style={s.weekAvg}>아직 기록된 식단이 없어요</Text>
                    )}
                </TouchableOpacity> */}

                {/* 건강 정보 */}
                {user && (user.allergies.length > 0 || user.diseases.length > 0) && (
                    <>
                        <Text style={s.sectionLabel}>건강 정보</Text>
                        <View style={s.card}>
                            {user.allergies.length > 0 && (
                                <View style={s.healthRow}>
                                    <Text style={s.infoRowLabel}>알레르기</Text>
                                    <Text style={s.healthValue} numberOfLines={2}>
                                        {user.allergies.join(' · ')}
                                    </Text>
                                </View>
                            )}
                            {user.diseases.length > 0 && (
                                <View style={[s.healthRow, user.allergies.length > 0 && {marginTop: 8}]}>
                                    <Text style={s.infoRowLabel}>기저 질환</Text>
                                    <Text style={s.healthValue} numberOfLines={2}>
                                        {user.diseases.join(' · ')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                {/* 선호 식재료 */}
                {user && user.preferredIngredients.length > 0 && (
                    <>
                        <Text style={s.sectionLabel}>선호 식재료</Text>
                        <View style={s.card}>
                            <View style={s.chipRow}>
                                {user.preferredIngredients.map((item) => (
                                    <View key={item} style={s.ingredientChip}>
                                        <Text style={s.ingredientChipText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}
                {/* 주문 내역 & 설정 */}
                <Text style={s.sectionLabel}>더보기</Text>
                <View style={s.card}>
                    <TouchableOpacity
                        style={s.menuRow}
                        onPress={() => navigation.navigate('OrderHistory')}
                    >
                        <Text style={s.menuIcon}>🛒</Text>
                        <Text style={s.menuLabel}>주문 내역</Text>
                        <Text style={s.menuCount}>{orderCount}건</Text>
                        <Text style={s.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <View style={s.divider}/>
                    <TouchableOpacity
                        style={s.menuRow}
                        onPress={() => navigation.navigate('PointCoupon')}
                    >
                        <Text style={s.menuIcon}>🎁</Text>
                        <Text style={s.menuLabel}>포인트 & 쿠폰</Text>
                        <Text style={s.menuCount}>{points.toLocaleString()}P</Text>
                        <Text style={s.menuArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                    <Text style={s.logoutText}>로그아웃</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    scroll: {flex: 1},
    scrollContent: {padding: 14, paddingBottom: 24},

    profileRow: {flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18},
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.teal,
    },
    avatarEmoji: {fontSize: 24},
    profileInfo: {flex: 1},
    profileName: {fontSize: 16, fontWeight: '700', color: colors.text},
    profileSub: {fontSize: 11, color: colors.sub, marginTop: 2},
    profileId: {fontSize: 10, color: colors.sub, marginTop: 3, opacity: 0.6},
    editBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    editBtnText: {fontSize: 12, color: colors.sub},

    sectionLabel: {
        fontSize: 10,
        color: colors.sub,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '500',
        marginBottom: 6,
        marginTop: 4,
    },
    card: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },

    infoGrid: {flexDirection: 'row'},
    infoCell: {flex: 1, alignItems: 'center', paddingVertical: 8},
    infoCellBorder: {borderRightWidth: 1, borderRightColor: colors.border},
    infoCellLabel: {fontSize: 11, color: colors.sub, marginBottom: 3},
    infoCellValue: {fontSize: 14, fontWeight: '600', color: colors.text},

    divider: {height: 1, backgroundColor: colors.border, marginVertical: 10},
    infoRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6},
    infoRowLabel: {fontSize: 11, color: colors.sub},
    infoRowValue: {fontSize: 12, color: colors.sub},

    chip: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        backgroundColor: 'rgba(184,255,78,0.15)',
        borderWidth: 1,
        borderColor: colors.accent,
    },
    chipText: {fontSize: 10, fontWeight: '500', color: colors.accent},
    tdeeValue: {fontSize: 12, fontWeight: '600', color: colors.accent},

    healthRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12},
    healthValue: {fontSize: 12, color: colors.text, flex: 1, textAlign: 'right'},

    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
    ingredientChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: 'rgba(78,201,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(78,201,255,0.2)',
    },
    ingredientChipText: {fontSize: 11, color: colors.accent3},

    pointCard: {
        backgroundColor: 'rgba(184,255,78,0.05)',
        borderColor: 'rgba(184,255,78,0.18)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointValue: {fontSize: 20, fontWeight: '700', color: colors.accent, letterSpacing: -0.3},
    pointSub: {fontSize: 11, color: colors.sub, marginTop: 2},
    historyBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(184,255,78,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.2)',
    },
    historyBtnText: {fontSize: 11, color: colors.accent},

    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 6,
    },
    viewAllBtn: {fontSize: 11, color: colors.accent},

    weekGrid: {flexDirection: 'row', marginBottom: 8},
    weekCol: {flex: 1, alignItems: 'center', gap: 6},
    dayLabel: {fontSize: 9, color: colors.sub},
    dayLabelToday: {color: colors.accent, fontWeight: '600'},
    scoreCell: {
        width: '90%',
        aspectRatio: 1,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreCellEmpty: {backgroundColor: colors.border},
    scoreCellToday: {borderWidth: 1, borderColor: 'rgba(184,255,78,0.4)'},
    scoreCellText: {fontSize: 8, fontWeight: '600', color: '#0f1117'},
    weekAvg: {fontSize: 11, color: colors.sub, marginTop: 2},
    weekAvgAccent: {color: colors.accent, fontWeight: '600'},

    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 4,
    },
    menuIcon: {fontSize: 15},
    menuLabel: {flex: 1, fontSize: 13, color: colors.text},
    menuCount: {fontSize: 12, color: colors.sub},
    menuArrow: {fontSize: 13, color: colors.sub},

    logoutBtn: {
        marginTop: 4,
        marginBottom: 32,
        paddingVertical: 13,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,107,74,0.25)',
        alignItems: 'center',
        backgroundColor: 'rgba(255,107,74,0.05)',
    },
    logoutText: {fontSize: 14, fontWeight: '500', color: colors.accent2},
});
