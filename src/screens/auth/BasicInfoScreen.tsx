import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BasicInfo'>;

const ACTIVITY_LEVELS = [
  { key: 'low', label: '🛋️ 적음' },
  { key: 'normal', label: '🚶 보통' },
  { key: 'high', label: '🏃 많음' },
] as const;

export function BasicInfoScreen({ navigation }: Props) {
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'F' | 'M'>('F');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<'low' | 'normal' | 'high'>('normal');

  const tdee = React.useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    if (!h || !w || !a) return null;
    const bmr = gender === 'F'
      ? 447.593 + 9.247 * w + 3.098 * h - 4.330 * a
      : 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    const mult = activity === 'low' ? 1.2 : activity === 'normal' ? 1.375 : 1.55;
    return Math.round(bmr * mult);
  }, [height, weight, age, gender, activity]);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.dots}>
          <View style={[s.dot, s.dotOn]} />
          <View style={s.dot} />
          <View style={s.dot} />
        </View>
        <Text style={s.title}>기본 정보</Text>
        <Text style={s.subtitle}>정확한 영양 분석을 위해 입력해주세요</Text>

        <Text style={s.label}>닉네임</Text>
        <TextInput style={s.input} value={nickname} onChangeText={setNickname} placeholder="나의 닉네임" placeholderTextColor={colors.sub} />

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>나이</Text>
            <TextInput style={s.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="26" placeholderTextColor={colors.sub} />
          </View>
          <View style={{ flex: 1 }}>
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
          <View style={{ flex: 1 }}>
            <Text style={s.label}>키 (cm)</Text>
            <TextInput style={s.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="163" placeholderTextColor={colors.sub} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>몸무게 (kg)</Text>
            <TextInput style={s.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="55" placeholderTextColor={colors.sub} />
          </View>
        </View>

        <Text style={s.label}>활동량</Text>
        <View style={s.chipRow}>
          {ACTIVITY_LEVELS.map((item) => (
            <TouchableOpacity key={item.key} style={[s.chip, activity === item.key && s.chipOn]} onPress={() => setActivity(item.key)}>
              <Text style={[s.chipText, activity === item.key && s.chipTextOn]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tdee && (
          <View style={s.tdeeCard}>
            <Text style={s.tdeeLabel}>하루 권장 칼로리 (TDEE)</Text>
            <Text style={s.tdeeValue}>{tdee.toLocaleString()} <Text style={s.tdeeUnit}>kcal</Text></Text>
          </View>
        )}

        <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate('HealthInfo')}>
          <Text style={s.primaryBtnText}>다음 →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1, paddingHorizontal: 20 },
  dots: { flexDirection: 'row', gap: 6, paddingVertical: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border2 },
  dotOn: { width: 18, borderRadius: 3, backgroundColor: colors.accent },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 12, color: colors.sub, marginBottom: 18 },
  label: { fontSize: 10, color: colors.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '500' },
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
  row: { flexDirection: 'row', gap: 8 },
  genderRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: 'rgba(184,255,78,0.15)',
    borderColor: colors.accent,
  },
  chipText: { fontSize: 11, fontWeight: '500', color: colors.sub },
  chipTextOn: { color: colors.accent },
  tdeeCard: {
    backgroundColor: 'rgba(184,255,78,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(184,255,78,0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  tdeeLabel: { fontSize: 11, color: colors.sub },
  tdeeValue: { fontSize: 24, fontWeight: '700', color: colors.accent, marginTop: 4 },
  tdeeUnit: { fontSize: 12, fontWeight: '400' },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: colors.bg },
});
