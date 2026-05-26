import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {useAuthStore} from '../../store/authStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'HealthInfo'>;

const ALLERGIES = ['🥜 견과류', '🦐 갑각류', '🥛 유제품', '🌾 글루텐', '🥚 달걀'];
const DISEASES = ['💉 당뇨', '❤️ 고혈압', '🫀 고지혈증'];
const DIET_STYLES = [
    {key: 'vegetarian', label: '🥗 채식'},
    {key: 'normal', label: '🍖 일반'},
    {key: 'keto', label: '🥩 키토'},
] as const;

type DietStyle = 'vegetarian' | 'normal' | 'keto';

export function HealthInfoScreen({navigation}: Props) {
    const setDraftProfile = useAuthStore((s) => s.setDraftProfile);

    const [allergies, setAllergies] = useState<string[]>([]);
    const [allergyInput, setAllergyInput] = useState('');
    const [showAllergyInput, setShowAllergyInput] = useState(false);

    const [diseases, setDiseases] = useState<string[]>([]);
    const [diseaseInput, setDiseaseInput] = useState('');
    const [showDiseaseInput, setShowDiseaseInput] = useState(false);

    const [dietStyle, setDietStyle] = useState<DietStyle | null>(null);

    const toggleMulti = (arr: string[], setArr: (v: string[]) => void, item: string) => {
        setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
    };

    const addCustomAllergy = () => {
        const trimmed = allergyInput.trim();
        if (!trimmed) return;
        if (allergies.includes(trimmed)) {
            Alert.alert('이미 추가된 항목입니다.');
            return;
        }
        setAllergies([...allergies, trimmed]);
        setAllergyInput('');
        setShowAllergyInput(false);
    };

    const addCustomDisease = () => {
        const trimmed = diseaseInput.trim();
        if (!trimmed) return;
        if (diseases.includes(trimmed)) {
            Alert.alert('이미 추가된 항목입니다.');
            return;
        }
        setDiseases([...diseases, trimmed]);
        setDiseaseInput('');
        setShowDiseaseInput(false);
    };

    const hasDiabetes = diseases.includes('💉 당뇨');
    const [touched, setTouched] = useState(false);

    const handleNext = () => {
        setTouched(true);
        if (!dietStyle) return;
        setDraftProfile({allergies, diseases, dietStyle});
        navigation.navigate('Preference');
    };

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

                    {/* 알레르기 */}
                    <Text style={s.label}>알레르기</Text>
                    <View style={s.chipRow}>
                        {ALLERGIES.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[s.chip, allergies.includes(item) && s.chipOn]}
                                onPress={() => toggleMulti(allergies, setAllergies, item)}
                            >
                                <Text style={[s.chipText, allergies.includes(item) && s.chipTextOn]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        {allergies.filter((a) => !ALLERGIES.includes(a)).map((custom) => (
                            <TouchableOpacity
                                key={custom}
                                style={[s.chip, s.chipOn]}
                                onPress={() => setAllergies(allergies.filter((x) => x !== custom))}
                            >
                                <Text style={[s.chipText, s.chipTextOn]}>{custom} ×</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[s.chip, s.chipAdd]}
                            onPress={() => setShowAllergyInput(!showAllergyInput)}
                        >
                            <Text style={s.chipAddText}>+ 직접 입력</Text>
                        </TouchableOpacity>
                    </View>
                    {showAllergyInput && (
                        <View style={s.customInputRow}>
                            <TextInput
                                style={s.customInput}
                                value={allergyInput}
                                onChangeText={setAllergyInput}
                                placeholder="예: 복숭아, 키위"
                                placeholderTextColor={colors.sub}
                                autoFocus
                                onSubmitEditing={addCustomAllergy}
                                returnKeyType="done"
                            />
                            <TouchableOpacity style={s.customInputBtn} onPress={addCustomAllergy}>
                                <Text style={s.customInputBtnText}>추가</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 기저 질환 */}
                    <Text style={s.label}>기저 질환</Text>
                    <View style={s.chipRow}>
                        {DISEASES.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[s.chip, diseases.includes(item) && s.chipOn]}
                                onPress={() => toggleMulti(diseases, setDiseases, item)}
                            >
                                <Text style={[s.chipText, diseases.includes(item) && s.chipTextOn]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        {diseases.filter((d) => !DISEASES.includes(d)).map((custom) => (
                            <TouchableOpacity
                                key={custom}
                                style={[s.chip, s.chipOn]}
                                onPress={() => setDiseases(diseases.filter((x) => x !== custom))}
                            >
                                <Text style={[s.chipText, s.chipTextOn]}>{custom} ×</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[s.chip, s.chipAdd]}
                            onPress={() => setShowDiseaseInput(!showDiseaseInput)}
                        >
                            <Text style={s.chipAddText}>+ 직접 입력</Text>
                        </TouchableOpacity>
                    </View>
                    {showDiseaseInput && (
                        <View style={s.customInputRow}>
                            <TextInput
                                style={s.customInput}
                                value={diseaseInput}
                                onChangeText={setDiseaseInput}
                                placeholder="예: 신장질환, 갑상선"
                                placeholderTextColor={colors.sub}
                                autoFocus
                                onSubmitEditing={addCustomDisease}
                                returnKeyType="done"
                            />
                            <TouchableOpacity style={s.customInputBtn} onPress={addCustomDisease}>
                                <Text style={s.customInputBtnText}>추가</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {hasDiabetes && (
                        <View style={s.warningCard}>
                            <Text style={s.warningTitle}>⚠️ 당뇨 맞춤 설정 활성화</Text>
                            <Text style={s.warningText}>혈당 지수(GI)가 낮은 식재료를 우선 추천합니다</Text>
                        </View>
                    )}

                    {/* 식이 스타일 */}
                    <Text style={[s.label, touched && !dietStyle && s.labelError]}>
                        식이 스타일{touched && !dietStyle ? '  ← 선택해주세요' : ''}
                    </Text>
                    <View style={s.chipRow}>
                        {DIET_STYLES.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[s.chip, dietStyle === item.key && s.chipOn]}
                                onPress={() => setDietStyle(dietStyle === item.key ? null : item.key)}
                            >
                                <Text style={[s.chipText, dietStyle === item.key && s.chipTextOn]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <View style={s.footer}>
                    <TouchableOpacity style={[s.primaryBtn, !dietStyle && s.primaryBtnDisabled]} onPress={handleNext}>
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
    chipAdd: {borderColor: colors.border2, borderStyle: 'dashed'},
    chipText: {fontSize: 11, fontWeight: '500', color: colors.sub},
    chipTextOn: {color: colors.accent},
    chipAddText: {fontSize: 11, fontWeight: '500', color: colors.sub},
    customInputRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: -8,
        marginBottom: 16,
    },
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
    labelError: {color: colors.accent2},
    primaryBtn: {backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: 'center'},
    primaryBtnDisabled: {opacity: 0.45},
    primaryBtnText: {fontSize: 14, fontWeight: '700', color: colors.bg},
});
