import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {useAuthStore} from '../../store/authStore';
import {loginWithDevToken} from '../../api/auth';
import {saveToken} from '../../api/client';
import {colors} from '../../theme';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SocialLogin'>;

const SERVER_URL = 'http://localhost:3000';

export function SocialLoginScreen({navigation}: Props) {
    const {setLoggedIn, setOnboarded, setDraftProfile} = useAuthStore();
    const [loading, setLoading] = useState<'kakao' | 'dev' | null>(null);

    const handleKakaoLogin = async () => {
        if (loading) return;
        setLoading('kakao');
        try {
            // 서버의 /auth/kakao/login → 카카오 OAuth → /auth/kakao/callback → /auth/success?token=...&isNewUser=...
            const loginUrl = `${SERVER_URL}/auth/kakao/login`;
            const successUrl = `${SERVER_URL}/auth/success`;

            const result = await WebBrowser.openAuthSessionAsync(loginUrl, successUrl);

            if (result.type !== 'success') {
                return;
            }

            // 서버가 리다이렉트한 URL: http://localhost:3000/auth/success?token=JWT&isNewUser=true
            const url = new URL(result.url);
            const token = url.searchParams.get('token');
            const isNewUser = url.searchParams.get('isNewUser') === 'true';

            if (!token) throw new Error('토큰 없음');

            await saveToken(token);
            setLoggedIn(true);

            if (isNewUser) {
                navigation.navigate('BasicInfo');
            } else {
                setOnboarded(true);
            }
        } catch (e) {
            Alert.alert('카카오 로그인 실패', '잠시 후 다시 시도해주세요.');
        } finally {
            setLoading(null);
        }
    };

    const handleDevLogin = async () => {
        if (loading) return;
        setLoading('dev');
        try {
            const data = await loginWithDevToken('테스트유저');
            setDraftProfile({id: data.userId});
            setLoggedIn(true);
            navigation.navigate('BasicInfo');
        } catch {
            Alert.alert('개발 로그인 실패', '서버 연결을 확인해주세요.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.hero}>
                <Text style={s.logo}>맛잇-다</Text>
                <Text style={s.sub}>AI 식단 관리 플랫폼</Text>
            </View>
            <View style={s.buttons}>
                <TouchableOpacity
                    style={[s.kakaoBtn, loading === 'kakao' && s.btnLoading]}
                    onPress={handleKakaoLogin}
                    disabled={!!loading}
                >
                    {loading === 'kakao' ? (
                        <ActivityIndicator color="#000000"/>
                    ) : (
                        <View style={s.kakaoBtnInner}>
                            <Text style={s.kakaoSymbol}>⬤</Text>
                            <Text style={s.kakaoBtnText}>카카오로 시작하기</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[s.devBtn, loading === 'dev' && s.btnLoading]}
                    onPress={handleDevLogin}
                    disabled={!!loading}
                >
                    {loading === 'dev' ? (
                        <ActivityIndicator color={colors.accent}/>
                    ) : (
                        <Text style={s.devBtnText}>🛠 개발자 로그인 (테스트)</Text>
                    )}
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
    kakaoBtn: {backgroundColor: '#FEE500', borderRadius: 12, padding: 14, alignItems: 'center'},
    kakaoBtnInner: {flexDirection: 'row', alignItems: 'center', gap: 8},
    kakaoSymbol: {fontSize: 16, color: '#000000'},
    kakaoBtnText: {fontSize: 14, fontWeight: '700', color: 'rgba(0,0,0,0.85)'},
    devBtn: {backgroundColor: colors.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.accent},
    devBtnText: {fontSize: 14, fontWeight: '700', color: colors.accent},
    btnLoading: {opacity: 0.7},
    terms: {textAlign: 'center', fontSize: 10, color: colors.sub, lineHeight: 17, marginBottom: 16},
});
