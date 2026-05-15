import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../theme';

export function MyPageScreen() {
    return (
        <SafeAreaView style={s.container}>
            <View style={s.center}>
                <Text style={s.icon}>👤</Text>
                <Text style={s.text}>마이</Text>
                <Text style={s.sub}>준비 중입니다</Text>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    icon: {fontSize: 40, marginBottom: 8},
    text: {fontSize: 18, fontWeight: '700', color: colors.text},
    sub: {fontSize: 12, color: colors.sub, marginTop: 4},
});
