import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MarketStackParamList} from '../../navigation/MarketStackNavigator';
import {STORES} from '../../data/marketData';
import {useCartStore} from '../../store/cartStore';
import {usePointStore} from '../../store/pointStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MarketStackParamList, 'Checkout'>;
type PayMethod = 'kakao' | 'card';

const POINT_USE_AMOUNT = 1000;

export function CheckoutScreen({navigation}: Props) {
    const storeId = useCartStore((s) => s.storeId);
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore((s) => s.subtotal());
    const appliedCouponId = useCartStore((s) => s.appliedCouponId);
    const usePoints = useCartStore((s) => s.usePoints);
    const applyCoupon = useCartStore((s) => s.applyCoupon);
    const togglePoints = useCartStore((s) => s.togglePoints);
    const clearCart = useCartStore((s) => s.clearCart);

    const points = usePointStore((s) => s.points);
    const coupons = usePointStore((s) => s.coupons);
    const addPoints = usePointStore((s) => s.addPoints);
    const useCouponFromStore = usePointStore((s) => s.useCoupon);

    const [payMethod, setPayMethod] = useState<PayMethod>('kakao');

    const store = storeId ? STORES.find((s) => s.id === storeId) : null;
    const deliveryFee = store?.deliveryFee ?? 0;

    // 사용 가능한 쿠폰 (만료 안 된 것)
    const availableCoupons = coupons.filter(
        (c) => !c.used && new Date(c.expiresAt.replace(/\./g, '-')) >= new Date(),
    );

    // 적용된 쿠폰
    const appliedCoupon = appliedCouponId
        ? coupons.find((c) => c.id === appliedCouponId)
        : availableCoupons[0] ?? null;

    // 쿠폰 할인 계산
    const couponDiscount = (() => {
        if (!appliedCoupon) return 0;
        const raw = appliedCoupon.discount;
        if (raw.endsWith('%')) {
            return Math.floor((subtotal * parseInt(raw)) / 100);
        }
        return parseInt(raw.replace(/[^0-9]/g, ''), 10);
    })();

    const pointDiscount = usePoints && points >= POINT_USE_AMOUNT ? POINT_USE_AMOUNT : 0;
    const finalTotal = Math.max(0, subtotal + deliveryFee - couponDiscount - pointDiscount);

    // 주문 시 획득 포인트 (1000원당 100P)
    const earnedPoints = Math.floor(finalTotal / 1000) * 100;

    const handleCouponChange = () => {
        if (availableCoupons.length === 0) {
            Alert.alert('사용 가능한 쿠폰이 없어요');
            return;
        }
        const options = availableCoupons.map((c, i) => ({
            text: `${c.title} (${c.discount} 할인)`,
            onPress: () => applyCoupon(c.id),
        }));
        Alert.alert(
            '쿠폰 선택',
            '적용할 쿠폰을 선택하세요',
            [
                ...options,
                {text: '쿠폰 미적용', onPress: () => applyCoupon(null), style: 'destructive' as const},
                {text: '취소', style: 'cancel' as const},
            ],
        );
    };

    const handlePay = () => {
        if (items.length === 0) return;
        if (appliedCoupon) useCouponFromStore(appliedCoupon.id);
        if (usePoints && pointDiscount > 0) {
            addPoints(-pointDiscount, '식재료 구매 결제');
        }
        addPoints(earnedPoints, `식재료 구매 포인트 적립`);
        clearCart();
        navigation.replace('OrderComplete', {
            earnedPoints,
            deliveryTime: store?.deliveryTime ?? 30,
        });
    };

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>결제하기</Text>
                <View style={{width: 32}}/>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 160}}>
                {/* 주문 상품 */}
                <View style={s.section}>
                    <Text style={s.sectionLabel}>주문 상품</Text>
                    <View style={s.card}>
                        {items.map((item, idx) => (
                            <View
                                key={item.product.id}
                                style={[s.orderRow, idx < items.length - 1 && s.orderRowBorder]}
                            >
                                <Text style={s.orderName}>
                                    {item.product.emoji} {item.product.name}{' '}
                                    <Text style={s.orderQty}>× {item.quantity}</Text>
                                </Text>
                                <Text style={s.orderPrice}>
                                    {(item.product.price * item.quantity).toLocaleString()}원
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 쿠폰 */}
                <View style={s.section}>
                    <Text style={s.sectionLabel}>할인</Text>
                    <View style={[s.card, s.couponCard]}>
                        <View style={s.couponLeft}>
                            <Text style={s.couponTitle}>🎁 리워드 쿠폰</Text>
                            {appliedCoupon ? (
                                <>
                                    <Text style={s.couponName}>{appliedCoupon.title}</Text>
                                    <Text style={s.couponDiscount}>
                                        -{couponDiscount.toLocaleString()}원 할인 적용됨
                                    </Text>
                                </>
                            ) : (
                                <Text style={s.couponNone}>
                                    {availableCoupons.length > 0
                                        ? '쿠폰을 선택해주세요'
                                        : '사용 가능한 쿠폰 없음'}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={handleCouponChange} style={s.couponChangeBtn}>
                            <Text style={s.couponChangeBtnText}>변경</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 포인트 */}
                    <View style={[s.card, s.pointRow]}>
                        <View>
                            <Text style={s.pointTitle}>포인트 사용</Text>
                            <Text style={s.pointSub}>
                                보유 {points.toLocaleString()}P ·{' '}
                                {points >= POINT_USE_AMOUNT
                                    ? `${POINT_USE_AMOUNT.toLocaleString()}P 사용 가능`
                                    : '포인트 부족'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[s.toggle, usePoints && s.toggleOn]}
                            onPress={() => {
                                if (points < POINT_USE_AMOUNT) {
                                    Alert.alert('포인트 부족', `최소 ${POINT_USE_AMOUNT}P 이상 필요해요`);
                                    return;
                                }
                                togglePoints();
                            }}
                        >
                            <View style={[s.toggleThumb, usePoints && s.toggleThumbOn]}/>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 결제 수단 */}
                <View style={s.section}>
                    <Text style={s.sectionLabel}>결제 수단</Text>
                    <View style={s.payMethods}>
                        {([
                            {key: 'kakao' as const, label: '💛 카카오페이'},
                            {key: 'card' as const, label: '💳 신용카드'},
                        ]).map((method) => (
                            <TouchableOpacity
                                key={method.key}
                                style={[
                                    s.payMethod,
                                    payMethod === method.key && s.payMethodOn,
                                ]}
                                onPress={() => setPayMethod(method.key)}
                            >
                                <Text
                                    style={[
                                        s.payMethodText,
                                        payMethod === method.key && s.payMethodTextOn,
                                    ]}
                                >
                                    {method.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 금액 요약 */}
                <View style={s.section}>
                    <Text style={s.sectionLabel}>결제 금액</Text>
                    <View style={s.card}>
                        <View style={s.priceRow}>
                            <Text style={s.priceLabel}>상품 금액</Text>
                            <Text style={s.priceValue}>{subtotal.toLocaleString()}원</Text>
                        </View>
                        <View style={s.priceRow}>
                            <Text style={s.priceLabel}>배달비</Text>
                            <Text style={[s.priceValue, deliveryFee === 0 && {color: colors.teal}]}>
                                {deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}
                            </Text>
                        </View>
                        {couponDiscount > 0 && (
                            <View style={s.priceRow}>
                                <Text style={s.priceLabel}>쿠폰 할인</Text>
                                <Text style={[s.priceValue, {color: colors.amber}]}>
                                    -{couponDiscount.toLocaleString()}원
                                </Text>
                            </View>
                        )}
                        {pointDiscount > 0 && (
                            <View style={s.priceRow}>
                                <Text style={s.priceLabel}>포인트 할인</Text>
                                <Text style={[s.priceValue, {color: colors.accent}]}>
                                    -{pointDiscount.toLocaleString()}원
                                </Text>
                            </View>
                        )}
                        <View style={[s.priceRow, s.priceTotalRow]}>
                            <Text style={s.priceTotalLabel}>최종 결제</Text>
                            <Text style={s.priceTotalValue}>{finalTotal.toLocaleString()}원</Text>
                        </View>
                        {earnedPoints > 0 && (
                            <View style={s.earnRow}>
                                <Text style={s.earnText}>
                                    ✨ 결제 시 <Text style={{color: colors.accent, fontWeight: '700'}}>{earnedPoints.toLocaleString()}P</Text> 적립 예정
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* 결제 버튼 */}
            <View style={s.footer}>
                <TouchableOpacity style={s.payBtn} onPress={handlePay}>
                    <Text style={s.payBtnText}>{finalTotal.toLocaleString()}원 결제하기</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {padding: 4},
    backText: {fontSize: 22, color: colors.text},
    headerTitle: {fontSize: 16, fontWeight: '600', color: colors.text},

    section: {paddingHorizontal: 16, marginTop: 16},
    sectionLabel: {
        fontSize: 10,
        color: colors.sub,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontWeight: '500',
        marginBottom: 8,
    },
    card: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        marginBottom: 8,
    },

    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
    },
    orderRowBorder: {borderBottomWidth: 1, borderBottomColor: colors.border},
    orderName: {fontSize: 13, color: colors.text, flex: 1},
    orderQty: {color: colors.sub},
    orderPrice: {fontSize: 13, fontWeight: '600', color: colors.text},

    couponCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251,191,36,0.05)',
        borderColor: 'rgba(251,191,36,0.2)',
        gap: 12,
    },
    couponLeft: {flex: 1},
    couponTitle: {fontSize: 12, fontWeight: '600', color: colors.amber, marginBottom: 2},
    couponName: {fontSize: 12, color: colors.text, marginBottom: 3},
    couponDiscount: {fontSize: 12, fontWeight: '600', color: colors.amber},
    couponNone: {fontSize: 12, color: colors.sub},
    couponChangeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(251,191,36,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(251,191,36,0.2)',
    },
    couponChangeBtnText: {fontSize: 11, color: colors.amber},

    pointRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    pointTitle: {fontSize: 13, fontWeight: '500', color: colors.text},
    pointSub: {fontSize: 11, color: colors.sub, marginTop: 2},
    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.border2,
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    toggleOn: {backgroundColor: colors.accent},
    toggleThumb: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#fff',
    },
    toggleThumbOn: {alignSelf: 'flex-end'},

    payMethods: {flexDirection: 'row', gap: 8},
    payMethod: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    payMethodOn: {
        backgroundColor: 'rgba(184,255,78,0.06)',
        borderColor: colors.accent,
    },
    payMethodText: {fontSize: 13, color: colors.sub, fontWeight: '500'},
    payMethodTextOn: {color: colors.accent},

    priceRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
    priceLabel: {fontSize: 13, color: colors.sub},
    priceValue: {fontSize: 13, color: colors.text},
    priceTotalRow: {
        paddingTop: 10,
        marginTop: 4,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginBottom: 4,
    },
    priceTotalLabel: {fontSize: 15, fontWeight: '700', color: colors.text},
    priceTotalValue: {fontSize: 18, fontWeight: '700', color: colors.accent},
    earnRow: {
        marginTop: 6,
        padding: 8,
        backgroundColor: 'rgba(184,255,78,0.05)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.12)',
    },
    earnText: {fontSize: 11, color: colors.sub},

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: 16,
        paddingBottom: 28,
    },
    payBtn: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    payBtnText: {fontSize: 15, fontWeight: '700', color: colors.bg},
});
