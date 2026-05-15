import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {useAuthStore} from '../../store/authStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Preference'>;

const CARBS = ['🍠 고구마', '🌾 현미', '🍞 통밀빵', '🫘 콩류', '🌽 옥수수', '🥔 감자'];
const GOALS = [
    {key: 'lose', label: '🔥 체중 감량'},
    {key: 'maintain', label: '⚖️ 체중 유지'},
    {key: 'gain', label: '💪 근육 증가'},
] as const;

export function PreferenceScreen({navigation}: Props) {
    const setOnboarded = useAuthStore((s) => s.setOnboarded);
    const [selected, setSelected] = useState<string[]>(['🍠 고구마', '🌾 현미']);
    const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');

    const toggle = (item: string) => {
        setSelected(selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item]);
    };

    const handleComplete = () => {
        setOnboarded(true);
    };

    return (
        <SafeAreaView style={s.container}>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 16}}>
                    <View style={s.dots}>
                        <View style={[s.dot, s.dotOn]}/>
                        <View style={[s.dot, s.dotOn]}/>
                        <View style={[s.dot, s.dotOn]}/>
                    </View>
                    <Text style={s.title}>선호 식재료</Text>
                    <Text style={s.subtitle}>영양소별로 좋아하는 재료를 선택해주세요</Text>

                    <View style={s.tabs}>
                        <Text style={s.tabActive}>🍚 탄수화물</Text>
                        <Text style={s.tabInactive}>🍗 단백질</Text>
                        <Text style={s.tabInactive}>🥑 지방</Text>
                    </View>

                    <Text style={s.label}>탄수화물 식재료</Text>
                    <View style={s.chipRow}>
                        {CARBS.map((item) => (
                            <TouchableOpacity key={item} style={[s.chip, selected.includes(item) && s.chipOn]} onPress={() => toggle(item)}>
                                <Text style={[s.chipText, selected.includes(item) && s.chipTextOn]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>식단 목표</Text>
                    <View style={s.chipRow}>
                        {GOALS.map((item) => (
                            <TouchableOpacity key={item.key} style={[s.chip, goal === item.key && s.chipOn]} onPress={() => setGoal(item.key)}>
                                <Text style={[s.chipText, goal === item.key && s.chipTextOn]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </ScrollView>
                <View style={s.footer}>
                    <TouchableOpacity style={s.primaryBtn} onPress={handleComplete}>
                        <Text style={s.primaryBtnText}>설정 완료 →</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    scroll: {flex: 1, paddingHorizontal: 20},
    dots: {flexDirection: 'row', gap: 6, paddingVertical: 14},
    dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border2},
    dotOn: {width: 18, borderRadius: 3, backgroundColor: colors.accent},
    title: {fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4},
    subtitle: {fontSize: 12, color: colors.sub, marginBottom: 16},
    tabs: {flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 14},
    tabActive: {fontSize: 12, fontWeight: '600', color: colors.accent3, paddingHorizontal: 16, paddingBottom: 9, borderBottomWidth: 2, borderBottomColor: colors.accent3},
    tabInactive: {fontSize: 12, color: colors.sub, paddingHorizontal: 16, paddingBottom: 9},
    label: {fontSize: 10, color: colors.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '500'},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16},
    chip: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border},
    chipOn: {backgroundColor: 'rgba(184,255,78,0.15)', borderColor: colors.accent},
    chipText: {fontSize: 11, fontWeight: '500', color: colors.sub},
    chipTextOn: {color: colors.accent},
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.bg,
    },
    primaryBtn: {backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: 'center'},
    primaryBtnText: {fontSize: 14, fontWeight: '700', color: colors.bg},
});
