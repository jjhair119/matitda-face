import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MyPageStackParamList} from '../../navigation/MyPageStackNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MyPageStackParamList, 'DietHistory'>;

/* ── 월별 더미 점수 데이터 ── */
const SCORE_DATA: Record<string, Record<number, number | null>> = {
    '2026-05': {
        1: 85, 2: null, 3: 72,
        4: 88, 5: 92, 6: 88, 7: 76, 8: 82, 9: null, 10: null,
        11: 90, 12: 88, 13: 85, 14: null, 15: 79, 16: null, 17: null,
        18: 90, 19: 94, 20: 88, 21: 85, 22: 76, 23: null, 24: null,
        25: null, 26: 82, 27: 92, 28: 88,
    },
    '2026-04': {
        1: 82, 2: 79, 3: 88, 4: null, 5: null,
        6: 86, 7: 90, 8: 85, 9: 88, 10: 76, 11: null, 12: null,
        13: 88, 14: 85, 15: 92, 16: 88, 17: 79, 18: null, 19: null,
        20: 82, 21: 88, 22: 90, 23: 85, 24: 79, 25: null, 26: null,
        27: 85, 28: 88, 29: 90, 30: 86,
    },
    '2026-03': {
        2: 80, 3: 85, 4: 88, 5: 79, 6: 90, 7: null, 8: null,
        9: 85, 10: 88, 11: 92, 12: 80, 13: 76, 14: null, 15: null,
        16: 85, 17: 90, 18: 88, 19: 82, 20: 79, 21: null, 22: null,
        23: 85, 24: 88, 25: 90, 26: 86, 27: 92, 28: null, 29: null,
        30: 88, 31: 85,
    },
};

const MONTH_LABELS: Record<number, string> = {
    1: '1월', 2: '2월', 3: '3월', 4: '4월', 5: '5월',
    6: '6월', 7: '7월', 8: '8월', 9: '9월', 10: '10월',
    11: '11월', 12: '12월',
};

const DAY_HEADERS = ['월', '화', '수', '목', '금', '토', '일'];

/* 오늘 날짜 기준 (시스템: 2026-05-28) */
const TODAY = {year: 2026, month: 5, day: 28};

type CalendarCell = {day: number | null; score: number | null; isFuture: boolean; isToday: boolean};

function buildCalendar(year: number, month: number, scores: Record<number, number | null>): CalendarCell[] {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: CalendarCell[] = [];

    for (let i = 0; i < startOffset; i++) {
        cells.push({day: null, score: null, isFuture: false, isToday: false});
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const isFuture =
            year > TODAY.year ||
            (year === TODAY.year && month > TODAY.month) ||
            (year === TODAY.year && month === TODAY.month && d > TODAY.day);
        const isToday = year === TODAY.year && month === TODAY.month && d === TODAY.day;
        cells.push({
            day: d,
            score: isFuture ? null : (scores[d] ?? null),
            isFuture,
            isToday,
        });
    }

    while (cells.length % 7 !== 0) {
        cells.push({day: null, score: null, isFuture: false, isToday: false});
    }

    return cells;
}

function calcStats(scores: Record<number, number | null>, year: number, month: number) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = year === TODAY.year && month === TODAY.month ? TODAY.day : daysInMonth;
    const totalDays = Math.min(today, daysInMonth);

    const validScores = Object.entries(scores)
        .filter(([d, s]) => parseInt(d, 10) <= totalDays && s !== null)
        .map(([, s]) => s as number);

    const avg = validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 0;
    const recorded = validScores.length;

    /* 최장 연속일 계산 */
    let maxStreak = 0;
    let cur = 0;
    for (let d = 1; d <= totalDays; d++) {
        if (scores[d] != null) {
            cur++;
            maxStreak = Math.max(maxStreak, cur);
        } else {
            cur = 0;
        }
    }

    return {avg, recorded, totalDays, maxStreak};
}

