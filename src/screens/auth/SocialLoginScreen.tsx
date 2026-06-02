import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {useAuthStore} from '../../store/authStore';
import {loginWithKakaoToken, loginWithDevToken} from '../../api/auth';
import {colors} from '../../theme';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SocialLogin'>;

const KAKAO_REST_API_KEY = '22146a4d2670af1f7c5b2037a55ad808';

export function SocialLoginScreen({navigation}: Props) {
    const {setLoggedIn, setDraftProfile} = useAuthStore();
    const [loading, setLoading] = useState<'kakao' | 'dev' | null>(null);

    const redirectUri = AuthSession.makeRedirectUri({scheme: 'matitda'});

    const handleKakaoLogin = async () => {
        if (loading) return;
        setLoading('kakao');
        try {
            const authUrl =
                `https://kauth.kakao.com/oauth/authorize` +
                `?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}`;

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

            if (result.type !== 'success') {
                return;
            }

            // 카카오에서 받은 code를 서버로 전달해 access_token 획득
            const url = new URL(result.url);
            const code = url.searchParams.get('code');
            if (!code) throw new Error('code 없음');

            // 서버의 /auth/kakao/callback 대신 직접 토큰 교환이 필요하면 여기서 처리
            // 현재 서버가 /auth/kakao (access_token 방식)을 사용하므로 중간 단계 필요
            // 임시: 서버 콜백 URL로 code 전달
            const tokenRes = await fetch(`http://localhost:3000/auth/kakao/callback?code=${code}`);
            const tokenData = await tokenRes.json();

            await loginWithKakaoToken(tokenData.access_token ?? tokenData.token);
            setDraftProfile({id: tokenData.user?.id});
            setLoggedIn(true);
            navigation.navigate('BasicInfo');
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
            Alert.alert('개발 로그인 실패', '서버가 실행 중인지 확인해주세요.');
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
