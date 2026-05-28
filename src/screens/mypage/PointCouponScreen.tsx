import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MyPageStackParamList} from '../../navigation/MyPageStackNavigator';
import {usePointStore, Coupon, PointTransaction} from '../../store/pointStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MyPageStackParamList, 'PointCoupon'>;
type TabKey = 'history' | 'coupon';

function TransactionItem({item}: {item: PointTransaction}) {
    const isPositive = item.amount > 0;
    return (
        <View style={ts.row}>
            <View style={ts.iconWrap}>
                <Text style={ts.icon}>{isPositive ? '⬆️' : '⬇️'}</Text>
            </View>
            <View style={ts.info}>
                <Text style={ts.desc}>{item.description}</Text>
                <Text style={ts.date}>{item.date}</Text>
            </View>
            <Text style={[ts.amount, isPositive ? ts.amountPos : ts.amountNeg]}>
                {isPositive ? '+' : ''}{item.amount.toLocaleString()}P
            </Text>
        </View>
    );
}

function CouponItem({item, onUse}: {item: Coupon; onUse: (id: string) => void}) {
    const isExpired = item.used || new Date(item.expiresAt.replace(/\./g, '-')) < new Date();

    return (
        <View style={[cs.card, isExpired && cs.cardUsed]}>
            <View style={cs.left}>
                {item.badge ? (
                    <View style={cs.badge}>
                        <Text style={cs.badgeText}>{item.badge}</Text>
                    </View>
                ) : null}
                <Text style={[cs.title, isExpired && cs.titleUsed]}>{item.title}</Text>
                <Text style={cs.desc}>{item.description}</Text>
                <Text style={cs.minOrder}>최소 주문 {item.minOrder.toLocaleString()}원</Text>
            </View>
            <View style={cs.right}>
                <Text style={[cs.discount, isExpired && cs.discountUsed]}>{item.discount}</Text>
                <Text style={cs.expires}>~{item.expiresAt}</Text>
                {item.used ? (
                    <View style={cs.usedBadge}>
                        <Text style={cs.usedBadgeText}>사용됨</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={cs.useBtn}
                        onPress={() => onUse(item.id)}
                    >
                        <Text style={cs.useBtnText}>사용하기</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

export function PointCouponScreen({navigation}: Props) {
    const [tab, setTab] = useState<TabKey>('history');
    const points = usePointStore((s) => s.points);
    const history = usePointStore((s) => s.history);
    const coupons = usePointStore((s) => s.coupons);
    const useCoupon = usePointStore((s) => s.useCoupon);

    const monthEarned = history
        .filter((h) => h.date.startsWith('2026.05') && h.amount > 0)
        .reduce((sum, h) => sum + h.amount, 0);
    const monthSpent = history
        .filter((h) => h.date.startsWith('2026.05') && h.amount < 0)
        .reduce((sum, h) => sum + Math.abs(h.amount), 0);

    const availableCoupons = coupons.filter((c) => !c.used);
    const usedCoupons = coupons.filter((c) => c.used);

    const handleUseCoupon = (id: string) => {
        Alert.alert('쿠폰 사용', '식재료 구매 시 쿠폰이 적용됩니다.', [
            {text: '취소', style: 'cancel'},
            {text: '확인', onPress: () => useCoupon(id)},
        ]);
    };

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>포인트 & 쿠폰</Text>
                <View style={{width: 32}}/>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 포인트 히어로 카드 */}
                <View style={s.heroCard}>
                    <Text style={s.heroLabel}>보유 포인트</Text>
                    <Text style={s.heroPoint}>{points.toLocaleString()} P</Text>
                    <View style={s.heroStats}>
                        <View style={s.heroStat}>
                            <Text style={s.heroStatLabel}>이번 달 적립</Text>
                            <Text style={s.heroStatValue}>+{monthEarned.toLocaleString()}P</Text>
                        </View>
                        <View style={s.heroStatDivider}/>
                        <View style={s.heroStat}>
                            <Text style={s.heroStatLabel}>이번 달 사용</Text>
                            <Text style={[s.heroStatValue, {color: colors.sub}]}>
                                -{monthSpent.toLocaleString()}P
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 적립 안내 */}
                <View style={s.tipCard}>
                    <Text style={s.tipTitle}>💡 포인트 적립 방법</Text>
                    <View style={s.tipRows}>
                        {[
                            ['식단 기록 완료 (60점 미만)', '+100P'],
                            ['식단 기록 완료 (60~89점)', '+200P'],
                            ['식단 기록 완료 (90점 이상)', '+300P'],
                            ['5일 연속 달성 보너스', '+300P'],
                            ['7일 연속 달성 보너스', '+500P'],
                            ['커뮤니티 게시글 작성', '+100P'],
                        ].map(([desc, pt]) => (
                            <View key={desc} style={s.tipRow}>
                                <Text style={s.tipDesc}>{desc}</Text>
                                <Text style={s.tipPt}>{pt}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 탭 */}
                <View style={s.tabBar}>
                    <TouchableOpacity
                        style={[s.tabItem, tab === 'history' && s.tabItemOn]}
                        onPress={() => setTab('history')}
                    >
                        <Text style={[s.tabLabel, tab === 'history' && s.tabLabelOn]}>
                            포인트 내역
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.tabItem, tab === 'coupon' && s.tabItemOn]}
                        onPress={() => setTab('coupon')}
                    >
                        <Text style={[s.tabLabel, tab === 'coupon' && s.tabLabelOn]}>
                            쿠폰 ({availableCoupons.length}장)
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 포인트 내역 */}
                {tab === 'history' && (
                    <View style={s.listWrap}>
                        {history.map((item) => (
                            <TransactionItem key={item.id} item={item}/>
                        ))}
                    </View>
                )}

                {/* 쿠폰 목록 */}
                {tab === 'coupon' && (
                    <View style={s.listWrap}>
                        {availableCoupons.length > 0 && (
                            <>
                                <Text style={s.couponGroupLabel}>사용 가능 {availableCoupons.length}장</Text>
                                {availableCoupons.map((c) => (
                                    <CouponItem key={c.id} item={c} onUse={handleUseCoupon}/>
                                ))}
                            </>
                        )}
                        {usedCoupons.length > 0 && (
                            <>
                                <Text style={[s.couponGroupLabel, {marginTop: 16}]}>
                                    사용 완료 {usedCoupons.length}장
                                </Text>
                                {usedCoupons.map((c) => (
                                    <CouponItem key={c.id} item={c} onUse={handleUseCoupon}/>
                                ))}
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

/* TransactionItem styles */
const ts = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {fontSize: 14},
    info: {flex: 1},
    desc: {fontSize: 13, color: colors.text, marginBottom: 2},
    date: {fontSize: 11, color: colors.sub},
    amount: {fontSize: 14, fontWeight: '700'},
    amountPos: {color: colors.accent},
    amountNeg: {color: colors.sub},
});

/* CouponItem styles */
const cs = StyleSheet.create({
    card: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        marginBottom: 10,
        overflow: 'hidden',
    },
    cardUsed: {opacity: 0.5},
    left: {flex: 1, padding: 14},
    badge: {
        backgroundColor: 'rgba(251,191,36,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(251,191,36,0.3)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    badgeText: {fontSize: 10, color: colors.amber, fontWeight: '600'},
    title: {fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4},
    titleUsed: {color: colors.sub},
    desc: {fontSize: 11, color: colors.sub, marginBottom: 3},
    minOrder: {fontSize: 10, color: colors.sub},
    right: {
        width: 90,
        backgroundColor: 'rgba(184,255,78,0.04)',
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    discount: {fontSize: 20, fontWeight: '700', color: colors.accent},
    discountUsed: {color: colors.sub},
    expires: {fontSize: 9, color: colors.sub},
    useBtn: {
        backgroundColor: colors.accent,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginTop: 4,
    },
    useBtnText: {fontSize: 11, fontWeight: '700', color: colors.bg},
    usedBadge: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginTop: 4,
    },
    usedBadgeText: {fontSize: 11, color: colors.sub},
});

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {padding: 4},
    backText: {fontSize: 20, color: colors.text},
    headerTitle: {fontSize: 15, fontWeight: '600', color: colors.text},

    heroCard: {
        margin: 16,
        backgroundColor: 'rgba(184,255,78,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.2)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    heroLabel: {fontSize: 12, color: colors.sub, marginBottom: 4},
    heroPoint: {fontSize: 36, fontWeight: '700', color: colors.accent, letterSpacing: -1},
    heroStats: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(184,255,78,0.15)',
        width: '100%',
    },
    heroStat: {flex: 1, alignItems: 'center'},
    heroStatDivider: {width: 1, backgroundColor: 'rgba(184,255,78,0.15)'},
    heroStatLabel: {fontSize: 11, color: colors.sub, marginBottom: 4},
    heroStatValue: {fontSize: 15, fontWeight: '700', color: colors.accent},

    tipCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
    },
    tipTitle: {fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 10},
    tipRows: {gap: 6},
    tipRow: {flexDirection: 'row', justifyContent: 'space-between'},
    tipDesc: {fontSize: 11, color: colors.sub},
    tipPt: {fontSize: 11, fontWeight: '600', color: colors.accent},

    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginHorizontal: 16,
    },
    tabItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabItemOn: {borderBottomColor: colors.accent},
    tabLabel: {fontSize: 13, color: colors.sub},
    tabLabelOn: {color: colors.accent, fontWeight: '600'},

    listWrap: {paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32},
    couponGroupLabel: {
        fontSize: 11,
        color: colors.sub,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        fontWeight: '500',
        marginBottom: 10,
        marginTop: 8,
    },
});
