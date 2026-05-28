import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  FlatList,
  BackHandler,
} from 'react-native';
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

interface Post {
  id: number;
  author: string;
  authorInitial: string;
  timeAgo: string;
  title: string;
  emoji: string;
  tags: string[];
  likes: number;
  saves: number;
  comments: number;
}

// ─── 목업 데이터 ──────────────────────────────────────────────────────────────
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    author: '지민의 식탁',
    authorInitial: '지',
    timeAgo: '2시간 전',
    title: '다이어트 닭가슴살 볶음밥 🍳',
    emoji: '🍳',
    tags: ['닭가슴살', '브로콜리', '다이어트'],
    likes: 87,
    saves: 34,
    comments: 12,
  },
  {
    id: 2,
    author: '헬시밀',
    authorInitial: '헬',
    timeAgo: '5시간 전',
    title: '두부 스크램블 에그 샐러드 🥗',
    emoji: '🥗',
    tags: ['두부', '달걀', '저칼로리'],
    likes: 54,
    saves: 21,
    comments: 7,
  },
  {
    id: 3,
    author: '근손실방지위원회',
    authorInitial: '근',
    timeAgo: '어제',
    title: '고단백 연어 덮밥 🐟',
    emoji: '🐟',
    tags: ['연어', '현미밥', '고단백'],
    likes: 120,
    saves: 88,
    comments: 23,
  },
];