const RECENT_RECORDS = [
    {date: '5월 28일 수', meals: '🌅 달걀 스크램블 · ☀️ 닭가슴살 볶음밥', score: 88, kcal: 1_317},
    {date: '5월 27일 화', meals: '🌅 현미밥 · ☀️ 닭가슴살 샐러드 · 🌙 두부된장국', score: 92, kcal: 1_680},
    {date: '5월 26일 월', meals: '☀️ 고구마 닭가슴살 도시락 · 🌙 나물비빔밥', score: 82, kcal: 1_420},
    {date: '5월 22일 목', meals: '🌅 통밀빵 · ☀️ 참치샐러드 · 🌙 된장찌개', score: 76, kcal: 1_280},
    {date: '5월 21일 수', meals: '🌅 달걀 · ☀️ 현미밥 닭볶음 · 🌙 연두부', score: 85, kcal: 1_510},
    {date: '5월 20일 화', meals: '☀️ 닭가슴살 볶음밥 · 🌙 야채 된장국', score: 88, kcal: 1_390},
    {date: '5월 19일 월', meals: '🌅 오트밀 · ☀️ 두부스테이크 · 🌙 나물반찬', score: 94, kcal: 1_720},
];

export function DietHistoryScreen({navigation}: Props) {
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(5);

    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const scores = SCORE_DATA[monthKey] ?? {};
    const cells = buildCalendar(year, month, scores);
    const stats = calcStats(scores, year, month);
    const rows: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        rows.push(cells.slice(i, i + 7));
    }

    const prevMonth = () => {
        if (month === 1) {
            setYear(year - 1);
            setMonth(12);
        } else {
            setMonth(month - 1);
        }
    };

    const nextMonth = () => {
        if (year > TODAY.year || (year === TODAY.year && month >= TODAY.month)) return;
        if (month === 12) {
            setYear(year + 1);
            setMonth(1);
        } else {
            setMonth(month + 1);
        }
    };

    const isNextDisabled = year === TODAY.year && month >= TODAY.month;

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>식단 히스토리</Text>
                <View style={{width: 32}}/>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 월 네비게이터 */}
                <View style={s.monthNav}>
                    <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
                        <Text style={s.navBtnText}>‹</Text>
                    </TouchableOpacity>
                    <Text style={s.monthLabel}>{year}년 {MONTH_LABELS[month]}</Text>
                    <TouchableOpacity
                        onPress={nextMonth}
                        style={[s.navBtn, isNextDisabled && s.navBtnDisabled]}
                        disabled={isNextDisabled}
                    >
                        <Text style={[s.navBtnText, isNextDisabled && {color: colors.border2}]}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* 통계 카드 */}
                <View style={s.statsRow}>
                    {[
                        {label: '월 평균', value: stats.avg > 0 ? `${stats.avg}점` : '-'},
                        {label: '기록 일수', value: `${stats.recorded}/${stats.totalDays}일`},
                        {label: '최고 연속', value: `${stats.maxStreak}일`},
                    ].map((item, idx) => (
                        <View key={item.label} style={[s.statCell, idx < 2 && s.statCellBorder]}>
                            <Text style={s.statLabel}>{item.label}</Text>
                            <Text style={s.statValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* 달력 */}
                <View style={s.calendarWrap}>
                    {/* 요일 헤더 */}
                    <View style={s.calRow}>
                        {DAY_HEADERS.map((d) => (
                            <Text key={d} style={s.dayHeader}>{d}</Text>
                        ))}
                    </View>

                    {/* 날짜 셀 */}
                    {rows.map((row, ri) => (
                        <View key={ri} style={s.calRow}>
                            {row.map((cell, ci) => (
                                <View key={ci} style={s.cellWrap}>
                                    {cell.day !== null ? (
                                        <View style={[
                                            s.cell,
                                            cell.isToday && s.cellToday,
                                            cell.score !== null && {
                                                backgroundColor: `rgba(184,255,78,${cell.score / 100})`,
                                            },
                                            cell.day !== null && cell.score === null && !cell.isFuture && s.cellMissed,
                                        ]}>
                                            <Text style={[
                                                s.cellDay,
                                                cell.score !== null && s.cellDayDark,
                                                cell.isFuture && s.cellDayFuture,
                                            ]}>
                                                {cell.day}
                                            </Text>
                                            {cell.score !== null && (
                                                <Text style={s.cellScore}>{cell.score}</Text>
                                            )}
                                        </View>
                                    ) : (
                                        <View style={s.cellEmpty}/>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}

                    {/* 범례 */}
                    <View style={s.legend}>
                        <View style={s.legendItem}>
                            <View style={[s.legendDot, {backgroundColor: 'rgba(184,255,78,0.3)'}]}/>
                            <Text style={s.legendLabel}>60점대</Text>
                        </View>
                        <View style={s.legendItem}>
                            <View style={[s.legendDot, {backgroundColor: 'rgba(184,255,78,0.6)'}]}/>
                            <Text style={s.legendLabel}>70~80점대</Text>
                        </View>
                        <View style={s.legendItem}>
                            <View style={[s.legendDot, {backgroundColor: 'rgba(184,255,78,0.9)'}]}/>
                            <Text style={s.legendLabel}>90점 이상</Text>
                        </View>
                        <View style={s.legendItem}>
                            <View style={[s.legendDot, {backgroundColor: colors.border}]}/>
                            <Text style={s.legendLabel}>미기록</Text>
                        </View>
                    </View>
                </View>

                {/* 최근 기록 */}
                {monthKey === '2026-05' && (
                    <View style={s.recentWrap}>
                        <Text style={s.sectionLabel}>최근 기록</Text>
                        {RECENT_RECORDS.map((rec, idx) => (
                            <View key={idx} style={s.recCard}>
                                <View style={s.recLeft}>
                                    <Text style={s.recDate}>{rec.date}</Text>
                                    <Text style={s.recMeals} numberOfLines={1}>{rec.meals}</Text>
                                    <Text style={s.recKcal}>{rec.kcal.toLocaleString()} kcal</Text>
                                </View>
                                <View style={[s.recScore, {backgroundColor: `rgba(184,255,78,${rec.score / 100})`}]}>
                                    <Text style={s.recScoreText}>{rec.score}</Text>
                                    <Text style={s.recScoreUnit}>점</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {padding: 4},
    backText: {fontSize: 20, color: colors.text},
    headerTitle: {fontSize: 15, fontWeight: '600', color: colors.text},

    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        paddingVertical: 16,
    },
    navBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navBtnDisabled: {opacity: 0.3},
    navBtnText: {fontSize: 20, color: colors.text, lineHeight: 24},
    monthLabel: {fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 120, textAlign: 'center'},

    statsRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    statCell: {flex: 1, alignItems: 'center', paddingVertical: 12},
    statCellBorder: {borderRightWidth: 1, borderRightColor: colors.border},
    statLabel: {fontSize: 10, color: colors.sub, marginBottom: 4},
    statValue: {fontSize: 16, fontWeight: '700', color: colors.accent},

    calendarWrap: {
        marginHorizontal: 16,
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        marginBottom: 16,
    },
    calRow: {flexDirection: 'row', marginBottom: 4},
    dayHeader: {
        flex: 1,
        textAlign: 'center',
        fontSize: 10,
        color: colors.sub,
        paddingVertical: 4,
    },
    cellWrap: {flex: 1, aspectRatio: 1, padding: 2},
    cell: {
        flex: 1,
        borderRadius: 6,
        backgroundColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
    },
    cellToday: {
        borderWidth: 1.5,
        borderColor: colors.accent,
    },
    cellMissed: {backgroundColor: 'rgba(255,255,255,0.03)'},
    cellEmpty: {flex: 1},
    cellDay: {fontSize: 8, color: colors.sub, fontWeight: '500'},
    cellDayDark: {color: '#0f1117'},
    cellDayFuture: {color: 'rgba(255,255,255,0.15)'},
    cellScore: {fontSize: 7, fontWeight: '700', color: '#0f1117'},

    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 14,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    legendItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
    legendDot: {width: 8, height: 8, borderRadius: 2},
    legendLabel: {fontSize: 9, color: colors.sub},

    recentWrap: {paddingHorizontal: 16, paddingBottom: 32},
    sectionLabel: {
        fontSize: 10,
        color: colors.sub,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '500',
        marginBottom: 10,
    },
    recCard: {
        backgroundColor: colors.surface2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    recLeft: {flex: 1},
    recDate: {fontSize: 11, color: colors.sub, marginBottom: 3},
    recMeals: {fontSize: 12, color: colors.text, marginBottom: 3},
    recKcal: {fontSize: 11, color: colors.accent3},
    recScore: {
        width: 44,
        height: 44,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recScoreText: {fontSize: 16, fontWeight: '700', color: '#0f1117'},
    recScoreUnit: {fontSize: 8, color: '#0f1117', fontWeight: '600'},
});
