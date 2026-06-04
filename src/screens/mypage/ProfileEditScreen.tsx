import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MyPageStackParamList} from '../../navigation/MyPageStackNavigator';
import {useAuthStore} from '../../store/authStore';
import {saveBasicInfo, saveHealthInfo} from '../../api/onboarding';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MyPageStackParamList, 'ProfileEdit'>;

const ALLERGIES = ['🥜 견과류', '🦐 갑각류', '🥛 유제품', '🌾 글루텐', '🥚 달걀'];
const DISEASES = ['💉 당뇨', '❤️ 고혈압', '🫀 고지혈증'];
const DIET_STYLES = [
    {key: 'vegetarian' as const, label: '🥗 채식'},
    {key: 'normal' as const, label: '🍖 일반'},
    {key: 'keto' as const, label: '🥩 키토'},
];
const ACTIVITY_LEVELS = [
    {key: 'low' as const, label: '🛋️ 적음'},
    {key: 'normal' as const, label: '🚶 보통'},
    {key: 'high' as const, label: '🏃 많음'},
];
const GOALS = [
    {key: 'lose' as const, label: '🔥 체중 감량'},
    {key: 'maintain' as const, label: '⚖️ 체중 유지'},
    {key: 'gain' as const, label: '💪 근육 증가'},
];

function calcTdee(
    h: number,
    w: number,
    a: number,
    gender: 'M' | 'F',
    activity: 'low' | 'normal' | 'high',
): number {
    if (!h || !w || !a || h < 100 || w < 20 || a < 1) return 0;
    const bmr =
        gender === 'F'
            ? 447.593 + 9.247 * w + 3.098 * h - 4.33 * a
            : 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    const mult = activity === 'low' ? 1.2 : activity === 'normal' ? 1.375 : 1.55;
    return Math.round(bmr * mult);
}

const DIET_STYLE_MAP: Record<string, '일반' | '채식' | '키토'> = {
    normal: '일반',
    vegetarian: '채식',
    keto: '키토',
};

const stripEmoji = (s: string) => s.replace(/^[\p{Emoji}\s]+/u, '').trim();

