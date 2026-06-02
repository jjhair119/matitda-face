import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, TextInput} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {useAuthStore, UserProfile} from '../../store/authStore';
import {saveBasicInfo, saveHealthInfo, savePreferences} from '../../api/onboarding';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Preference'>;

const PRESET: Record<string, string[]> = {
    carb: ['🍠 고구마', '🌾 현미', '🍞 통밀빵', '🫘 콩류', '🌽 옥수수', '🥔 감자'],
    protein: ['🍗 닭가슴살', '🥩 소고기', '🐟 생선', '🥚 달걀', '🫘 두부', '🍤 새우'],
    fat: ['🥑 아보카도', '🥜 견과류', '🫒 올리브오일', '🐟 연어', '🧀 치즈'],
};

const SECTION_LABELS: Record<string, string> = {
    carb: '🍚 탄수화물',
    protein: '🍗 단백질',
    fat: '🥑 지방',
};

const GOALS = [
    {key: 'lose', label: '🔥 체중 감량'},
    {key: 'maintain', label: '⚖️ 체중 유지'},
    {key: 'gain', label: '💪 근육 증가'},
] as const;

function useIngredientSection(presetKey: string) {
    const [selected, setSelected] = useState<string[]>([]);
    const [custom, setCustom] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);

    const toggle = (item: string) => {
        setSelected((prev) =>
            prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
        );
    };

    const removeCustom = (item: string) => {
        setCustom((prev) => prev.filter((x) => x !== item));
        setSelected((prev) => prev.filter((x) => x !== item));
    };

    const addCustom = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        const allItems = [...PRESET[presetKey], ...custom];
        if (allItems.includes(trimmed)) {
            Alert.alert('이미 있는 항목입니다.');
            return;
        }
        setCustom((prev) => [...prev, trimmed]);
        setSelected((prev) => [...prev, trimmed]);
        setInputValue('');
        setShowInput(false);
    };

    return {selected, custom, inputValue, setInputValue, showInput, setShowInput, toggle, removeCustom, addCustom};
}

