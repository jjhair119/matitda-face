import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

/* ── 목업 디자인 토큰 ── */
const colors = {
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

/* ── 타입 ── */
interface InfoItem {
  label: string;
  value: string;
}

interface DietDay {
  day: string;
  score: number | null;
}

/* ── 데이터 ── */
const INFO_ITEMS: InfoItem[] = [
  {label: '나이', value: '26세'},
  {label: '키', value: '163cm'},
  {label: '몸무게', value: '55kg'},
];

const DIET_WEEK: DietDay[] = [
  {day: '월', score: 88},
  {day: '화', score: 92},
  {day: '수', score: null},
  {day: '목', score: 76},
  {day: '금', score: 88},
  {day: '토', score: null},
  {day: '일', score: null},
];

/* ── 메인 컴포넌트 ── */
export function MyPageScreen() {
  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* 상태바 */}
      <View style={s.statusBar}>
        <Text style={s.statusTime}>9:41</Text>
        <Text style={s.statusIcons}>●●●</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── 프로필 ── */}
        <View style={s.profileRow}>
          <View style={s.avatar}>
            <Text style={s.avatarEmoji}>🙂</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>지민</Text>
            <Text style={s.profileSub}>@jimineat · 팔로잉 24 · 팔로워 31</Text>
          </View>
          <TouchableOpacity style={s.editBtn}>
            <Text style={s.editBtnText}>편집</Text>
          </TouchableOpacity>
        </View>

        {/* ── 내 정보 ── */}
        <Text style={s.sectionLabel}>내 정보</Text>
        <View style={s.card}>
          {/* 나이 / 키 / 몸무게 */}
          <View style={s.infoGrid}>
            {INFO_ITEMS.map((item, idx) => (
              <View
                key={item.label}
                style={[
                  s.infoCell,
                  idx < INFO_ITEMS.length - 1 && s.infoCellBorder,
                ]}>
                <Text style={s.infoCellLabel}>{item.label}</Text>
                <Text style={s.infoCellValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* 식단 목표 */}
          <View style={s.infoRowDivider} />
          <View style={s.infoRow}>
            <Text style={s.infoRowLabel}>식단 목표</Text>
            <View style={s.chip}>
              <Text style={s.chipText}>🔥 체중 감량</Text>
            </View>
          </View>

          {/* TDEE */}
          <View style={[s.infoRow, {marginTop: 8}]}>
            <Text style={s.infoRowLabel}>TDEE</Text>
            <Text style={s.tdeeValue}>1,820 kcal/일</Text>
          </View>
        </View>

        {/* ── 보유 포인트 & 쿠폰 ── */}
        <Text style={s.sectionLabel}>보유 포인트 &amp; 쿠폰</Text>
        <View style={[s.card, s.pointCard]}>
          <View>
            <Text style={s.pointValue}>9,000 P</Text>
            <Text style={s.pointSub}>쿠폰 2장 보유</Text>
          </View>
          <TouchableOpacity style={s.historyBtn}>
            <Text style={s.historyBtnText}>내역 보기</Text>
          </TouchableOpacity>
        </View>

        {/* ── 식단 히스토리 ── */}
        <Text style={s.sectionLabel}>식단 히스토리</Text>
        <View style={s.card}>
          {/* 요일 헤더 + 점수 칸을 column으로 묶어 flex:1씩 균등 배분 */}
          <View style={s.weekGrid}>
            {DIET_WEEK.map(({day, score}) => (
              <View key={day} style={s.weekCol}>
                <Text style={s.dayLabel}>{day}</Text>
                {score != null ? (
                  <View
                    style={[
                      s.scoreCell,
                      {backgroundColor: `rgba(184,255,78,${score / 100})`},
                    ]}>
                    <Text style={s.scoreCellText}>{score}</Text>
                  </View>
                ) : (
                  <View style={[s.scoreCell, s.scoreCellEmpty]} />
                )}
              </View>
            ))}
          </View>
          <Text style={s.weekAvg}>
            이번 주 평균{' '}
            <Text style={s.weekAvgAccent}>86점</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── 하단 탭바 ── */
const NAV_ITEMS = [
  {icon: '👥', label: '친구', key: 'friend'},
  {icon: '💬', label: '커뮤니티', key: 'community'},
  {icon: '🏠', label: '홈', key: 'home'},
  {icon: '🛒', label: '식재료구매', key: 'market'},
  {icon: '👤', label: '마이', key: 'my'},
];

function BottomNav({active}: {active: string}) {
  return (
    <View style={s.bottomNav}>
      {NAV_ITEMS.map(item => (
        <TouchableOpacity key={item.key} style={s.bnavItem}>
          <Text style={[s.bnavIcon, item.key === active && s.bnavIconOn]}>
            {item.icon}
          </Text>
          <Text
            style={[s.bnavLabel, item.key === active && s.bnavLabelOn]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ── 스타일 ── */
const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},

  /* 상태바 */
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  statusTime: {fontSize: 11, fontWeight: '600', color: colors.sub},
  statusIcons: {fontSize: 11, fontWeight: '600', color: colors.sub},

  /* 스크롤 */
  scroll: {flex: 1},
  scrollContent: {padding: 14, paddingBottom: 24},

  /* 프로필 */
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // linear gradient 대신 단색 (RN에서는 react-native-linear-gradient 필요)
    backgroundColor: colors.teal,
  },
  avatarEmoji: {fontSize: 24},
  profileInfo: {flex: 1},
  profileName: {fontSize: 16, fontWeight: '700', color: colors.text},
  profileSub: {fontSize: 11, color: colors.sub, marginTop: 2},
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {fontSize: 12, color: colors.sub},

  /* 섹션 레이블 */
  sectionLabel: {
    fontSize: 10,
    color: colors.sub,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 4,
  },

  /* 카드 */
  card: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  /* 내 정보 그리드 */
  infoGrid: {flexDirection: 'row'},
  infoCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoCellBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  infoCellLabel: {fontSize: 11, color: colors.sub, marginBottom: 3},
  infoCellValue: {fontSize: 14, fontWeight: '600', color: colors.text},

  infoRowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRowLabel: {fontSize: 11, color: colors.sub},

  /* 체중 감량 chip */
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(184,255,78,0.15)',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  chipText: {fontSize: 10, fontWeight: '500', color: colors.accent},

  /* TDEE */
  tdeeValue: {fontSize: 12, fontWeight: '600', color: colors.accent},

  /* 포인트 카드 */
  pointCard: {
    backgroundColor: 'rgba(184,255,78,0.05)',
    borderColor: 'rgba(184,255,78,0.18)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: -0.3,
  },
  pointSub: {fontSize: 11, color: colors.sub, marginTop: 2},
  historyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(184,255,78,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(184,255,78,0.2)',
  },
  historyBtnText: {fontSize: 11, color: colors.accent},

  /* 식단 히스토리 */
  weekGrid: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 9,
    color: colors.sub,
    textAlign: 'center',
  },
  scoreCell: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCellEmpty: {backgroundColor: colors.border},
  scoreCellText: {fontSize: 8, fontWeight: '600', color: '#0f1117'},
  weekAvg: {fontSize: 11, color: colors.sub, marginTop: 2},
  weekAvgAccent: {color: colors.accent, fontWeight: '600'},

  /* 하단 탭바 */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  bnavItem: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bnavIcon: {fontSize: 17, opacity: 0.38},
  bnavIconOn: {opacity: 1},
  bnavLabel: {fontSize: 9, color: colors.sub},
  bnavLabelOn: {color: colors.accent},
});
