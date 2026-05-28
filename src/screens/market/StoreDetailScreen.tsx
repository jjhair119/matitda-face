import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MarketStackParamList} from '../../navigation/MarketStackNavigator';
import {STORES, PRODUCTS, CATEGORIES, CategoryKey, Product} from '../../data/marketData';
import {useCartStore} from '../../store/cartStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MarketStackParamList, 'StoreDetail'>;

function ProductCard({
    product,
    quantity,
    onAdd,
    onRemove,
}: {
    product: Product;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}) {
    return (
        <View style={pc.card}>
            <View style={pc.emojiWrap}>
                <Text style={pc.emoji}>{product.emoji}</Text>
            </View>
            <View style={pc.info}>
                <Text style={pc.name}>{product.name}</Text>
                <Text style={pc.unit}>{product.unit}</Text>
                {product.badge && (
                    <View style={pc.badge}>
                        <Text style={pc.badgeText}>{product.badge}</Text>
                    </View>
                )}
            </View>
            <View style={pc.right}>
                <Text style={pc.price}>{product.price.toLocaleString()}원</Text>
                {quantity === 0 ? (
                    <TouchableOpacity style={pc.addBtn} onPress={onAdd}>
                        <Text style={pc.addBtnText}>+</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={pc.qtyRow}>
                        <TouchableOpacity style={pc.qtyBtn} onPress={onRemove}>
                            <Text style={pc.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={pc.qty}>{quantity}</Text>
                        <TouchableOpacity style={[pc.qtyBtn, pc.qtyBtnFill]} onPress={onAdd}>
                            <Text style={[pc.qtyBtnText, {color: colors.bg}]}>+</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

export function StoreDetailScreen({navigation, route}: Props) {
    const {storeId} = route.params;
    const store = STORES.find((s) => s.id === storeId)!;
    const products = PRODUCTS.filter((p) => p.storeId === storeId);

    const [category, setCategory] = useState<CategoryKey>('all');

    const cartStoreId = useCartStore((s) => s.storeId);
    const cartItems = useCartStore((s) => s.items);
    const totalCount = useCartStore((s) => s.totalCount());
    const subtotal = useCartStore((s) => s.subtotal());
    const setStore = useCartStore((s) => s.setStore);
    const addItem = useCartStore((s) => s.addItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const clearCart = useCartStore((s) => s.clearCart);

    const availableCategories = CATEGORIES.filter(
        (c) => c.key === 'all' || products.some((p) => p.category === c.key),
    );

    const filtered =
        category === 'all' ? products : products.filter((p) => p.category === category);

    const getQuantity = (productId: string) =>
        cartItems.find((i) => i.product.id === productId)?.quantity ?? 0;

    const handleAdd = (product: Product) => {
        if (cartStoreId && cartStoreId !== storeId) {
            Alert.alert(
                '장바구니 초기화',
                `다른 매장(${STORES.find((s) => s.id === cartStoreId)?.name}) 상품이 담겨 있습니다.\n초기화 후 추가할까요?`,
                [
                    {text: '취소', style: 'cancel'},
                    {
                        text: '초기화 후 추가',
                        onPress: () => {
                            clearCart();
                            setStore(storeId);
                            addItem(product);
                        },
                    },
                ],
            );
            return;
        }
        if (!cartStoreId) setStore(storeId);
        addItem(product);
    };

    const handleRemove = (productId: string) => {
        updateQuantity(productId, -1);
    };

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>←</Text>
                </TouchableOpacity>
                <View style={s.headerCenter}>
                    <Text style={s.headerTitle}>{store.name}</Text>
                    <Text style={s.headerSub}>
                        배달 {store.deliveryTime}분 · 배달비{' '}
                        {store.deliveryFee === 0 ? '무료' : `${store.deliveryFee.toLocaleString()}원`}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={s.cartBtn}>
                    <Text style={s.cartIcon}>🛒</Text>
                    {totalCount > 0 && (
                        <View style={s.cartBadge}>
                            <Text style={s.cartBadgeText}>{totalCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* 매장 정보 배너 */}
            <View style={s.infoBanner}>
                <Text style={s.infoItem}>⭐ {store.rating}</Text>
                <Text style={s.infoDivider}>·</Text>
                <Text style={s.infoItem}>최소 주문 {store.minOrder.toLocaleString()}원</Text>
                {store.badges.map((b) => (
                    <React.Fragment key={b}>
                        <Text style={s.infoDivider}>·</Text>
                        <Text style={s.infoBadge}>{b}</Text>
                    </React.Fragment>
                ))}
            </View>

            {/* 카테고리 탭 */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.categoryRow}
            >
                {availableCategories.map((cat) => (
                    <TouchableOpacity
                        key={cat.key}
                        style={[s.categoryChip, category === cat.key && s.categoryChipOn]}
                        onPress={() => setCategory(cat.key)}
                    >
                        <Text style={[s.categoryChipText, category === cat.key && s.categoryChipTextOn]}>
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 상품 목록 */}
            <ScrollView
                style={s.productList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: totalCount > 0 ? 120 : 40}}
            >
                <Text style={s.productCount}>{filtered.length}개 상품</Text>
                {filtered.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        quantity={getQuantity(product.id)}
                        onAdd={() => handleAdd(product)}
                        onRemove={() => handleRemove(product.id)}
                    />
                ))}
            </ScrollView>

            {/* 하단 장바구니 바 */}
            {totalCount > 0 && (
                <View style={s.bottomBar}>
                    <View style={s.bottomBarInfo}>
                        <Text style={s.bottomBarCount}>{totalCount}개</Text>
                        <Text style={s.bottomBarTotal}>{subtotal.toLocaleString()}원</Text>
                    </View>
                    <TouchableOpacity
                        style={s.bottomBarBtn}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <Text style={s.bottomBarBtnText}>장바구니 보기 →</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const pc = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
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
    unit: {fontSize: 11, color: colors.sub},
    badge: {
        marginTop: 4,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(52,211,153,0.1)',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    badgeText: {fontSize: 10, color: colors.teal, fontWeight: '500'},
    right: {alignItems: 'flex-end', gap: 6},
    price: {fontSize: 14, fontWeight: '700', color: colors.text},
    addBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {fontSize: 20, color: colors.bg, fontWeight: '700', lineHeight: 24},
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
});

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {padding: 4, marginRight: 8},
    backText: {fontSize: 20, color: colors.text},
    headerCenter: {flex: 1},
    headerTitle: {fontSize: 15, fontWeight: '700', color: colors.text},
    headerSub: {fontSize: 11, color: colors.sub, marginTop: 1},
    cartBtn: {padding: 4, position: 'relative'},
    cartIcon: {fontSize: 22},
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: colors.accent2,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    cartBadgeText: {fontSize: 9, fontWeight: '700', color: '#fff'},

    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.surface2,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoItem: {fontSize: 11, color: colors.sub},
    infoDivider: {fontSize: 11, color: colors.border2},
    infoBadge: {fontSize: 11, color: colors.teal, fontWeight: '500'},

    categoryRow: {paddingHorizontal: 16, paddingVertical: 10, gap: 6},
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryChipOn: {backgroundColor: 'rgba(184,255,78,0.15)', borderColor: colors.accent},
    categoryChipText: {fontSize: 12, fontWeight: '500', color: colors.sub},
    categoryChipTextOn: {color: colors.accent},

    productList: {flex: 1, paddingHorizontal: 16},
    productCount: {fontSize: 11, color: colors.sub, marginVertical: 8},

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 28,
        gap: 12,
    },
    bottomBarInfo: {flex: 1},
    bottomBarCount: {fontSize: 11, color: colors.sub},
    bottomBarTotal: {fontSize: 16, fontWeight: '700', color: colors.text},
    bottomBarBtn: {
        backgroundColor: colors.accent,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    bottomBarBtnText: {fontSize: 14, fontWeight: '700', color: colors.bg},
});
