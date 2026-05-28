import React, {useState, useMemo} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MarketStackParamList} from '../../navigation/MarketStackNavigator';
import {STORES, PRODUCTS, CATEGORIES, CategoryKey, AI_RECOMMENDATION} from '../../data/marketData';
import {useCartStore} from '../../store/cartStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MarketStackParamList, 'MarketMain'>;

export function MarketScreen({navigation}: Props) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<CategoryKey>('all');
    const cartCount = useCartStore((s) => s.totalCount());
    const storeId = useCartStore((s) => s.storeId);
    const setStore = useCartStore((s) => s.setStore);
    const addItem = useCartStore((s) => s.addItem);
    const clearCart = useCartStore((s) => s.clearCart);

    const searchResults = useMemo(() => {
        if (!search.trim()) return [];
        const q = search.trim().toLowerCase();
        return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
    }, [search]);

    const aiProductIds = AI_RECOMMENDATION.productIds;
    const aiProducts = PRODUCTS.filter((p) => aiProductIds.includes(p.id));

    const handleAddAiBundle = () => {
        if (storeId && storeId !== AI_RECOMMENDATION.storeId) {
            Alert.alert(
                '장바구니 초기화',
                '다른 매장 상품이 담겨 있습니다.\n초기화 후 추가할까요?',
                [
                    {text: '취소', style: 'cancel'},
                    {
                        text: '초기화 후 추가',
                        onPress: () => {
                            clearCart();
                            setStore(AI_RECOMMENDATION.storeId);
                            aiProducts.forEach((p) => addItem(p));
                        },
                    },
                ],
            );
            return;
        }
        if (!storeId) setStore(AI_RECOMMENDATION.storeId);
        aiProducts.forEach((p) => addItem(p));
    };

    const handleStorePress = (sid: string) => {
        navigation.navigate('StoreDetail', {storeId: sid});
    };

    const isSearching = search.trim().length > 0;

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* 헤더 */}
            <View style={s.header}>
                <View>
                    <Text style={s.headerTitle}>식재료 구매</Text>
                    <Text style={s.headerSub}>📍 서울 마포구 · 배달 가능</Text>
                </View>
                <TouchableOpacity style={s.mapBtn}>
                    <Text style={s.mapIcon}>🗺️</Text>
                </TouchableOpacity>
            </View>

            {/* 검색바 */}
            <View style={s.searchBar}>
                <Text style={s.searchIcon}>🔍</Text>
                <TextInput
                    style={s.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="재료명으로 검색 (예: 닭가슴살)"
                    placeholderTextColor={colors.sub}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
            </View>

            {/* 장바구니 FAB */}
            {cartCount > 0 && (
                <TouchableOpacity
                    style={s.cartFab}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Text style={s.cartFabIcon}>🛒</Text>
                    <Text style={s.cartFabText}>장바구니 {cartCount}개</Text>
                    <View style={s.cartFabArrow}>
                        <Text style={s.cartFabArrowText}>›</Text>
                    </View>
                </TouchableOpacity>
            )}

            {isSearching ? (
                /* 검색 결과 */
                <FlatList
                    data={searchResults}
                    keyExtractor={(p) => p.id}
                    contentContainerStyle={{padding: 14, paddingBottom: 120}}
                    ListHeaderComponent={
                        <Text style={s.sectionLabel}>
                            검색 결과 {searchResults.length}개
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={s.emptySearch}>
                            <Text style={s.emptySearchText}>검색 결과가 없어요</Text>
                        </View>
                    }
                    renderItem={({item}) => {
                        const store = STORES.find((st) => st.id === item.storeId);
                        return (
                            <TouchableOpacity
                                style={s.searchResultCard}
                                onPress={() => navigation.navigate('StoreDetail', {storeId: item.storeId})}
                            >
                                <View style={s.productEmoji}>
                                    <Text style={{fontSize: 22}}>{item.emoji}</Text>
                                </View>
                                <View style={s.productInfo}>
                                    <Text style={s.productName}>{item.name}</Text>
                                    <Text style={s.productUnit}>{item.unit} · {store?.name}</Text>
                                </View>
                                <Text style={s.productPrice}>{item.price.toLocaleString()}원</Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 120}}
                >
                    {/* 카테고리 필터 */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.categoryRow}
                    >
                        {CATEGORIES.map((cat) => (
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

                    <View style={s.body}>
                        {/* AI 추천 카드 */}
                        <View style={s.aiCard}>
                            <Text style={s.aiTitle}>✨ 오늘 저녁 식단 재료 추천</Text>
                            <Text style={s.aiMeal}>{AI_RECOMMENDATION.meal}</Text>
                            <View style={s.aiItems}>
                                {aiProducts.map((p) => (
                                    <View key={p.id} style={s.aiItem}>
                                        <Text style={s.aiItemEmoji}>{p.emoji}</Text>
                                        <Text style={s.aiItemName}>{p.name} {p.unit}</Text>
                                    </View>
                                ))}
                            </View>
                            <TouchableOpacity style={s.aiBtn} onPress={handleAddAiBundle}>
                                <Text style={s.aiBtnText}>장바구니에 한번에 담기 →</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 매장 목록 */}
                        <Text style={s.sectionLabel}>주변 배달 가능 매장</Text>
                        {STORES.map((store) => (
                            <TouchableOpacity
                                key={store.id}
                                style={s.storeCard}
                                onPress={() => handleStorePress(store.id)}
                                activeOpacity={0.8}
                            >
                                <View style={s.storeIcon}>
                                    <Text style={{fontSize: 20}}>{store.emoji}</Text>
                                </View>
                                <View style={s.storeInfo}>
                                    <View style={s.storeNameRow}>
                                        <Text style={s.storeName}>{store.name}</Text>
                                        <Text style={s.storeRating}>⭐ {store.rating}</Text>
                                    </View>
                                    <Text style={s.storeMeta}>
                                        배달 {store.deliveryTime}분 · 배달비{' '}
                                        {store.deliveryFee === 0 ? '무료' : `${store.deliveryFee.toLocaleString()}원`}
                                        {' '}· {store.distance}
                                    </Text>
                                    {store.badges.length > 0 && (
                                        <View style={s.storeBadges}>
                                            {store.badges.map((b) => (
                                                <View key={b} style={s.storeBadge}>
                                                    <Text style={s.storeBadgeText}>{b}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                                <Text style={s.storeArrow}>›</Text>
                            </TouchableOpacity>
                        ))}

                        {/* 카테고리 필터된 상품 */}
                        {category !== 'all' && (
                            <>
                                <Text style={[s.sectionLabel, {marginTop: 16}]}>
                                    {CATEGORIES.find((c) => c.key === category)?.label} 상품
                                </Text>
                                {PRODUCTS.filter((p) => p.category === category)
                                    .reduce<{storeId: string; products: typeof PRODUCTS}[]>((acc, p) => {
                                        const found = acc.find((g) => g.storeId === p.storeId);
                                        if (found) {
                                            found.products.push(p);
                                        } else {
                                            acc.push({storeId: p.storeId, products: [p]});
                                        }
                                        return acc;
                                    }, [])
                                    .map(({storeId: sid, products}) => {
                                        const store = STORES.find((st) => st.id === sid)!;
                                        return (
                                            <View key={sid} style={s.categoryGroup}>
                                                <TouchableOpacity
                                                    style={s.categoryGroupHeader}
                                                    onPress={() => navigation.navigate('StoreDetail', {storeId: sid})}
                                                >
                                                    <Text style={s.categoryGroupName}>{store.name}</Text>
                                                    <Text style={s.categoryGroupMore}>전체 보기 ›</Text>
                                                </TouchableOpacity>
                                                {products.slice(0, 3).map((p) => (
                                                    <View key={p.id} style={s.miniProductRow}>
                                                        <Text style={{fontSize: 18, marginRight: 8}}>{p.emoji}</Text>
                                                        <Text style={s.miniProductName}>{p.name}</Text>
                                                        <Text style={s.miniProductUnit}>{p.unit}</Text>
                                                        <Text style={s.miniProductPrice}>{p.price.toLocaleString()}원</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        );
                                    })}
                            </>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 10,
    },
    headerTitle: {fontSize: 18, fontWeight: '700', color: colors.text},
    headerSub: {fontSize: 11, color: colors.sub, marginTop: 2},
    mapBtn: {padding: 4},
    mapIcon: {fontSize: 22},

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        gap: 8,
    },
    searchIcon: {fontSize: 14, opacity: 0.4},
    searchInput: {flex: 1, fontSize: 13, color: colors.text},

    cartFab: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: colors.accent,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
        gap: 8,
    },
    cartFabIcon: {fontSize: 16},
    cartFabText: {flex: 1, fontSize: 14, fontWeight: '700', color: colors.bg},
    cartFabArrow: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartFabArrowText: {fontSize: 16, color: colors.bg, fontWeight: '700'},

    categoryRow: {paddingHorizontal: 16, paddingBottom: 12, gap: 6},
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryChipOn: {
        backgroundColor: 'rgba(184,255,78,0.15)',
        borderColor: colors.accent,
    },
    categoryChipText: {fontSize: 12, fontWeight: '500', color: colors.sub},
    categoryChipTextOn: {color: colors.accent},

    body: {paddingHorizontal: 16},

    aiCard: {
        backgroundColor: 'rgba(78,201,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(78,201,255,0.2)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    aiTitle: {fontSize: 12, color: colors.accent3, fontWeight: '600', marginBottom: 2},
    aiMeal: {fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 10},
    aiItems: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12},
    aiItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.surface2,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: colors.border,
    },
    aiItemEmoji: {fontSize: 13},
    aiItemName: {fontSize: 11, color: colors.text},
    aiBtn: {alignSelf: 'flex-start'},
    aiBtnText: {fontSize: 12, color: colors.accent, fontWeight: '600'},

    sectionLabel: {
        fontSize: 10,
        color: colors.sub,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontWeight: '500',
        marginBottom: 10,
    },

    storeCard: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    storeIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    storeInfo: {flex: 1},
    storeNameRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3},
    storeName: {fontSize: 14, fontWeight: '600', color: colors.text},
    storeRating: {fontSize: 11, color: colors.amber},
    storeMeta: {fontSize: 11, color: colors.sub},
    storeBadges: {flexDirection: 'row', gap: 5, marginTop: 5},
    storeBadge: {
        backgroundColor: 'rgba(52,211,153,0.1)',
        borderRadius: 5,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    storeBadgeText: {fontSize: 10, color: colors.teal, fontWeight: '500'},
    storeArrow: {fontSize: 18, color: colors.sub},

    categoryGroup: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        overflow: 'hidden',
    },
    categoryGroupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    categoryGroupName: {fontSize: 13, fontWeight: '600', color: colors.text},
    categoryGroupMore: {fontSize: 11, color: colors.accent},
    miniProductRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    miniProductName: {flex: 1, fontSize: 13, color: colors.text},
    miniProductUnit: {fontSize: 11, color: colors.sub, marginRight: 8},
    miniProductPrice: {fontSize: 13, fontWeight: '600', color: colors.text},

    searchResultCard: {
        backgroundColor: colors.surface2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    productEmoji: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productInfo: {flex: 1},
    productName: {fontSize: 13, fontWeight: '500', color: colors.text},
    productUnit: {fontSize: 11, color: colors.sub, marginTop: 2},
    productPrice: {fontSize: 13, fontWeight: '700', color: colors.text},

    emptySearch: {paddingVertical: 40, alignItems: 'center'},
    emptySearchText: {fontSize: 13, color: colors.sub},
});
