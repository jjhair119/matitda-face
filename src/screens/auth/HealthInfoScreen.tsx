import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'HealthInfo'>;

const ALLERGIES = ['🥜 견과류', '🦐 갑각류', '🥛 유제품', '🌾 글루텐', '🥚 달걀'];
const DISEASES = ['💉 당뇨', '❤️ 고혈압', '🫀 고지혈증', '없음'];
const DIET_STYLES = [
    {key: 'vegetarian', label: '🥗 채식'},
    {key: 'normal', label: '🍖 일반'},
    {key: 'keto', label: '🥩 키토'},
] as const;

export function HealthInfoScreen({navigation}: Props) {
    const [allergies, setAllergies] = useState<string[]>([]);
    const [diseases, setDiseases] = useState<string[]>([]);
    const [dietStyle, setDietStyle] = useState<'vegetarian' | 'normal' | 'keto'>('normal');

    const toggle = (arr: string[], setArr: (v: string[]) => void, item: string) => {
        setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
    };

    const hasDiabetes = diseases.includes('💉 당뇨');

    return (
        <SafeAreaView style={s.container}>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 16}}>
                    <View style={s.dots}>
                        <View style={[s.dot, s.dotOn]}/>
                        <View style={[s.dot, s.dotOn]}/>
                        <View style={s.dot}/>
                    </View>
                    <Text style={s.title}>건강 정보</Text>
                    <Text style={s.subtitle}>해당되는 항목을 모두 선택해주세요</Text>

                    <Text style={s.label}>알레르기</Text>
                    <View style={s.chipRow}>
                        {ALLERGIES.map((item) => (
                            <TouchableOpacity key={item} style={[s.chip, allergies.includes(item) && s.chipOn]} onPress={() => toggle(allergies, setAllergies, item)}>
                                <Text style={[s.chipText, allergies.includes(item) && s.chipTextOn]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>기저 질환</Text>
                    <View style={s.chipRow}>
                        {DISEASES.map((item) => (
                            <TouchableOpacity key={item} style={[s.chip, diseases.includes(item) && s.chipOn]} onPress={() => toggle(diseases, setDiseases, item)}>
                                <Text style={[s.chipText, diseases.includes(item) && s.chipTextOn]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>식이 스타일</Text>
                    <View style={s.chipRow}>
                        {DIET_STYLES.map((item) => (
                            <TouchableOpacity key={item.key} style={[s.chip, dietStyle === item.key && s.chipOn]} onPress={() => setDietStyle(item.key)}>
                                <Text style={[s.chipText, dietStyle === item.key && s.chipTextOn]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {hasDiabetes && (
                        <View style={s.warningCard}>
                            <Text style={s.warningTitle}>⚠️ 당뇨 맞춤 설정 활성화</Text>
                            <Text style={s.warningText}>혈당 지수(GI)가 낮은 식재료를 우선 추천합니다</Text>
                        </View>
                    )}

                </ScrollView>
                <View style={s.footer}>
                    <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate('Preference')}>
                        <Text style={s.primaryBtnText}>다음 →</Text>
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
    subtitle: {fontSize: 12, color: colors.sub, marginBottom: 18},
    label: {fontSize: 10, color: colors.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '500'},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16},
    chip: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border},
    chipOn: {backgroundColor: 'rgba(184,255,78,0.15)', borderColor: colors.accent},
    chipText: {fontSize: 11, fontWeight: '500', color: colors.sub},
    chipTextOn: {color: colors.accent},
    warningCard: {
        backgroundColor: 'rgba(255,107,74,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,107,74,0.2)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    warningTitle: {fontSize: 11, color: colors.accent2, fontWeight: '500', marginBottom: 3},
    warningText: {fontSize: 11, color: colors.sub},
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
