import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  BackHandler,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Post as ApiPost, fetchPosts, fetchPostById, createPost, toggleLike, toggleBookmark, deletePost} from '../../api/posts';
import {useAuthStore} from '../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── 색상 팔레트 ──────────────────────────────────────────────────────────────
const C = {
  bg: '#0f1117',
  surface: '#181c26',
  surface2: '#1f2436',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.13)',
  text: '#eef0f6',
  sub: '#7a8099',
  accent: '#b8ff4e',
  accent2: '#ff6b4a',
  accent3: '#4ec9ff',
  amber: '#fbbf24',
  teal: '#34d399',
};

// ─── 타입 ─────────────────────────────────────────────────────────────────────
type Screen = 'feed' | 'hashtagSearch' | 'writePost' | 'postDetail';
type Post = ApiPost;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. 커뮤니티 피드 화면
// ═══════════════════════════════════════════════════════════════════════════════
function FeedScreen({
  onHashtagPress,
  onWritePress,
  onPostPress,
}: {
  onHashtagPress: (tag: string) => void;
  onWritePress: () => void;
  onPostPress: (post: Post) => void;
}) {
  const [activeTab, setActiveTab] = useState<'추천' | '팔로잉' | '최신'>('추천');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadPosts = useCallback(async (cursor?: string) => {
    setError(false);
    try {
      const result = await fetchPosts({limit: 20, cursor});
      setPosts(prev => cursor ? [...prev, ...result.posts] : result.posts);
      setNextCursor(result.next_cursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <View style={s.flex1}>
      <View style={s.feedHeader}>
        <Text style={s.feedTitle}>커뮤니티</Text>
        <TouchableOpacity onPress={onWritePress} hitSlop={8}>
          <Text style={s.headerIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.flex1}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={s.searchBar}
          onPress={() => onHashtagPress('')}
          activeOpacity={0.7}
        >
          <Text style={s.searchIcon}>🔍</Text>
          <Text style={s.searchPlaceholder}>#재료명으로 레시피 검색 (예: #닭가슴살)</Text>
        </TouchableOpacity>

        {/* 팔로잉/최신 탭은 API 미구현으로 비활성화 */}
        {/* <View style={s.tabBar}>
          {(['추천', '팔로잉', '최신'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[s.tab, activeTab === tab && s.tabActive]}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View> */}

        {loading ? (
          <ActivityIndicator color={C.accent} style={{marginTop: 40}}/>
        ) : error ? (
          <View style={{alignItems: 'center', marginTop: 40, gap: 12}}>
            <Text style={{color: C.sub}}>게시글을 불러오지 못했어요</Text>
            <TouchableOpacity onPress={() => loadPosts()} style={{paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: C.accent}}>
              <Text style={{color: C.accent, fontSize: 13}}>재시도</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <Text style={{color: C.sub, textAlign: 'center', marginTop: 40}}>게시글이 없어요</Text>
        ) : (
          posts.map(post => (
            <TouchableOpacity
              key={post.id}
              style={s.postCard}
              onPress={() => onPostPress(post)}
              activeOpacity={0.8}
            >
              <View style={s.postThumb}>
                <Text style={s.postThumbEmoji}>🍽️</Text>
              </View>
              <View style={s.postContent}>
                <View style={s.postMeta}>
                  <View style={s.authorAvatar}>
                    <Text style={s.authorInitial}>{post.nickname?.[0] ?? '?'}</Text>
                  </View>
                  <Text style={s.authorName}>{post.nickname}</Text>
                  <Text style={s.timeAgo}>{timeAgo(post.created_at)}</Text>
                </View>
                <Text style={s.postTitle} numberOfLines={2}>{post.content}</Text>
                <View style={s.tagRow}>
                  {(post.tags ?? []).map(tag => (
                    <TouchableOpacity key={tag} onPress={() => onHashtagPress(tag)} hitSlop={4}>
                      <Text style={s.hashTag}>#{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={s.postStats}>
                  <Text style={s.statText}>❤️ {post.like_count}</Text>
                  <Text style={s.statText}>{post.is_bookmarked ? '🔖' : '💾'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {nextCursor && (
          <TouchableOpacity style={s.loadMoreBtn} onPress={() => loadPosts(nextCursor)}>
            <Text style={s.loadMoreText}>더 보기</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. 재료 해시태그 검색 화면
// ═══════════════════════════════════════════════════════════════════════════════
function HashtagSearchScreen({
  initialTag,
  onBack,
  onPostPress,
}: {
  initialTag: string;
  onBack: () => void;
  onPostPress: (post: Post) => void;
}) {
  const [searchText, setSearchText] = useState(initialTag);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (tag: string) => {
    if (!tag.trim()) return;
    setLoading(true);
    try {
      const result = await fetchPosts({tag: tag.trim(), limit: 20});
      setPosts(result.posts);
    } catch {
      Alert.alert('오류', '검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialTag) search(initialTag);
  }, []);

  return (
    <View style={s.flex1}>
      <View style={s.searchHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={8}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={s.hashSearchBox}>
          <Text style={s.hashSymbol}>#</Text>
          <TextInput
            style={s.hashInput}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            placeholderTextColor={C.sub}
            selectionColor={C.accent}
            onSubmitEditing={() => search(searchText)}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity onPress={() => search(searchText)} hitSlop={8}>
          <Text style={{color: C.accent, fontSize: 13}}>검색</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.flex1} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {searchText.trim() && (
          <Text style={s.resultCount}>
            <Text style={s.resultCountAccent}>#{searchText}</Text>
            {' '}포함 게시글{' '}
            <Text style={s.resultCountNum}>{posts.length}</Text>개
          </Text>
        )}

        {loading ? (
          <ActivityIndicator color={C.accent} style={{marginTop: 40}}/>
        ) : (
          posts.map(post => (
            <TouchableOpacity key={post.id} style={s.resultCard} onPress={() => onPostPress(post)} activeOpacity={0.8}>
              <View style={s.resultThumb}>
                <Text style={{fontSize: 20}}>🍽️</Text>
              </View>
              <View style={s.flex1}>
                <Text style={s.resultTitle} numberOfLines={2}>{post.content}</Text>
                <Text style={s.resultTags}>{(post.tags ?? []).map(t => `#${t}`).join(' ')}</Text>
                <Text style={s.resultKcal}>{post.nickname} · {timeAgo(post.created_at)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. 게시글 작성 화면
// ═══════════════════════════════════════════════════════════════════════════════
function WritePostScreen({
  onCancel,
  onPost,
}: {
  onCancel: () => void;
  onPost: (post: Post) => void;
}) {
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t || tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('내용을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const post = await createPost({
        content: content.trim(),
        ingredient_tags: tags.length > 0 ? JSON.stringify(tags) : undefined,
      });
      onPost(post);
    } catch (e: any) {
      console.error('게시글 작성 실패:', e?.response?.data ?? e?.message ?? e);
      const msg = e?.response?.data?.message ?? e?.message ?? '게시글 작성에 실패했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.flex1}>
      <View style={s.writeHeader}>
        <TouchableOpacity onPress={onCancel} hitSlop={8} disabled={loading}>
          <Text style={s.cancelText}>← 취소</Text>
        </TouchableOpacity>
        <Text style={s.writeHeaderTitle}>레시피 공유</Text>
        <TouchableOpacity onPress={handlePost} hitSlop={8} disabled={loading}>
          {loading ? <ActivityIndicator color={C.accent} size="small"/> : <Text style={s.postBtnText}>게시</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={s.flex1} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.fieldLabel}>내용</Text>
        <TextInput
          style={s.recipeInput}
          value={content}
          onChangeText={setContent}
          placeholder="레시피나 식단을 공유해보세요"
          placeholderTextColor={C.sub}
          multiline
          textAlignVertical="top"
          selectionColor={C.accent}
        />

        <Text style={s.fieldLabel}>식재료 태그</Text>
        <View style={s.ingredientBox}>
          {tags.map(tag => (
            <TouchableOpacity key={tag} style={s.ingredientTag} onPress={() => setTags(prev => prev.filter(t => t !== tag))}>
              <Text style={s.ingredientTagText}>#{tag} ×</Text>
            </TouchableOpacity>
          ))}
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <TextInput
              style={[s.hashInput, {flex: 1, minWidth: 80, color: C.text}]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="재료 입력"
              placeholderTextColor={C.sub}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={s.addIngredientTag} onPress={addTag}>
              <Text style={s.addIngredientText}>+ 추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. 게시글 상세 화면
// ═══════════════════════════════════════════════════════════════════════════════
function PostDetailScreen({
  post: initialPost,
  onBack,
}: {
  post: Post;
  onBack: () => void;
}) {
  const currentUser = useAuthStore(s => s.user);
  const [post, setPost] = useState(initialPost);

  const handleLike = async () => {
    try {
      const result = await toggleLike(post.id);
      setPost(prev => ({...prev, is_liked: result.liked, like_count: result.like_count}));
    } catch {}
  };

  const handleBookmark = async () => {
    try {
      const result = await toggleBookmark(post.id);
      setPost(prev => ({...prev, is_bookmarked: result.bookmarked}));
    } catch {}
  };

  const handleDelete = () => {
    Alert.alert('게시글 삭제', '삭제하면 복구할 수 없어요.', [
      {text: '취소', style: 'cancel'},
      {text: '삭제', style: 'destructive', onPress: async () => {
        try {
          await deletePost(post.id);
          onBack();
        } catch {
          Alert.alert('오류', '삭제에 실패했습니다.');
        }
      }},
    ]);
  };

  return (
    <View style={s.flex1}>
      <View style={s.detailHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={8}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.detailHeaderTitle}>게시글</Text>
        {currentUser?.id === post.author_id ? (
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Text style={{color: C.accent2, fontSize: 13}}>삭제</Text>
          </TouchableOpacity>
        ) : (
          <Text style={s.headerIcon}> </Text>
        )}
      </View>

      <ScrollView style={s.flex1} showsVerticalScrollIndicator={false}>
        <View style={s.coverImage}>
          <Text style={s.coverEmoji}>🍽️</Text>
        </View>

        <View style={s.detailBody}>
          <View style={s.detailMeta}>
            <View style={s.detailAvatar}>
              <Text style={s.authorInitial}>{post.nickname?.[0] ?? '?'}</Text>
            </View>
            <Text style={s.detailAuthorText}>{post.nickname} · {timeAgo(post.created_at)}</Text>
          </View>

          <Text style={s.detailTitle}>{post.content}</Text>

          <View style={s.reactionBar}>
            <TouchableOpacity style={s.reactionBtn} onPress={handleLike}>
              <Text style={{fontSize: 17}}>{post.is_liked ? '❤️' : '🤍'}</Text>
              <Text style={[s.reactionCount, post.is_liked && {color: C.accent2}]}>{post.like_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.reactionBtn} onPress={handleBookmark}>
              <Text style={{fontSize: 17}}>{post.is_bookmarked ? '🔖' : '💾'}</Text>
            </TouchableOpacity>
          </View>

          {(post.tags?.length ?? 0) > 0 && (
            <>
              <Text style={s.sectionLabel}>태그</Text>
              <View style={s.tagRow}>
                {(post.tags ?? []).map(tag => (
                  <View key={tag} style={s.ingredientTagBlue}>
                    <Text style={s.ingredientTagBlueText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 메인 CommunityScreen — 기존 파일을 이걸로 교체하세요
// ═══════════════════════════════════════════════════════════════════════════════
export function CommunityScreen() {
  const [screen, setScreen] = useState<Screen>('feed');
  const [selectedHashtag, setSelectedHashtag] = useState('닭가슴살');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleHashtagPress = (tag: string) => {
    setSelectedHashtag(tag);
    setScreen('hashtagSearch');
  };

  const handleWritePress = () => {
    setScreen('writePost');
  };

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    setScreen('postDetail');
  };

  const handleBack = () => {
    setScreen('feed');
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen !== 'feed') {
        handleBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screen]);

  const handlePost = (post: Post) => {
    setSelectedPost(post);
    setScreen('postDetail');
  };

  return (
    <SafeAreaView style={s.container}>
      {screen === 'feed' && (
        <FeedScreen
          onHashtagPress={handleHashtagPress}
          onWritePress={handleWritePress}
          onPostPress={handlePostPress}
        />
      )}
      {screen === 'hashtagSearch' && (
        <HashtagSearchScreen
          initialTag={selectedHashtag}
          onBack={handleBack}
          onPostPress={handlePostPress}
        />
      )}
      {screen === 'writePost' && (
        <WritePostScreen onCancel={handleBack} onPost={handlePost} />
      )}
      {screen === 'postDetail' && selectedPost && (
        <PostDetailScreen post={selectedPost} onBack={handleBack} />
      )}
    </SafeAreaView>
  );
}

// ─── 스타일시트 ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // ── 기본 ──
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 32,
  },

  // ── 피드 헤더 ──
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  headerIcon: {
    fontSize: 18,
    color: C.text,
  },

  // ── 검색바 ──
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
    opacity: 0.4,
  },
  searchPlaceholder: {
    fontSize: 12,
    color: C.sub,
  },

  // ── TOP 배너 ──
  topBanner: {
    backgroundColor: 'rgba(251,191,36,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.22)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  topBannerLabel: {
    fontSize: 10,
    color: C.amber,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  topBannerTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
  },
  topBannerStats: {
    fontSize: 11,
    color: C.sub,
    marginTop: 2,
  },

  // ── 탭 ──
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    paddingTop: 5,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: C.accent,
  },
  tabText: {
    fontSize: 12,
    color: C.sub,
    fontWeight: '500',
  },
  tabTextActive: {
    color: C.accent,
    fontWeight: '600',
  },

  // ── 게시글 카드 ──
  postCard: {
    backgroundColor: C.surface2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  postThumb: {
    height: 120,
    backgroundColor: '#0d1a0c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postThumbEmoji: {
    fontSize: 40,
  },
  postContent: {
    padding: 12,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 9,
    color: '#0f1117',
    fontWeight: '700',
  },
  authorName: {
    fontSize: 11,
    color: C.sub,
  },
  timeAgo: {
    fontSize: 10,
    color: C.sub,
    marginLeft: 'auto',
  },
  postTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
    marginBottom: 5,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 7,
  },
  hashTag: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(184,255,78,0.08)',
    color: C.accent,
    overflow: 'hidden',
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 11,
    color: C.sub,
  },

  // ── 해시태그 검색 헤더 ──
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backIcon: {
    fontSize: 18,
    color: C.text,
  },
  hashSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 6,
  },
  hashSymbol: {
    fontSize: 12,
    color: C.accent,
    fontWeight: '600',
  },
  hashInput: {
    flex: 1,
    fontSize: 12,
    color: C.text,
    padding: 0,
    margin: 0,
  },
  resultCount: {
    fontSize: 12,
    color: C.sub,
    marginBottom: 10,
  },
  resultCountAccent: {
    color: C.accent,
    fontWeight: '600',
  },
  resultCountNum: {
    color: C.text,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 10,
    color: C.sub,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '500',
  },
  relatedTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 14,
  },
  relatedTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  relatedTagActive: {
    backgroundColor: 'rgba(184,255,78,0.1)',
    borderColor: 'rgba(184,255,78,0.2)',
  },
  relatedTagText: {
    fontSize: 11,
    color: C.sub,
  },
  relatedTagTextActive: {
    color: C.accent,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  resultThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0d1a0c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
    marginBottom: 3,
  },
  resultTags: {
    fontSize: 10,
    color: C.accent,
  },
  resultKcal: {
    fontSize: 10,
    color: C.sub,
    marginTop: 2,
  },

  // ── 게시글 작성 ──
  writeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cancelText: {
    fontSize: 12,
    color: C.sub,
  },
  writeHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  postBtnText: {
    fontSize: 13,
    color: C.accent,
    fontWeight: '500',
  },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  photoAdd: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddLabel: {
    fontSize: 9,
    color: C.sub,
    marginTop: 2,
  },
  photoPreview: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#0d1a0c',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoRemove: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: {
    fontSize: 9,
    color: 'white',
    lineHeight: 14,
  },
  fieldLabel: {
    fontSize: 10,
    color: C.sub,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '500',
  },
  inputField: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13,
    color: C.text,
    marginBottom: 10,
  },
  ingredientBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    minHeight: 56,
    alignItems: 'center',
  },
  ingredientTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(184,255,78,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(184,255,78,0.2)',
  },
  ingredientTagText: {
    fontSize: 11,
    color: C.accent,
  },
  addIngredientTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border2,
    borderStyle: 'dashed',
  },
  addIngredientText: {
    fontSize: 11,
    color: C.sub,
  },
  recipeInput: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 12,
    color: C.sub,
    minHeight: 90,
    marginBottom: 10,
    lineHeight: 20,
  },
  aiImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(184,255,78,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(184,255,78,0.18)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  aiImportText: {
    fontSize: 12,
    color: C.text,
    flex: 1,
  },
  aiImportAction: {
    fontSize: 11,
    color: C.accent,
  },

  // ── 게시글 상세 ──
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  detailHeaderTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
  },
  coverImage: {
    height: 160,
    backgroundColor: '#0d1a0c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 52,
  },
  detailBody: {
    padding: 14,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAuthorText: {
    fontSize: 12,
    color: C.sub,
    flex: 1,
  },
  topBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
  },
  topBadgeText: {
    fontSize: 10,
    color: C.amber,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 10,
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '500',
    color: C.text,
  },
  shareBtn: {
    marginLeft: 'auto',
  },
  ingredientTagBlue: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(78,201,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(78,201,255,0.2)',
    marginBottom: 4,
  },
  ingredientTagBlueText: {
    fontSize: 11,
    color: C.accent3,
  },
  nutritionCard: {
    backgroundColor: C.surface2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  nutritionTitle: {
    fontSize: 11,
    color: C.accent3,
    fontWeight: '500',
    marginBottom: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  nutritionUnit: {
    fontSize: 10,
    color: C.sub,
    marginTop: 2,
  },
  recipeStep: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(184,255,78,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(184,255,78,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.accent,
  },
  stepText: {
    fontSize: 12,
    color: C.sub,
    lineHeight: 20,
    flex: 1,
  },
  loadMoreBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  loadMoreText: {
    fontSize: 13,
    color: C.accent,
  },
});