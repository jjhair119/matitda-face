import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MarketStackParamList} from '../../navigation/MarketStackNavigator';
import {STORES} from '../../data/marketData';
import {useCartStore, CartItem} from '../../store/cartStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MarketStackParamList, 'Cart'>;

function CartItemRow({
    item,
    onIncrease,
    onDecrease,
    onRemove,
}: {
    item: CartItem;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
}) {
    return (
        <View style={cr.row}>
            <View style={cr.emojiWrap}>
                <Text style={cr.emoji}>{item.product.emoji}</Text>
            </View>
            <View style={cr.info}>
                <Text style={cr.name}>{item.product.name}</Text>
                <Text style={cr.unit}>{item.product.unit}</Text>
                <View style={cr.qtyRow}>
                    <TouchableOpacity style={cr.qtyBtn} onPress={onDecrease}>
                        <Text style={cr.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={cr.qty}>{item.quantity}</Text>
                    <TouchableOpacity style={[cr.qtyBtn, cr.qtyBtnFill]} onPress={onIncrease}>
                        <Text style={[cr.qtyBtnText, {color: colors.bg}]}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={cr.priceCol}>
                <Text style={cr.price}>
                    {(item.product.price * item.quantity).toLocaleString()}원
                </Text>
                <TouchableOpacity onPress={onRemove} style={cr.removeBtn}>
                    <Text style={cr.removeText}>삭제</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export function CartScreen({navigation}: Props) {
    const storeId = useCartStore((s) => s.storeId);
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore((s) => s.subtotal());
    const addItem = useCartStore((s) => s.addItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
    const clearCart = useCartStore((s) => s.clearCart);

    const store = storeId ? STORES.find((s) => s.id === storeId) : null;
    const deliveryFee = store?.deliveryFee ?? 0;
    const minOrder = store?.minOrder ?? 0;
    const isMinOrderMet = subtotal >= minOrder;
    const total = subtotal + deliveryFee;

    if (items.length === 0) {
        return (
            <SafeAreaView style={s.container} edges={['top']}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Text style={s.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>장바구니</Text>
                    <View style={{width: 32}}/>
                </View>
                <View style={s.empty}>
                    <Text style={s.emptyIcon}>🛒</Text>
                    <Text style={s.emptyTitle}>장바구니가 비었어요</Text>
                    <Text style={s.emptySub}>식재료를 담아보세요</Text>
                    <TouchableOpacity
                        style={s.emptyBtn}
                        onPress={() => navigation.navigate('MarketMain')}
                    >
                        <Text style={s.emptyBtnText}>쇼핑하러 가기</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>장바구니</Text>
                <TouchableOpacity onPress={clearCart}>
                    <Text style={s.clearText}>전체삭제</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 160}}>
                {/* 매장 정보 */}
                {store && (
                    <View style={s.storeBanner}>
                        <Text style={s.storeIcon}>{store.emoji}</Text>
                        <Text style={s.storeName}>{store.name}</Text>
                        <Text style={s.storeDelivery}>
                            배달 {store.deliveryTime}분
                        </Text>
                    </View>
                )}

                {/* 최소 주문 금액 경고 */}
                {!isMinOrderMet && (
                    <View style={s.minOrderWarning}>
                        <Text style={s.minOrderText}>
                            최소 주문 금액까지{' '}
                            <Text style={s.minOrderAccent}>
                                {(minOrder - subtotal).toLocaleString()}원
                            </Text>{' '}
                            더 필요해요
                        </Text>
                        <View style={s.minOrderBar}>
                            <View
                                style={[
                                    s.minOrderFill,
                                    {width: `${Math.min((subtotal / minOrder) * 100, 100)}%` as any},
                                ]}
                            />
                        </View>
                    </View>
                )}

                {/* 상품 목록 */}
                <View style={s.itemList}>
                    {items.map((item) => (
                        <CartItemRow
                            key={item.product.id}
                            item={item}
                            onIncrease={() => addItem(item.product)}
                            onDecrease={() => updateQuantity(item.product.id, -1)}
                            onRemove={() => removeItem(item.product.id)}
                        />
                    ))}
                </View>

                {/* 금액 요약 */}
                <View style={s.summaryCard}>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>상품 금액</Text>
                        <Text style={s.summaryValue}>{subtotal.toLocaleString()}원</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryLabel}>배달비</Text>
                        <Text style={[s.summaryValue, deliveryFee === 0 && {color: colors.teal}]}>
                            {deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}
                        </Text>
                    </View>
                    <View style={[s.summaryRow, s.summaryTotal]}>
                        <Text style={s.summaryTotalLabel}>합계</Text>
                        <Text style={s.summaryTotalValue}>{total.toLocaleString()}원</Text>
                    </View>
                </View>

                {/* 쿠폰/포인트 안내 */}
                <View style={s.benefitHint}>
                    <Text style={s.benefitText}>🎁 결제 시 쿠폰 및 포인트를 사용할 수 있어요</Text>
                </View>
            </ScrollView>

            {/* 결제 버튼 */}
            <View style={s.footer}>
                <TouchableOpacity
                    style={[s.checkoutBtn, !isMinOrderMet && s.checkoutBtnDisabled]}
                    disabled={!isMinOrderMet}
                    onPress={() => navigation.navigate('Checkout')}
                >
                    <Text style={s.checkoutBtnText}>
                        {isMinOrderMet
                            ? `${total.toLocaleString()}원 결제하기`
                            : `최소 주문 ${minOrder.toLocaleString()}원`}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const cr = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    emojiWrap: {
        width: 52,
        height: 52,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {fontSize: 24},
    info: {flex: 1},
    name: {fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 2},
    unit: {fontSize: 11, color: colors.sub, marginBottom: 8},
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        alignSelf: 'flex-start',
        backgroundColor: colors.surface2,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    qtyBtn: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBtnFill: {backgroundColor: colors.accent},
    qtyBtnText: {fontSize: 16, color: colors.text, fontWeight: '700'},
    qty: {fontSize: 14, fontWeight: '700', color: colors.text, minWidth: 20, textAlign: 'center'},
    priceCol: {alignItems: 'flex-end', gap: 8},
    price: {fontSize: 14, fontWeight: '700', color: colors.text},
    removeBtn: {padding: 4},
    removeText: {fontSize: 11, color: colors.sub},
});

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
    clearText: {fontSize: 14, color: colors.sub},

    empty: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
    emptyIcon: {fontSize: 48, marginBottom: 4},
    emptyTitle: {fontSize: 16, fontWeight: '700', color: colors.text},
    emptySub: {fontSize: 13, color: colors.sub},
    emptyBtn: {
        marginTop: 12,
        backgroundColor: colors.accent,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 11,
    },
    emptyBtnText: {fontSize: 14, fontWeight: '700', color: colors.bg},

    storeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: colors.surface2,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    storeIcon: {fontSize: 16},
    storeName: {flex: 1, fontSize: 13, fontWeight: '600', color: colors.text},
    storeDelivery: {fontSize: 11, color: colors.sub},

    minOrderWarning: {
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: 'rgba(255,107,74,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,107,74,0.2)',
        borderRadius: 10,
        padding: 12,
    },
    minOrderText: {fontSize: 12, color: colors.sub, marginBottom: 8},
    minOrderAccent: {color: colors.accent2, fontWeight: '700'},
    minOrderBar: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    minOrderFill: {height: 4, backgroundColor: colors.accent2, borderRadius: 2},

    itemList: {paddingHorizontal: 16},

    summaryCard: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 8,
    },
    summaryRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    summaryLabel: {fontSize: 13, color: colors.sub},
    summaryValue: {fontSize: 13, color: colors.text},
    summaryTotal: {
        paddingTop: 8,
        marginTop: 4,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    summaryTotalLabel: {fontSize: 14, fontWeight: '700', color: colors.text},
    summaryTotalValue: {fontSize: 16, fontWeight: '700', color: colors.text},

    benefitHint: {
        marginHorizontal: 16,
        marginTop: 10,
        backgroundColor: 'rgba(184,255,78,0.05)',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.15)',
    },
    benefitText: {fontSize: 11, color: colors.accent},

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
    checkoutBtn: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    checkoutBtnDisabled: {opacity: 0.4},
    checkoutBtnText: {fontSize: 15, fontWeight: '700', color: colors.bg},
});
