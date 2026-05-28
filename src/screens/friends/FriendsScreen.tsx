import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated, TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../theme';
import {Friend, fetchFollowing, fetchFollowers, fetchSuggestedFriends} from '../../api/friends';

const TABS = ['팔로잉', '팔로워', '추천'] as const;
type Tab = typeof TABS[number];

function Avatar({emoji}: {emoji: string}) {
    return (
        <View style={s.avatar}>
            <Text style={{fontSize: 16}}>{emoji}</Text>
        </View>
    );
}

const SPARKLE_COUNT = 6;
const SPARKLE_COLORS = [colors.accent, colors.accent2, colors.accent3, colors.amber, colors.teal];
const SPARKLE_SIZES = [5, 4, 6, 4, 5, 4];

function CheerButton() {
    const [cheered, setCheered] = useState(false);
    const scale = useRef(new Animated.Value(1)).current;
    const sparkles = useRef(
        Array.from({length: SPARKLE_COUNT}, () => ({
            x: new Animated.Value(0),
            y: new Animated.Value(0),
            opacity: new Animated.Value(0),
        }))
    ).current;

    const handlePress = () => {
        if (cheered) return;
        setCheered(true);

        Animated.sequence([
            Animated.timing(scale, {toValue: 1.4, duration: 100, useNativeDriver: true}),
            Animated.timing(scale, {toValue: 1, duration: 100, useNativeDriver: true}),
        ]).start();

        sparkles.forEach((sp, i) => {
            const angle = (i / SPARKLE_COUNT) * Math.PI * 2;
            const dist = 22;
            sp.x.setValue(0);
            sp.y.setValue(0);
            sp.opacity.setValue(1);
            Animated.parallel([
                Animated.timing(sp.x, {toValue: Math.cos(angle) * dist, duration: 400, useNativeDriver: true}),
                Animated.timing(sp.y, {toValue: Math.sin(angle) * dist, duration: 400, useNativeDriver: true}),
                Animated.timing(sp.opacity, {toValue: 0, duration: 400, useNativeDriver: true}),
            ]).start();
        });
    };

    return (
        <View style={{width: 52, height: 28, alignItems: 'center', justifyContent: 'center'}}>
            {sparkles.map((sp, i) => (
                <Animated.View
                    key={i}
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        width: SPARKLE_SIZES[i],
                        height: SPARKLE_SIZES[i],
                        borderRadius: 99,
                        backgroundColor: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
                        opacity: sp.opacity,
                        transform: [{translateX: sp.x}, {translateY: sp.y}],
                    }}
                />
            ))}
            <TouchableOpacity
                onPress={handlePress}
                disabled={cheered}
                activeOpacity={0.7}
                style={[s.cheerBtn, cheered && s.cheerBtnDone]}
            >
                <Animated.View style={{transform: [{scale}]}}>
                    <Text style={{fontSize: 11}}>👏</Text>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

