import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MyPageStackParamList} from '../../navigation/MyPageStackNavigator';
import {useOrderStore, Order} from '../../store/orderStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MyPageStackParamList, 'OrderHistory'>;

function formatDate(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const h = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${y}.${m}.${day} ${h}:${min}`;
}

function isDelivered(order: Order): boolean {
    const elapsed = (Date.now() - new Date(order.orderedAt).getTime()) / 1000 / 60;
    return elapsed > order.deliveryTime + 5;
}

function OrderCard({order}: {order: Order}) {
    const delivered = isDelivered(order);
    const itemSummary = order.items
        .map((i) => `${i.emoji} ${i.name} ×${i.quantity}`)
        .join('  ');

    return (
        <View style={s.card}>
            <View style={s.cardTop}>
                <View style={s.storeRow}>
                    <Text style={s.storeEmoji}>{order.storeEmoji}</Text>
                    <Text style={s.storeName}>{order.storeName}</Text>
                </View>
                <View style={[s.statusChip, delivered ? s.statusDone : s.statusOngoing]}>
                    <Text style={[s.statusText, delivered ? s.statusTextDone : s.statusTextOngoing]}>
                        {delivered ? '배달 완료' : '배달 중'}
                    </Text>
                </View>
            </View>

            <View style={s.metaRow}>
                <Text style={s.metaText}>{formatDate(order.orderedAt)}</Text>
                <Text style={s.orderId}>{order.id}</Text>
            </View>

            <View style={s.divider}/>

            <Text style={s.itemSummary} numberOfLines={2}>{itemSummary}</Text>

            <View style={s.divider}/>

            <View style={s.priceRow}>
                <View style={s.priceLeft}>
                    {order.deliveryFee === 0 ? (
                        <Text style={s.freeDelivery}>배달비 무료</Text>
                    ) : (
                        <Text style={s.deliveryFee}>배달비 {order.deliveryFee.toLocaleString()}원</Text>
                    )}
                    {order.earnedPoints > 0 && (
                        <Text style={s.earnedPoints}>+{order.earnedPoints.toLocaleString()}P 적립</Text>
                    )}
                </View>
                <View style={s.priceRight}>
                    <Text style={s.payMethod}>{order.payMethod}</Text>
                    <Text style={s.finalTotal}>{order.finalTotal.toLocaleString()}원</Text>
                </View>
            </View>
        </View>
    );
}

export function OrderHistoryScreen({navigation}: Props) {
    const orders = useOrderStore((s) => s.orders);

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>주문 내역</Text>
                <View style={{width: 32}}/>
            </View>

            {orders.length === 0 ? (
                <View style={s.empty}>
                    <Text style={s.emptyIcon}>🛒</Text>
                    <Text style={s.emptyTitle}>주문 내역이 없어요</Text>
                    <Text style={s.emptySub}>식재료를 주문하면 여기에 기록돼요</Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{padding: 16, gap: 12, paddingBottom: 40}}
                >
                    <Text style={s.totalCount}>총 {orders.length}건</Text>
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order}/>
                    ))}
                </ScrollView>
            )}
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

    totalCount: {fontSize: 11, color: colors.sub, marginBottom: 4},

    card: {
        backgroundColor: colors.surface2,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 10,
    },
    cardTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    storeRow: {flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1},
    storeEmoji: {fontSize: 15},
    storeName: {fontSize: 14, fontWeight: '700', color: colors.text},
    statusChip: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusDone: {backgroundColor: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.3)'},
    statusOngoing: {backgroundColor: 'rgba(184,255,78,0.08)', borderColor: 'rgba(184,255,78,0.3)'},
    statusText: {fontSize: 11, fontWeight: '500'},
    statusTextDone: {color: colors.teal},
    statusTextOngoing: {color: colors.accent},

    metaRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    metaText: {fontSize: 11, color: colors.sub},
    orderId: {fontSize: 10, color: colors.sub},

    divider: {height: 1, backgroundColor: colors.border},

    itemSummary: {fontSize: 12, color: colors.text, lineHeight: 18},

    priceRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'},
    priceLeft: {gap: 3},
    freeDelivery: {fontSize: 11, color: colors.teal},
    deliveryFee: {fontSize: 11, color: colors.sub},
    earnedPoints: {fontSize: 11, color: colors.accent},
    priceRight: {alignItems: 'flex-end', gap: 2},
    payMethod: {fontSize: 10, color: colors.sub},
    finalTotal: {fontSize: 16, fontWeight: '700', color: colors.text},

    empty: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
    emptyIcon: {fontSize: 48, marginBottom: 4},
    emptyTitle: {fontSize: 16, fontWeight: '700', color: colors.text},
    emptySub: {fontSize: 13, color: colors.sub},
});
