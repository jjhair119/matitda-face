import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {useAuthStore} from '../../store/authStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SocialLogin'>;

export function SocialLoginScreen({navigation}: Props) {
    const setLoggedIn = useAuthStore((s) => s.setLoggedIn);

    const handleKakao = () => {
        setLoggedIn(true);
        navigation.navigate('BasicInfo');
    };

    const handleGoogle = () => {
        setLoggedIn(true);
        navigation.navigate('BasicInfo');
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.hero}>
                <Text style={s.logo}>맛잇-다</Text>
                <Text style={s.sub}>AI 식단 관리 플랫폼</Text>
            </View>
            <View style={s.buttons}>
                <TouchableOpacity style={s.kakaoBtn} onPress={handleKakao}>
                    <Text style={s.kakaoBtnText}>💛 카카오로 시작하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.googleBtn} onPress={handleGoogle}>
                    <Text style={s.googleBtnText}>🔵 Google로 시작하기</Text>
                </TouchableOpacity>
            </View>
            <Text style={s.terms}>
                소셜 계정으로 가입하면 이용약관 및{'\n'}개인정보처리방침에 동의한 것으로 간주합니다
            </Text>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24},
    hero: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    logo: {fontSize: 36, fontWeight: '700', color: colors.accent, letterSpacing: -0.5},
    sub: {fontSize: 12, color: colors.sub, marginTop: 6},
    buttons: {gap: 10, marginBottom: 24},
    kakaoBtn: {
        backgroundColor: '#FEE500',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    kakaoBtnText: {fontSize: 14, fontWeight: '700', color: '#3C1E1E'},
    googleBtn: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    googleBtnText: {fontSize: 14, fontWeight: '700', color: '#333'},
    terms: {textAlign: 'center', fontSize: 10, color: colors.sub, lineHeight: 17, marginBottom: 16},
});