export function PreferenceScreen({}: Props) {
    const {draftProfile, setDraftProfile, setUser, setOnboarded} = useAuthStore();

    const carb = useIngredientSection('carb');
    const protein = useIngredientSection('protein');
    const fat = useIngredientSection('fat');

    const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain' | null>(null);
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);

    const allSelected = [...carb.selected, ...protein.selected, ...fat.selected];

    const handleComplete = async () => {
        setTouched(true);
        if (!goal || loading) return;
        setLoading(true);
        try {
            const finalDraft = {...draftProfile, preferredIngredients: allSelected, dietGoal: goal!};

            const activityMap = {low: 'low', normal: 'medium', high: 'high'} as const;
            const dietStyleMap = {normal: '일반', vegetarian: '채식', keto: '키토'} as const;
            const dietGoalMap = {lose: '다이어트', maintain: '체중 유지', gain: '근육 증가'} as const;

            await saveBasicInfo({
                nickname: finalDraft.nickname ?? '',
                age: finalDraft.age ?? 0,
                gender: finalDraft.gender ?? 'F',
                height_cm: finalDraft.height ?? 0,
                weight_kg: finalDraft.weight ?? 0,
                activity_level: activityMap[finalDraft.activityLevel ?? 'normal'],
                diet_goal: dietGoalMap[goal!],
            });

            await saveHealthInfo({
                allergies: finalDraft.allergies ?? [],
                diseases: finalDraft.diseases ?? [],
                diet_style: dietStyleMap[finalDraft.dietStyle ?? 'normal'],
            });

            await savePreferences(
                allSelected.map((name) => ({
                    ingredient_name: name.replace(/^[\p{Emoji}\s]+/u, '').trim(),
                    category: 'general',
                    preference: 'like' as const,
                })),
            );

            const profile: UserProfile = {
                id: finalDraft.id ?? `user_${Date.now()}`,
                nickname: finalDraft.nickname ?? '',
                age: finalDraft.age ?? 0,
                gender: finalDraft.gender ?? 'F',
                height: finalDraft.height ?? 0,
                weight: finalDraft.weight ?? 0,
                activityLevel: finalDraft.activityLevel ?? 'normal',
                allergies: finalDraft.allergies ?? [],
                diseases: finalDraft.diseases ?? [],
                dietStyle: finalDraft.dietStyle ?? 'normal',
                preferredIngredients: allSelected,
                dietGoal: goal!,
                tdee: finalDraft.tdee ?? 1800,
            };

            setDraftProfile({preferredIngredients: allSelected, dietGoal: goal});
            setUser(profile);
            setOnboarded(true);
        } catch {
            Alert.alert('오류', '설정 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
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
                    <Text style={s.subtitle}>좋아하는 재료를 골라주세요</Text>

                    {(['carb', 'protein', 'fat'] as const).map((key) => {
                        const sec = {carb, protein, fat}[key];
                        return (
                            <View key={key}>
                                <Text style={s.label}>{SECTION_LABELS[key]}</Text>
                                <View style={s.chipRow}>
                                    {PRESET[key].map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            style={[s.chip, sec.selected.includes(item) && s.chipOn]}
                                            onPress={() => sec.toggle(item)}
                                        >
                                            <Text style={[s.chipText, sec.selected.includes(item) && s.chipTextOn]}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    {sec.custom.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            style={[s.chip, s.chipOn]}
                                            onPress={() => sec.removeCustom(item)}
                                        >
                                            <Text style={[s.chipText, s.chipTextOn]}>{item} ×</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        style={[s.chip, s.chipAdd]}
                                        onPress={() => sec.setShowInput(!sec.showInput)}
                                    >
                                        <Text style={s.chipAddText}>+ 직접 입력</Text>
                                    </TouchableOpacity>
                                </View>
                                {sec.showInput && (
                                    <View style={s.customInputRow}>
                                        <TextInput
                                            style={s.customInput}
                                            value={sec.inputValue}
                                            onChangeText={sec.setInputValue}
                                            placeholder="재료명 입력"
                                            placeholderTextColor={colors.sub}
                                            autoFocus
                                            onSubmitEditing={sec.addCustom}
                                            returnKeyType="done"
                                        />
                                        <TouchableOpacity style={s.customInputBtn} onPress={sec.addCustom}>
                                            <Text style={s.customInputBtnText}>추가</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    <Text style={[s.label, touched && !goal && s.labelError]}>
                        식단 목표{touched && !goal ? '  ← 선택해주세요' : ''}
                    </Text>
                    <View style={s.chipRow}>
                        {GOALS.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[s.chip, goal === item.key && s.chipOn]}
                                onPress={() => setGoal(item.key)}
                            >
                                <Text style={[s.chipText, goal === item.key && s.chipTextOn]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <View style={s.footer}>
                    <TouchableOpacity style={[s.primaryBtn, (!goal || loading) && s.primaryBtnDisabled]} onPress={handleComplete} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={colors.bg}/>
                        ) : (
                            <Text style={s.primaryBtnText}>설정 완료 →</Text>
                        )}
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
    chipAdd: {borderColor: colors.border2, borderStyle: 'dashed'},
    chipText: {fontSize: 11, fontWeight: '500', color: colors.sub},
    chipTextOn: {color: colors.accent},
    chipAddText: {fontSize: 11, fontWeight: '500', color: colors.sub},
    customInputRow: {flexDirection: 'row', gap: 8, marginTop: -8, marginBottom: 16},
    customInput: {
        flex: 1,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 10,
        fontSize: 13,
        color: colors.text,
    },
    customInputBtn: {
        backgroundColor: colors.accent,
        borderRadius: 10,
        paddingHorizontal: 14,
        justifyContent: 'center',
    },
    customInputBtnText: {fontSize: 13, fontWeight: '700', color: colors.bg},
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.bg,
    },
    labelError: {color: colors.accent2},
    primaryBtn: {backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: 'center'},
    primaryBtnDisabled: {opacity: 0.45},
    primaryBtnText: {fontSize: 14, fontWeight: '700', color: colors.bg},
});
