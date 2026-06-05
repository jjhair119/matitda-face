import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    TextInput,
    Image,
    RefreshControl,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../theme';
import {
    UserSummary,
    FriendStats,
    fetchFollowing,
    fetchFollowers,
    fetchFriendsDiet,
    toggleFollow,
    searchUserByCode,
    UserSearchResult,
} from '../../api/friends';
import {useAuthStore} from '../../store/authStore';

const TABS = ['팔로잉', '팔로워', '식단비교'] as const;
type Tab = typeof TABS[number];

// ── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({profileImageUrl, nickname}: {profileImageUrl: string | null; nickname: string}) {
    if (profileImageUrl) {
        return <Image source={{uri: profileImageUrl}} style={s.avatar} />;
    }
    return (
        <View style={s.avatar}>
            <Text style={s.avatarText}>{nickname.charAt(0).toUpperCase()}</Text>
        </View>
    );
}

// ── Unfollow confirm modal ───────────────────────────────────────────────────

function UnfollowModal({
    nickname,
    visible,
    onConfirm,
    onCancel,
    loading,
}: {
    nickname: string;
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
            <Pressable style={s.modalOverlay} onPress={onCancel}>
                <Pressable style={s.modalBox} onPress={() => {}}>
                    <Text style={s.modalTitle}>팔로우 취소</Text>
                    <Text style={s.modalBody}>
                        <Text style={{color: colors.text, fontWeight: '600'}}>{nickname}</Text>
                        {' 님을 언팔로우할까요?'}
                    </Text>
                    <View style={s.modalBtns}>
                        <TouchableOpacity style={s.modalBtnCancel} onPress={onCancel} disabled={loading}>
                            <Text style={s.modalBtnCancelText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.modalBtnConfirm} onPress={onConfirm} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator size="small" color={colors.bg} />
                            ) : (
                                <Text style={s.modalBtnConfirmText}>언팔로우</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ── Add friend by ID modal ───────────────────────────────────────────────────

function AddFriendModal({
    visible,
    onClose,
    onFollowed,
}: {
    visible: boolean;
    onClose: () => void;
    onFollowed: () => void;
}) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [found, setFound] = useState<UserSearchResult | null>(null);
    const [result, setResult] = useState<'success' | 'error' | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleClose = () => {
        setCode('');
        setFound(null);
        setResult(null);
        setErrorMsg('');
        onClose();
    };

    const handleSearch = async () => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;
        setLoading(true);
        setFound(null);
        setResult(null);
        setErrorMsg('');
        try {
            const user = await searchUserByCode(trimmed);
            setFound(user);
        } catch (e: any) {
            setResult('error');
            const status = e?.response?.status;
            setErrorMsg(status === 404 ? '존재하지 않는 유저코드예요.' : '오류가 발생했어요. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!found) return;
        setLoading(true);
        setResult(null);
        setErrorMsg('');
        try {
            const res = await toggleFollow(found.id);
            if (res.following) {
                setResult('success');
                onFollowed();
            } else {
                setResult('error');
                setErrorMsg('이미 팔로우가 해제되었어요.');
            }
        } catch (e: any) {
            setResult('error');
            const status = e?.response?.status;
            if (status === 400) {
                setErrorMsg('자기 자신은 팔로우할 수 없어요.');
            } else {
                setErrorMsg('오류가 발생했어요. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={handleClose}>
            <Pressable style={s.modalOverlay} onPress={handleClose}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <Pressable style={s.addModalBox} onPress={() => {}}>
                        <View style={s.addModalHandle} />
                        <Text style={s.addModalTitle}>유저코드로 친구 추가</Text>
                        <Text style={s.addModalDesc}>상대방의 유저코드를 입력하세요 (예: ABCD1234)</Text>

                        <View style={s.addModalInputRow}>
                            <TextInput
                                style={s.addModalInput}
                                value={code}
                                onChangeText={(t) => {
                                    setCode(t.toUpperCase());
                                    setFound(null);
                                    setResult(null);
                                    setErrorMsg('');
                                }}
                                placeholder="유저코드 입력"
                                placeholderTextColor={colors.sub}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                returnKeyType="search"
                                onSubmitEditing={handleSearch}
                                editable={!loading}
                            />
                            {code.length > 0 && !loading && (
                                <TouchableOpacity onPress={() => {setCode(''); setFound(null); setResult(null);}} style={s.inputClear}>
                                    <Text style={{fontSize: 13, color: colors.sub}}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {found && result !== 'success' && (
                            <View style={s.foundUserRow}>
                                <View style={s.foundUserInfo}>
                                    <Text style={s.foundUserName}>{found.nickname}</Text>
                                    <Text style={s.foundUserCode}>{found.user_code}</Text>
                                </View>
                            </View>
                        )}
                        {result === 'success' && (
                            <Text style={s.addResultSuccess}>✓ 팔로우했어요!</Text>
                        )}
                        {result === 'error' && (
                            <Text style={s.addResultError}>{errorMsg}</Text>
                        )}

                        {!found || result === 'success' ? (
                            <TouchableOpacity
                                style={[s.addModalBtn, (!code.trim() || loading) && s.addModalBtnDisabled]}
                                onPress={handleSearch}
                                disabled={!code.trim() || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={colors.bg} />
                                ) : (
                                    <Text style={s.addModalBtnText}>검색</Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[s.addModalBtn, loading && s.addModalBtnDisabled]}
                                onPress={handleFollow}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={colors.bg} />
                                ) : (
                                    <Text style={s.addModalBtnText}>팔로우</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
}

// ── Follow button (with unfollow confirm) ────────────────────────────────────

function FollowButton({user, onUnfollowed}: {user: UserSummary; onUnfollowed?: () => void}) {
    const [following, setFollowing] = useState(user.is_following);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handlePress = () => {
        if (following) {
            setShowConfirm(true);
        } else {
            doToggle();
        }
    };

    const doToggle = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await toggleFollow(user.id);
            setFollowing(res.following);
            if (!res.following) onUnfollowed?.();
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmUnfollow = async () => {
        setShowConfirm(false);
        await doToggle();
    };

    return (
        <>
            <TouchableOpacity
                style={[s.followBtn, following && s.followingBtn]}
                onPress={handlePress}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                    <Text style={[s.followBtnText, following && s.followingBtnText]}>
                        {following ? '팔로잉' : '팔로우'}
                    </Text>
                )}
            </TouchableOpacity>

            <UnfollowModal
                nickname={user.nickname}
                visible={showConfirm}
                onConfirm={handleConfirmUnfollow}
                onCancel={() => setShowConfirm(false)}
                loading={loading}
            />
        </>
    );
}

// ── Cards ────────────────────────────────────────────────────────────────────

function UserCard({user, onUnfollowed}: {user: UserSummary; onUnfollowed?: () => void}) {
    return (
        <View style={s.card}>
            <Avatar profileImageUrl={user.profile_image_url} nickname={user.nickname} />
            <View style={s.cardInfo}>
                <Text style={s.cardName}>{user.nickname}</Text>
            </View>
            <FollowButton user={user} onUnfollowed={onUnfollowed} />
        </View>
    );
}

function DietCard({friend, isMe}: {friend: FriendStats; isMe?: boolean}) {
    const rate = friend.achievement_rate;
    const barWidth = rate !== null ? Math.min(rate, 100) : 0;

    return (
        <View style={[s.card, isMe && s.cardMe]}>
            <Avatar profileImageUrl={friend.profile_image_url} nickname={friend.nickname} />
            <View style={s.cardInfo}>
                <View style={s.dietNameRow}>
                    <Text style={s.cardName}>{friend.nickname}</Text>
                    {isMe && <View style={s.meBadge}><Text style={s.meBadgeText}>나</Text></View>}
                </View>
                <Text style={s.cardSub}>
                    {friend.today_calories > 0
                        ? `${friend.today_calories.toLocaleString()} kcal`
                        : '오늘 식단 없음'}
                    {friend.tdee_kcal ? ` / ${friend.tdee_kcal.toLocaleString()} kcal` : ''}
                </Text>
                <View style={s.barTrack}>
                    <View style={[s.barFill, {width: `${barWidth}%` as any}]} />
                </View>
            </View>
            <View style={s.rateBox}>
                {rate !== null ? (
                    <>
                        <Text style={[s.rateNum, rate >= 90 && {color: colors.accent}]}>{rate}</Text>
                        <Text style={s.rateLabel}>%</Text>
                    </>
                ) : (
                    <Text style={s.rateLabel}>-</Text>
                )}
            </View>
        </View>
    );
}

// ── Sparkle cheer (for diet tab) ─────────────────────────────────────────────

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
            sp.x.setValue(0); sp.y.setValue(0); sp.opacity.setValue(1);
            Animated.parallel([
                Animated.timing(sp.x, {toValue: Math.cos(angle) * 22, duration: 400, useNativeDriver: true}),
                Animated.timing(sp.y, {toValue: Math.sin(angle) * 22, duration: 400, useNativeDriver: true}),
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

// ── Main screen ───────────────────────────────────────────────────────────────

export function FriendsScreen() {
    const user = useAuthStore((st) => st.user);
    const [activeTab, setActiveTab] = useState<Tab>('팔로잉');
    const [following, setFollowing] = useState<UserSummary[]>([]);
    const [followers, setFollowers] = useState<UserSummary[]>([]);
    const [dietMe, setDietMe] = useState<FriendStats | null>(null);
    const [dietFriends, setDietFriends] = useState<FriendStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [addModalOpen, setAddModalOpen] = useState(false);

    const load = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [f1, f2, diet] = await Promise.all([
                fetchFollowing(user.id),
                fetchFollowers(user.id),
                fetchFriendsDiet(),
            ]);
            setFollowing(f1);
            setFollowers(f2);
            setDietMe(diet.me);
            setDietFriends(diet.friends);
        } catch {
            // keep previous data
        }
    }, [user?.id]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await load();
            setLoading(false);
        })();
    }, [load]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const toggleSearch = () => {
        if (searchOpen) setSearchQuery('');
        setSearchOpen((v) => !v);
    };

    const filterByQuery = <T extends {nickname: string}>(list: T[]) =>
        searchQuery
            ? list.filter((f) => f.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
            : list;

    const counts = {팔로잉: following.length, 팔로워: followers.length, 식단비교: dietFriends.length};

    const renderList = () => {
        if (activeTab === '식단비교') {
            const items = filterByQuery(dietFriends);
            return (
                <ScrollView
                    style={s.scroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                >
                    {dietMe && <DietCard friend={dietMe} isMe />}
                    {items.length === 0 ? (
                        <View style={s.emptyBox}>
                            <Text style={s.emptyText}>
                                {searchQuery ? `"${searchQuery}" 검색 결과가 없어요` : '팔로잉 친구가 없어요'}
                            </Text>
                        </View>
                    ) : (
                        items.map((f) => (
                            <View key={f.id} style={s.dietRow}>
                                <DietCard friend={f} />
                                {/* <View style={s.cheerWrap}><CheerButton /></View> */}
                            </View>
                        ))
                    )}
                </ScrollView>
            );
        }

        const baseList = activeTab === '팔로잉' ? following : followers;
        const list = filterByQuery(baseList);

        return (
            <ScrollView
                style={s.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
            >
                {list.length === 0 ? (
                    <View style={s.emptyBox}>
                        <Text style={s.emptyText}>
                            {searchQuery ? `"${searchQuery}" 검색 결과가 없어요` : '아직 없어요'}
                        </Text>
                    </View>
                ) : (
                    list.map((f) => (
                        <UserCard
                            key={f.id}
                            user={f}
                            onUnfollowed={load}
                        />
                    ))
                )}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <Text style={s.title}>친구</Text>
                <View style={s.headerRight}>
                    <TouchableOpacity onPress={() => setAddModalOpen(true)} style={s.headerBtn}>
                        <Text style={s.headerBtnText}>+ 친구 추가</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleSearch} style={{paddingLeft: 8}}>
                        <Text style={{fontSize: 18}}>{searchOpen ? '✕' : '🔍'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {searchOpen && (
                <View style={s.searchBar}>
                    <TextInput
                        style={s.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="친구 닉네임 검색"
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
                        {activeTab === tab && <View style={s.tabUnderline} />}
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={s.loadingBox}>
                    <ActivityIndicator color={colors.accent} />
                </View>
            ) : (
                renderList()
            )}

            <AddFriendModal
                visible={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onFollowed={load}
            />
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},

    // Header
    header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56},
    title: {fontSize: 16, fontWeight: '700', color: colors.text},
    headerRight: {flexDirection: 'row', alignItems: 'center'},
    headerBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: 'rgba(184,255,78,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.3)',
    },
    headerBtnText: {fontSize: 12, color: colors.accent, fontWeight: '600'},

    // Tabs
    tabs: {flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 4},
    tabItem: {paddingHorizontal: 14, paddingVertical: 8, position: 'relative'},
    tabText: {fontSize: 12, color: colors.sub, fontWeight: '500'},
    tabTextActive: {color: colors.accent, fontWeight: '600'},
    tabUnderline: {position: 'absolute', bottom: 0, left: 14, right: 14, height: 2, backgroundColor: colors.accent, borderRadius: 1},

    // Search
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

    // List
    scroll: {flex: 1, paddingHorizontal: 14, paddingTop: 8},
    loadingBox: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    emptyBox: {alignItems: 'center', justifyContent: 'center', paddingTop: 60},
    emptyText: {fontSize: 13, color: colors.sub},

    // Card
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
    cardMe: {borderColor: 'rgba(184,255,78,0.3)', backgroundColor: 'rgba(184,255,78,0.04)'},
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
        overflow: 'hidden',
    },
    avatarText: {fontSize: 15, fontWeight: '600', color: colors.text},
    cardInfo: {flex: 1},
    cardName: {fontSize: 13, fontWeight: '500', color: colors.text},
    cardSub: {fontSize: 11, color: colors.sub, marginTop: 2},

    // Diet bar
    dietNameRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
    meBadge: {backgroundColor: 'rgba(184,255,78,0.15)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1},
    meBadgeText: {fontSize: 9, color: colors.accent, fontWeight: '600'},
    barTrack: {marginTop: 5, height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden'},
    barFill: {height: 3, backgroundColor: colors.accent, borderRadius: 2},
    rateBox: {alignItems: 'center', width: 36},
    rateNum: {fontSize: 15, fontWeight: '700', color: colors.text},
    rateLabel: {fontSize: 9, color: colors.sub},
    dietRow: {position: 'relative'},
    cheerWrap: {position: 'absolute', right: 10, top: '50%', marginTop: -14},

    // Follow button
    followBtn: {
        width: 58,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(184,255,78,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    followBtnText: {fontSize: 11, color: colors.accent},
    followingBtn: {backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border},
    followingBtnText: {color: colors.sub},

    // Cheer
    cheerBtn: {width: 52, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center'},
    cheerBtnDone: {backgroundColor: 'rgba(184,255,78,0.08)', borderColor: 'rgba(184,255,78,0.25)'},

    // Unfollow modal
    modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center'},
    modalBox: {
        width: 280,
        backgroundColor: colors.surface2,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modalTitle: {fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8},
    modalBody: {fontSize: 13, color: colors.sub, lineHeight: 20, marginBottom: 20},
    modalBtns: {flexDirection: 'row', gap: 8},
    modalBtnCancel: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnCancelText: {fontSize: 13, color: colors.sub},
    modalBtnConfirm: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#ff4d4d',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnConfirmText: {fontSize: 13, fontWeight: '600', color: '#fff'},

    // Add friend modal
    addModalBox: {
        width: 320,
        backgroundColor: colors.surface2,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    addModalHandle: {width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, marginBottom: 20},
    addModalTitle: {fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6},
    addModalDesc: {fontSize: 12, color: colors.sub, marginBottom: 20},
    addModalInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 12,
    },
    addModalInput: {flex: 1, fontSize: 13, color: colors.text},
    inputClear: {padding: 4},
    addResultSuccess: {fontSize: 12, color: colors.accent, marginBottom: 12},
    addResultError: {fontSize: 12, color: '#ff6b6b', marginBottom: 12},
    foundUserRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, borderRadius: 10,
        padding: 12, marginBottom: 12,
        borderWidth: 1, borderColor: colors.border,
    },
    foundUserInfo: {flex: 1},
    foundUserName: {fontSize: 14, fontWeight: '600', color: colors.text},
    foundUserCode: {fontSize: 11, color: colors.sub, marginTop: 2},
    addModalBtn: {
        width: '100%',
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    addModalBtnDisabled: {opacity: 0.4},
    addModalBtnText: {fontSize: 14, fontWeight: '700', color: colors.bg},
});