function FriendCard({friend, showFollow}: {friend: Friend; showFollow?: boolean}) {
    const [following, setFollowing] = useState(friend.isFollowing);
    const achieveRate = friend.todayKcal !== null
        ? Math.round((friend.todayKcal / friend.goalKcal) * 100)
        : null;

    return (
        <View style={s.card}>
            <Avatar emoji={friend.emoji}/>
            <View style={s.cardInfo}>
                <Text style={s.cardName}>
                    {friend.badge ? `${friend.badge} ` : ''}{friend.name}
                </Text>
                <Text style={s.cardSub}>
                    {friend.todayKcal !== null
                        ? `오늘 ${friend.todayKcal.toLocaleString()}kcal · ${achieveRate}%`
                        : '오늘 식단 미완료'}
                </Text>
            </View>
            <View style={s.scoreBox}>
                {friend.score !== null && (
                    <>
                        <Text style={s.scoreNum}>{friend.score}</Text>
                        <Text style={s.scoreLabel}>점</Text>
                    </>
                )}
            </View>
            {showFollow ? (
                <TouchableOpacity
                    style={[s.followBtn, following && s.followingBtn]}
                    onPress={() => setFollowing(!following)}
                >
                    <Text style={[s.followBtnText, following && s.followingBtnText]}>
                        {following ? '팔로잉' : '팔로우'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <CheerButton/>
            )}
        </View>
    );
}

export function FriendsScreen() {
    const [activeTab, setActiveTab] = useState<Tab>('팔로잉');
    const [following, setFollowing] = useState<Friend[]>([]);
    const [followers, setFollowers] = useState<Friend[]>([]);
    const [suggested, setSuggested] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [f1, f2, f3] = await Promise.all([fetchFollowing(), fetchFollowers(), fetchSuggestedFriends()]);
            setFollowing(f1);
            setFollowers(f2);
            setSuggested(f3);
            setLoading(false);
        })();
    }, []);

    const baseList = activeTab === '팔로잉' ? following : activeTab === '팔로워' ? followers : suggested;
    const list = searchQuery
        ? baseList.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : baseList;
    const counts = {팔로잉: following.length, 팔로워: followers.length, 추천: suggested.length};

    const toggleSearch = () => {
        if (searchOpen) {
            setSearchQuery('');
        }
        setSearchOpen((v) => !v);
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <Text style={s.title}>친구</Text>
                <TouchableOpacity onPress={toggleSearch}>
                    <Text style={{fontSize: 18}}>{searchOpen ? '✕' : '🔍'}</Text>
                </TouchableOpacity>
            </View>

            {searchOpen && (
                <View style={s.searchBar}>
                    <TextInput
                        style={s.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="친구 이름 검색"
                        placeholderTextColor={colors.sub}
                        autoFocus
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={s.searchClear}>
                            <Text style={{fontSize: 14, color: colors.sub}}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View style={s.tabs}>
                {TABS.map((tab) => (
                    <TouchableOpacity key={tab} style={s.tabItem} onPress={() => setActiveTab(tab)}>
                        <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                            {tab} {loading ? '' : counts[tab]}
                        </Text>
                        {activeTab === tab && <View style={s.tabUnderline}/>}
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={s.loadingBox}>
                    <ActivityIndicator color={colors.accent}/>
                </View>
            ) : list.length === 0 ? (
                <View style={s.loadingBox}>
                    <Text style={{fontSize: 13, color: colors.sub}}>
                        {searchQuery ? `"${searchQuery}" 검색 결과가 없어요` : '친구가 없어요'}
                    </Text>
                </View>
            ) : (
                <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                    {list.map((f) => (
                        <FriendCard
                            key={f.id}
                            friend={f}
                            showFollow={!f.isFollowing}
                        />
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56},
    title: {fontSize: 16, fontWeight: '700', color: colors.text},
    tabs: {flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 4},
    tabItem: {paddingHorizontal: 14, paddingVertical: 8, position: 'relative'},
    tabText: {fontSize: 12, color: colors.sub, fontWeight: '500'},
    tabTextActive: {color: colors.accent, fontWeight: '600'},
    tabUnderline: {position: 'absolute', bottom: 0, left: 14, right: 14, height: 2, backgroundColor: colors.accent, borderRadius: 1},
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 14,
        marginBottom: 6,
        backgroundColor: colors.surface2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        height: 40,
    },
    searchInput: {flex: 1, fontSize: 13, color: colors.text},
    searchClear: {padding: 4},
    scroll: {flex: 1, paddingHorizontal: 14, paddingTop: 8},
    loadingBox: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border2,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    cardInfo: {flex: 1},
    cardName: {fontSize: 13, fontWeight: '500', color: colors.text},
    cardSub: {fontSize: 11, color: colors.sub, marginTop: 2},
    scoreBox: {alignItems: 'center', width: 36},
    scoreNum: {fontSize: 15, fontWeight: '700', color: colors.accent},
    scoreLabel: {fontSize: 9, color: colors.sub},
    cheerBtn: {width: 52, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'},
    cheerBtnDone: {backgroundColor: 'rgba(184,255,78,0.08)', borderColor: 'rgba(184,255,78,0.25)'},
    followBtn: {width: 52, height: 28, borderRadius: 8, backgroundColor: 'rgba(184,255,78,0.1)', borderWidth: 1, borderColor: 'rgba(184,255,78,0.3)', alignItems: 'center', justifyContent: 'center'},
    followBtnText: {fontSize: 11, color: colors.accent},
    followingBtn: {backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border},
    followingBtnText: {color: colors.sub},
});