export function ProfileEditScreen({navigation}: Props) {
    const user = useAuthStore((s) => s.user);
    const updateUser = useAuthStore((s) => s.updateUser);

    const [nickname, setNickname] = useState(user?.nickname ?? '');
    const [age, setAge] = useState(user?.age?.toString() ?? '');
    const [gender, setGender] = useState<'M' | 'F'>(user?.gender ?? 'F');
    const [height, setHeight] = useState(user?.height?.toString() ?? '');
    const [weight, setWeight] = useState(user?.weight?.toString() ?? '');
    const [activity, setActivity] = useState<'low' | 'normal' | 'high'>(user?.activityLevel ?? 'normal');
    const [allergies, setAllergies] = useState<string[]>(user?.allergies ?? []);
    const [diseases, setDiseases] = useState<string[]>(user?.diseases ?? []);
    const [dietStyle, setDietStyle] = useState<'vegetarian' | 'normal' | 'keto'>(user?.dietStyle ?? 'normal');
    const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>(user?.dietGoal ?? 'lose');
    const [saving, setSaving] = useState(false);

    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age, 10);
    const tdee = calcTdee(h, w, a, gender, activity);

    const toggleMulti = (arr: string[], setArr: (v: string[]) => void, item: string) => {
        setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
    };

    const handleSave = async () => {
        if (!nickname.trim()) {
            Alert.alert('닉네임을 입력해주세요');
            return;
        }
        setSaving(true);
        try {
            const actLevel = activity === 'normal' ? 'medium' : activity as 'low' | 'high';
            await saveBasicInfo({
                nickname: nickname.trim(),
                age: a > 0 ? a : user?.age ?? 20,
                gender,
                height_cm: h >= 100 ? h : user?.height ?? 160,
                weight_kg: w >= 20 ? w : user?.weight ?? 60,
                activity_level: actLevel,
                diet_goal: goal,
            });
            await saveHealthInfo({
                allergies: allergies.map(stripEmoji),
                diseases: diseases.map(stripEmoji),
                diet_style: DIET_STYLE_MAP[dietStyle],
            });
            updateUser({
                nickname: nickname.trim(),
                age: a > 0 ? a : user?.age,
                gender,
                height: h >= 100 ? h : user?.height,
                weight: w >= 20 ? w : user?.weight,
                activityLevel: activity,
                allergies,
                diseases,
                dietStyle,
                dietGoal: goal,
                tdee: tdee > 0 ? tdee : user?.tdee,
            });
            navigation.goBack();
        } catch {
            Alert.alert('저장 실패', '다시 시도해주세요');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBack}>
                    <Text style={s.headerBackText}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>정보 수정</Text>
                <TouchableOpacity onPress={handleSave} style={s.headerSaveBtn} disabled={saving}>
                    {saving
                        ? <ActivityIndicator size="small" color={colors.accent}/>
                        : <Text style={s.headerSaveText}>저장</Text>
                    }
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    style={s.scroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 40}}
                >
                    {/* 아바타 */}
                    <View style={s.avatarSection}>
                        <View style={s.avatar}>
                            <Text style={s.avatarEmoji}>🙂</Text>
                        </View>
                        <TouchableOpacity style={s.photoBtn}>
                            <Text style={s.photoBtnText}>사진 변경</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 기본 정보 */}
                    <Text style={s.sectionTitle}>기본 정보</Text>

                    <Text style={s.label}>닉네임</Text>
                    <TextInput
                        style={s.input}
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="닉네임"
                        placeholderTextColor={colors.sub}
                    />

                    <View style={s.row}>
                        <View style={{flex: 1}}>
                            <Text style={s.label}>나이</Text>
                            <TextInput
                                style={s.input}
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
                                <TouchableOpacity
                                    style={[s.chip, gender === 'F' && s.chipOn]}
                                    onPress={() => setGender('F')}
                                >
                                    <Text style={[s.chipText, gender === 'F' && s.chipTextOn]}>여</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[s.chip, gender === 'M' && s.chipOn]}
                                    onPress={() => setGender('M')}
                                >
                                    <Text style={[s.chipText, gender === 'M' && s.chipTextOn]}>남</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={s.row}>
                        <View style={{flex: 1}}>
                            <Text style={s.label}>키 (cm)</Text>
                            <TextInput
                                style={s.input}
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
                                style={s.input}
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
                                <Text style={[s.chipText, activity === item.key && s.chipTextOn]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {tdee > 0 && (
                        <View style={s.tdeeCard}>
                            <Text style={s.tdeeLabel}>하루 권장 칼로리 (TDEE)</Text>
                            <Text style={s.tdeeValue}>
                                {tdee.toLocaleString()}{' '}
                                <Text style={{fontSize: 12, fontWeight: '400'}}>kcal</Text>
                            </Text>
                        </View>
                    )}

                    {/* 건강 정보 */}
                    <Text style={s.sectionTitle}>건강 정보</Text>

                    <Text style={s.label}>알레르기</Text>
                    <View style={s.chipRow}>
                        {ALLERGIES.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[s.chip, allergies.includes(item) && s.chipOn]}
                                onPress={() => toggleMulti(allergies, setAllergies, item)}
                            >
                                <Text style={[s.chipText, allergies.includes(item) && s.chipTextOn]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.label}>기저 질환</Text>
                    <View style={s.chipRow}>
                        {DISEASES.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[s.chip, diseases.includes(item) && s.chipOn]}
                                onPress={() => toggleMulti(diseases, setDiseases, item)}
                            >
                                <Text style={[s.chipText, diseases.includes(item) && s.chipTextOn]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {diseases.includes('💉 당뇨') && (
                        <View style={s.warningCard}>
                            <Text style={s.warningTitle}>⚠️ 당뇨 맞춤 설정 활성화</Text>
                            <Text style={s.warningText}>혈당 지수(GI)가 낮은 식재료를 우선 추천합니다</Text>
                        </View>
                    )}

                    <Text style={s.label}>식이 스타일</Text>
                    <View style={s.chipRow}>
                        {DIET_STYLES.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[s.chip, dietStyle === item.key && s.chipOn]}
                                onPress={() => setDietStyle(item.key)}
                            >
                                <Text style={[s.chipText, dietStyle === item.key && s.chipTextOn]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 식단 목표 */}
                    <Text style={s.sectionTitle}>식단 목표</Text>
                    <View style={s.chipRow}>
                        {GOALS.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[s.chip, goal === item.key && s.chipOn]}
                                onPress={() => setGoal(item.key)}
                            >
                                <Text style={[s.chipText, goal === item.key && s.chipTextOn]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerBack: {padding: 4},
    headerBackText: {fontSize: 22, color: colors.text},
    headerTitle: {fontSize: 16, fontWeight: '600', color: colors.text},
    headerSaveBtn: {padding: 4},
    headerSaveText: {fontSize: 14, fontWeight: '600', color: colors.accent},

    scroll: {flex: 1, paddingHorizontal: 16},

    avatarSection: {alignItems: 'center', paddingVertical: 24, gap: 12},
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.teal,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {fontSize: 32},
    photoBtn: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border2,
    },
    photoBtnText: {fontSize: 12, color: colors.sub},

    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        marginTop: 20,
        marginBottom: 14,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    label: {
        fontSize: 10,
        color: colors.sub,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        fontWeight: '500',
    },
    input: {
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 11,
        fontSize: 13,
        color: colors.text,
        marginBottom: 12,
    },
    row: {flexDirection: 'row', gap: 8},
    genderRow: {flexDirection: 'row', gap: 6, marginBottom: 12},

    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16},
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
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
        marginBottom: 8,
    },
    tdeeLabel: {fontSize: 11, color: colors.sub},
    tdeeValue: {fontSize: 22, fontWeight: '700', color: colors.accent, marginTop: 4},

    warningCard: {
        backgroundColor: 'rgba(255,107,74,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,107,74,0.2)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        marginTop: -8,
    },
    warningTitle: {fontSize: 11, color: colors.accent2, fontWeight: '500', marginBottom: 3},
    warningText: {fontSize: 11, color: colors.sub},
});
