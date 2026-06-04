import React, {useState, useMemo, useEffect, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    Modal,
    ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import * as Location from 'expo-location';
import {MarketStackParamList} from '../../navigation/MarketStackNavigator';
import {STORES, PRODUCTS, CATEGORIES, CategoryKey} from '../../data/marketData';
import {useCartStore} from '../../store/cartStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MarketStackParamList, 'MarketMain'>;

export function MarketScreen({navigation}: Props) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<CategoryKey>('all');
    const [mapVisible, setMapVisible] = useState(false);
    const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
    const [locationLabel, setLocationLabel] = useState<string>('위치 확인 중...');
    const cartCount = useCartStore((s) => s.totalCount());

    useEffect(() => {
        (async () => {
            const {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationLabel('위치 권한 없음');
                return;
            }
            try {
                const pos = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Balanced});
                const coords = {latitude: pos.coords.latitude, longitude: pos.coords.longitude};
                setLocation(coords);
                const [geo] = await Location.reverseGeocodeAsync(coords);
                if (geo) {
                    const parts = [geo.city ?? geo.region, geo.district ?? geo.subregion].filter(Boolean);
                    setLocationLabel(parts.join(' ') || '현재 위치');
                }
            } catch {
                setLocationLabel('위치 불러오기 실패');
            }
        })();
    }, []);

    const searchResults = useMemo(() => {
        if (!search.trim()) return [];
        const q = search.trim().toLowerCase();
        return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
    }, [search]);

    const handleStorePress = (sid: string) => {
        navigation.navigate('StoreDetail', {storeId: sid});
    };

    const isSearching = search.trim().length > 0;

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* 지도 모달 */}
            <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
                <View style={s.mapModal}>
                    <View style={s.mapModalHeader}>
                        <Text style={s.mapModalTitle}>내 위치</Text>
                        <TouchableOpacity onPress={() => setMapVisible(false)} style={s.mapCloseBtn}>
                            <Text style={s.mapCloseText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                    {location ? (
                        <MapView
                            style={s.map}
                            provider={PROVIDER_DEFAULT}
                            initialRegion={{
                                ...location,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                        >
                            <Marker coordinate={location} title="현재 위치" />
                        </MapView>
                    ) : (
                        <View style={s.mapLoading}>
                            <ActivityIndicator color={colors.accent} />
                            <Text style={s.mapLoadingText}>위치를 불러오는 중...</Text>
                        </View>
                    )}
                </View>
            </Modal>

            {/* 헤더 */}
            <View style={s.header}>
                <View>
                    <Text style={s.headerTitle}>식재료 구매</Text>
                    <Text style={s.headerSub}>📍 {locationLabel} · 배달 가능</Text>
                </View>
                <TouchableOpacity style={s.mapBtn} onPress={() => setMapVisible(true)}>
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
                        style={s.categoryScroll}
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
        height: 56,
    },
    headerTitle: {fontSize: 16, fontWeight: '700', color: colors.text},
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

    categoryScroll: {height: 52, flexGrow: 0},
    categoryRow: {paddingHorizontal: 16, gap: 6, alignItems: 'center'},
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

    mapModal: {flex: 1, backgroundColor: colors.bg},
    mapModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    mapModalTitle: {fontSize: 16, fontWeight: '700', color: colors.text},
    mapCloseBtn: {padding: 4},
    mapCloseText: {fontSize: 14, color: colors.accent},
    map: {flex: 1},
    mapLoading: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12},
    mapLoadingText: {fontSize: 13, color: colors.sub},

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