const RECIPE_STEPS = [
  '닭가슴살을 한 입 크기로 썬다',
  '브로콜리를 살짝 데친다',
  '팬에 참기름을 두르고 마늘을 볶는다',
  '닭가슴살 → 채소 순으로 넣고 볶는다',
  '현미밥 추가 후 간장 1T, 소금으로 간한다',
];

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

  return (
    <View style={s.flex1}>
      {/* 헤더 */}
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
        {/* 검색창 */}
        <TouchableOpacity
          style={s.searchBar}
          onPress={() => onHashtagPress('닭가슴살')}
          activeOpacity={0.7}
        >
          <Text style={s.searchIcon}>🔍</Text>
          <Text style={s.searchPlaceholder}>#재료명으로 레시피 검색 (예: #닭가슴살)</Text>
        </TouchableOpacity>

        {/* TOP1 배너 */}
        <View style={s.topBanner}>
          <Text style={s.topBannerLabel}>🏆 이번 주 TOP 1</Text>
          <Text style={s.topBannerTitle}>초간단 단백질 도시락 레시피</Text>
          <Text style={s.topBannerStats}>❤️ 342 · 💾 218 · 👁 1,204</Text>
        </View>

        {/* 탭 */}
        <View style={s.tabBar}>
          {(['추천', '팔로잉', '최신'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[s.tab, activeTab === tab && s.tabActive]}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 게시글 카드 목록 */}
        {MOCK_POSTS.map(post => (
          <TouchableOpacity
            key={post.id}
            style={s.postCard}
            onPress={() => onPostPress(post)}
            activeOpacity={0.8}
          >
            {/* 썸네일 */}
            <View style={s.postThumb}>
              <Text style={s.postThumbEmoji}>{post.emoji}</Text>
            </View>
            {/* 콘텐츠 */}
            <View style={s.postContent}>
              {/* 작성자 행 */}
              <View style={s.postMeta}>
                <View style={s.authorAvatar}>
                  <Text style={s.authorInitial}>{post.authorInitial}</Text>
                </View>
                <Text style={s.authorName}>{post.author}</Text>
                <Text style={s.timeAgo}>{post.timeAgo}</Text>
              </View>
              {/* 제목 */}
              <Text style={s.postTitle}>{post.title}</Text>
              {/* 해시태그 */}
              <View style={s.tagRow}>
                {post.tags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => onHashtagPress(tag)}
                    hitSlop={4}
                  >
                    <Text style={s.hashTag}>#{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* 반응 */}
              <View style={s.postStats}>
                <Text style={s.statText}>❤️ {post.likes}</Text>
                <Text style={s.statText}>💾 {post.saves}</Text>
                <Text style={s.statText}>💬 {post.comments}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
}: {
  initialTag: string;
  onBack: () => void;
}) {
  const [searchText, setSearchText] = useState(initialTag);

  const RELATED_TAGS = ['닭가슴살', '닭안심', '훈제닭'];
  const RESULTS = [
    { emoji: '🍳', title: '닭가슴살 볶음밥', tags: '#닭가슴살 #현미 #브로콜리', kcal: '520kcal' },
    { emoji: '🥗', title: '닭가슴살 샐러드', tags: '#닭가슴살 #양상추 #아보카도', kcal: '320kcal' },
    { emoji: '🍜', title: '닭가슴살 카레', tags: '#닭가슴살 #고구마 #양파', kcal: '480kcal' },
  ];

  return (
    <View style={s.flex1}>
      {/* 검색 헤더 */}
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
          />
        </View>
      </View>

      <ScrollView
        style={s.flex1}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 결과 수 */}
        <Text style={s.resultCount}>
          <Text style={s.resultCountAccent}>#{searchText}</Text>
          {' '}포함 레시피{' '}
          <Text style={s.resultCountNum}>284</Text>개
        </Text>

        {/* 연관 재료 */}
        <Text style={s.sectionLabel}>연관 재료</Text>
        <View style={s.relatedTagRow}>
          {RELATED_TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              onPress={() => setSearchText(tag)}
              style={[s.relatedTag, searchText === tag && s.relatedTagActive]}
            >
              <Text style={[s.relatedTagText, searchText === tag && s.relatedTagTextActive]}>
                #{tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 레시피 결과 */}
        <Text style={s.sectionLabel}>레시피 결과</Text>
        {RESULTS.map((r, i) => (
          <View key={i} style={s.resultCard}>
            <View style={s.resultThumb}>
              <Text style={{ fontSize: 20 }}>{r.emoji}</Text>
            </View>
            <View style={s.flex1}>
              <Text style={s.resultTitle}>{r.title}</Text>
              <Text style={s.resultTags}>{r.tags}</Text>
              <Text style={s.resultKcal}>{r.kcal}</Text>
            </View>
          </View>
        ))}
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
  onPost: () => void;
}) {
  const [title, setTitle] = useState('닭가슴살 볶음밥');
  const [recipe, setRecipe] = useState(
    '1. 닭가슴살을 한 입 크기로 자른다\n2. 브로콜리를 데친다\n3. 팬에 참기름을 두르고 볶는다...',
  );

  const INGREDIENTS = ['닭가슴살150g', '현미밥150g', '브로콜리80g'];

  return (
    <View style={s.flex1}>
      {/* 상단 바 */}
      <View style={s.writeHeader}>
        <TouchableOpacity onPress={onCancel} hitSlop={8}>
          <Text style={s.cancelText}>← 취소</Text>
        </TouchableOpacity>
        <Text style={s.writeHeaderTitle}>레시피 공유</Text>
        <TouchableOpacity onPress={onPost} hitSlop={8}>
          <Text style={s.postBtnText}>게시</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.flex1}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 사진 추가 */}
        <View style={s.photoRow}>
          <TouchableOpacity style={s.photoAdd}>
            <Text style={{ fontSize: 20 }}>📷</Text>
            <Text style={s.photoAddLabel}>사진 추가</Text>
          </TouchableOpacity>
          <View style={s.photoPreview}>
            <Text style={{ fontSize: 26 }}>🍳</Text>
            <TouchableOpacity style={s.photoRemove}>
              <Text style={s.photoRemoveText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 메뉴 이름 */}
        <Text style={s.fieldLabel}>메뉴 이름</Text>
        <TextInput
          style={s.inputField}
          value={title}
          onChangeText={setTitle}
          placeholder="메뉴 이름을 입력하세요"
          placeholderTextColor={C.sub}
          selectionColor={C.accent}
        />

        {/* 식재료 & 용량 */}
        <Text style={s.fieldLabel}>식재료 & 용량 (해시태그)</Text>
        <View style={s.ingredientBox}>
          {INGREDIENTS.map(ing => (
            <View key={ing} style={s.ingredientTag}>
              <Text style={s.ingredientTagText}>#{ing}</Text>
            </View>
          ))}
          <TouchableOpacity style={s.addIngredientTag}>
            <Text style={s.addIngredientText}>+ 재료 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 레시피 */}
        <Text style={s.fieldLabel}>레시피 순서</Text>
        <TextInput
          style={s.recipeInput}
          value={recipe}
          onChangeText={setRecipe}
          placeholder="레시피 순서를 입력하세요"
          placeholderTextColor={C.sub}
          multiline
          textAlignVertical="top"
          selectionColor={C.accent}
        />

        {/* AI 자동 불러오기 */}
        <TouchableOpacity style={s.aiImportBtn} activeOpacity={0.7}>
          <Text>✨</Text>
          <Text style={s.aiImportText}>오늘 점심 레시피 자동 불러오기</Text>
          <Text style={s.aiImportAction}>불러오기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. 게시글 상세 화면
// ═══════════════════════════════════════════════════════════════════════════════
function PostDetailScreen({
  post,
  onBack,
}: {
  post: Post;
  onBack: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const NUTRITION = [
    { val: '520', unit: 'kcal', color: C.text },
    { val: '68g', unit: '탄수', color: C.accent3 },
    { val: '42g', unit: '단백', color: C.teal },
    { val: '12g', unit: '지방', color: C.amber },
  ];

  const INGREDIENTS_DETAIL = ['닭가슴살 150g', '현미밥 150g', '브로콜리 80g', '달걀 1개'];

  return (
    <View style={s.flex1}>
      {/* 상단 바 */}
      <View style={s.detailHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={8}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.detailHeaderTitle}>레시피</Text>
        <Text style={s.headerIcon}>⋯</Text>
      </View>

      <ScrollView style={s.flex1} showsVerticalScrollIndicator={false}>
        {/* 커버 이미지 */}
        <View style={s.coverImage}>
          <Text style={s.coverEmoji}>{post.emoji}</Text>
        </View>

        <View style={s.detailBody}>
          {/* 작성자 + TOP 배지 */}
          <View style={s.detailMeta}>
            <View style={s.detailAvatar}>
              <Text style={s.authorInitial}>{post.authorInitial}</Text>
            </View>
            <Text style={s.detailAuthorText}>
              {post.author} · {post.timeAgo}
            </Text>
            <View style={s.topBadge}>
              <Text style={s.topBadgeText}>🥇 TOP1</Text>
            </View>
          </View>

          {/* 제목 */}
          <Text style={s.detailTitle}>{post.title}</Text>

          {/* 반응 바 */}
          <View style={s.reactionBar}>
            <TouchableOpacity
              style={s.reactionBtn}
              onPress={() => setLiked(!liked)}
            >
              <Text style={{ fontSize: 17 }}>{liked ? '❤️' : '🤍'}</Text>
              <Text style={[s.reactionCount, liked && { color: C.accent2 }]}>
                {post.likes + (liked ? 1 : 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.reactionBtn}
              onPress={() => setSaved(!saved)}
            >
              <Text style={{ fontSize: 17 }}>{saved ? '🔖' : '💾'}</Text>
              <Text style={s.reactionCount}>{post.saves + (saved ? 1 : 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.reactionBtn}>
              <Text style={{ fontSize: 17 }}>💬</Text>
              <Text style={s.reactionCount}>{post.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.shareBtn}>
              <Text style={{ fontSize: 17 }}>↗️</Text>
            </TouchableOpacity>
          </View>

          {/* 식재료 & 용량 */}
          <Text style={s.sectionLabel}>식재료 & 용량</Text>
          <View style={s.tagRow}>
            {INGREDIENTS_DETAIL.map(ing => (
              <View key={ing} style={s.ingredientTagBlue}>
                <Text style={s.ingredientTagBlueText}>#{ing}</Text>
              </View>
            ))}
          </View>

          {/* AI 영양 정보 */}
          <View style={s.nutritionCard}>
            <Text style={s.nutritionTitle}>✨ AI 분석 영양 정보</Text>
            <View style={s.nutritionRow}>
              {NUTRITION.map(n => (
                <View key={n.unit} style={s.nutritionItem}>
                  <Text style={[s.nutritionVal, { color: n.color }]}>{n.val}</Text>
                  <Text style={s.nutritionUnit}>{n.unit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 레시피 순서 */}
          <Text style={s.sectionLabel}>레시피 순서</Text>
          {RECIPE_STEPS.map((step, i) => (
            <View key={i} style={s.recipeStep}>
              <View style={s.stepNumber}>
                <Text style={s.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
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

  const handlePost = () => {
    // 게시 완료 → 게시글 상세로 이동
    setSelectedPost(MOCK_POSTS[0]);
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
});