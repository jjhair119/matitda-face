import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {useAuthStore} from '../../store/authStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BasicInfo'>;

const ACTIVITY_LEVELS = [
    {key: 'low', label: '🛋️ 적음'},
    {key: 'normal', label: '🚶 보통'},
    {key: 'high', label: '🏃 많음'},
] as const;

function calcTdee(
    height: string,
    weight: string,
    age: string,
    gender: 'F' | 'M',
    activity: 'low' | 'normal' | 'high',
): number | null {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    if (!h || !w || !a || h < 100 || w < 20 || a < 1) return null;
    const bmr =
        gender === 'F'
            ? 447.593 + 9.247 * w + 3.098 * h - 4.33 * a
            : 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    const mult = activity === 'low' ? 1.2 : activity === 'normal' ? 1.375 : 1.55;
    return Math.round(bmr * mult);
}

export function BasicInfoScreen({navigation}: Props) {
    const setDraftProfile = useAuthStore((s) => s.setDraftProfile);

    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'F' | 'M'>('F');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [activity, setActivity] = useState<'low' | 'normal' | 'high'>('normal');
    const [touched, setTouched] = useState(false);

    const tdee = calcTdee(height, weight, age, gender, activity);
    const isValid =
        nickname.trim().length > 0 &&
        parseFloat(age) >= 1 &&
        parseFloat(height) >= 100 &&
        parseFloat(weight) >= 20 &&
        tdee !== null;

    const handleNext = () => {
        setTouched(true);
        if (!isValid) return;
        setDraftProfile({
            nickname: nickname.trim(),
            age: parseInt(age),
            gender,
            height: parseFloat(height),
            weight: parseFloat(weight),
            activityLevel: activity,
            tdee: tdee!,
        });
        navigation.navigate('HealthInfo');
    };

    const showError = touched && !isValid;

    return (
        <SafeAreaView style={s.container}>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 16}}>
                    <View style={s.dots}>
                        <View style={[s.dot, s.dotOn]}/>
                        <View style={s.dot}/>
                        <View style={s.dot}/>
                    </View>
                    <Text style={s.title}>기본 정보</Text>
                    <Text style={s.subtitle}>정확한 영양 분석을 위해 입력해주세요</Text>

                    <Text style={s.label}>닉네임</Text>
                    <TextInput
                        style={[s.input, showError && !nickname.trim() && s.inputError]}
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="나의 닉네임"
                        placeholderTextColor={colors.sub}
                    />

                    <View style={s.row}>
                        <View style={{flex: 1}}>
                            <Text style={s.label}>나이</Text>
                            <TextInput
                                style={[s.input, showError && !parseFloat(age) && s.inputError]}
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                                placeholder="26"
                                placeholderTextColor={colors.sub}
                            />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={s.label}>성별</Text>
                            <View style={s.genderRow}>
                                <TouchableOpacity style={[s.chip, gender === 'F' && s.chipOn]} onPress={() => setGender('F')}>
                                    <Text style={[s.chipText, gender === 'F' && s.chipTextOn]}>여</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.chip, gender === 'M' && s.chipOn]} onPress={() => setGender('M')}>
                                    <Text style={[s.chipText, gender === 'M' && s.chipTextOn]}>남</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={s.row}>
                        <View style={{flex: 1}}>
                            <Text style={s.label}>키 (cm)</Text>
                            <TextInput
                                style={[s.input, showError && !parseFloat(height) && s.inputError]}
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="numeric"
                                placeholder="163"
                                placeholderTextColor={colors.sub}
                            />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={s.label}>몸무게 (kg)</Text>
                            <TextInput
                                style={[s.input, showError && !parseFloat(weight) && s.inputError]}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                placeholder="55"
                                placeholderTextColor={colors.sub}
                            />
                        </View>
                    </View>

                    <Text style={s.label}>활동량</Text>
                    <View style={s.chipRow}>
                        {ACTIVITY_LEVELS.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[s.chip, activity === item.key && s.chipOn]}
                                onPress={() => setActivity(item.key)}
                            >
                                <Text style={[s.chipText, activity === item.key && s.chipTextOn]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {tdee && (
                        <View style={s.tdeeCard}>
                            <Text style={s.tdeeLabel}>하루 권장 칼로리 (TDEE)</Text>
                            <Text style={s.tdeeValue}>
                                {tdee.toLocaleString()} <Text style={s.tdeeUnit}>kcal</Text>
                            </Text>
                        </View>
                    )}

                    {showError && (
                        <Text style={s.errorText}>모든 항목을 올바르게 입력해주세요</Text>
                    )}
                </ScrollView>

                <View style={s.footer}>
                    <TouchableOpacity style={[s.primaryBtn, !isValid && s.primaryBtnDisabled]} onPress={handleNext}>
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
    input: {
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 11,
        fontSize: 13,
        color: colors.text,
        marginBottom: 10,
    },
    inputError: {borderColor: colors.accent2},
    row: {flexDirection: 'row', gap: 8},
    genderRow: {flexDirection: 'row', gap: 6, marginBottom: 10},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16},
    chip: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border},
    chipOn: {backgroundColor: 'rgba(184,255,78,0.15)', borderColor: colors.accent},
    chipText: {fontSize: 11, fontWeight: '500', color: colors.sub},
    chipTextOn: {color: colors.accent},
    tdeeCard: {
        backgroundColor: 'rgba(184,255,78,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.2)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    tdeeLabel: {fontSize: 11, color: colors.sub},
    tdeeValue: {fontSize: 24, fontWeight: '700', color: colors.accent, marginTop: 4},
    tdeeUnit: {fontSize: 12, fontWeight: '400'},
    errorText: {fontSize: 11, color: colors.accent2, textAlign: 'center', marginBottom: 8},
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.bg,
    },
    primaryBtn: {backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: 'center'},
    primaryBtnDisabled: {opacity: 0.45},
    primaryBtnText: {fontSize: 14, fontWeight: '700', color: colors.bg},
});
