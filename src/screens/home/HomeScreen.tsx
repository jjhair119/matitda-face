import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';

export function HomeScreen() {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView style={s.scroll}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>안녕하세요, 지민님 👋</Text>
            <Text style={s.greetingSub}>오늘도 건강한 하루!</Text>
          </View>
          <View style={s.avatar}>
            <Text>🙂</Text>
          </View>
        </View>

        <View style={s.calorieCard}>
          <Text style={s.calorieLabel}>오늘 섭취 칼로리</Text>
          <Text style={s.calorieValue}>1,312 <Text style={s.calorieUnit}>/ 1,820 kcal</Text></Text>
        </View>

        <Text style={s.sectionTitle}>오늘 식단</Text>
        {['아침', '점심', '저녁', '간식'].map((meal) => (
          <View key={meal} style={s.mealCard}>
            <Text style={s.mealTitle}>{meal}</Text>
            <Text style={s.mealEmpty}>+ 식사 추가</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  greeting: { fontSize: 16, fontWeight: '700', color: colors.text },
  greetingSub: { fontSize: 11, color: colors.sub },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  calorieCard: { backgroundColor: colors.surface2, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  calorieLabel: { fontSize: 11, color: colors.sub, marginBottom: 4 },
  calorieValue: { fontSize: 22, fontWeight: '700', color: colors.accent },
  calorieUnit: { fontSize: 13, fontWeight: '400', color: colors.sub },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  mealCard: { backgroundColor: colors.surface2, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  mealEmpty: { fontSize: 12, color: colors.sub },
});
