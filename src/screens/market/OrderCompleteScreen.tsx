import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonActions} from '@react-navigation/native';
import {MarketStackParamList} from '../../navigation/MarketStackNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<MarketStackParamList, 'OrderComplete'>;

function getNow(): string {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}

function getEstimatedTime(deliveryMinutes: number): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + deliveryMinutes + 5);
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}

export function OrderCompleteScreen({navigation, route}: Props) {
    const {earnedPoints, deliveryTime} = route.params;

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 60,
                friction: 5,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const orderNumber = `MAT-${Date.now().toString().slice(-6)}`;
    const estimatedTime = getEstimatedTime(deliveryTime);

    const goToMarket = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{name: 'MarketMain'}],
            }),
        );
    };

    return (
        <SafeAreaView style={s.container} edges={['top', 'bottom']}>
            <View style={s.body}>
                {/* 성공 아이콘 */}
                <Animated.View
                    style={[
                        s.successCircle,
                        {transform: [{scale: scaleAnim}]},
                    ]}
                >
                    <Text style={s.successIcon}>✅</Text>
                </Animated.View>

                <Animated.View style={[s.content, {opacity: fadeAnim}]}>
                    <Text style={s.title}>주문 완료!</Text>
                    <Text style={s.subtitle}>결제가 성공적으로 처리되었어요</Text>

                    {/* 주문 정보 카드 */}
                    <View style={s.infoCard}>
                        <View style={s.infoRow}>
                            <Text style={s.infoLabel}>주문 번호</Text>
                            <Text style={s.infoValue}>{orderNumber}</Text>
                        </View>
                        <View style={s.infoRow}>
                            <Text style={s.infoLabel}>주문 시간</Text>
                            <Text style={s.infoValue}>{getNow()}</Text>
                        </View>
                        <View style={s.infoRow}>
                            <Text style={s.infoLabel}>배달 예정</Text>
                            <Text style={[s.infoValue, {color: colors.accent}]}>
                                약 {deliveryTime}분 후 ({estimatedTime} 도착 예정)
                            </Text>
                        </View>
                    </View>

                    {/* 포인트 적립 배너 */}
                    {earnedPoints > 0 && (
                        <View style={s.pointBanner}>
                            <Text style={s.pointBannerTitle}>🎉 포인트 적립 완료</Text>
                            <Text style={s.pointBannerValue}>
                                +{earnedPoints.toLocaleString()} P
                            </Text>
                            <Text style={s.pointBannerSub}>
                                마이페이지에서 포인트를 확인해보세요
                            </Text>
                        </View>
                    )}

                    {/* 배달 현황 */}
                    <View style={s.trackCard}>
                        <Text style={s.trackTitle}>📦 배달 현황</Text>
                        <View style={s.trackSteps}>
                            {[
                                {label: '주문 접수', done: true},
                                {label: '상품 준비 중', done: true},
                                {label: '배달 출발', done: false},
                                {label: '배달 완료', done: false},
                            ].map((step, idx) => (
                                <View key={step.label} style={s.trackStep}>
                                    <View style={[s.trackDot, step.done && s.trackDotDone]}>
                                        {step.done && <Text style={s.trackDotText}>✓</Text>}
                                    </View>
                                    <Text style={[s.trackLabel, step.done && s.trackLabelDone]}>
                                        {step.label}
                                    </Text>
                                    {idx < 3 && (
                                        <View style={[s.trackLine, step.done && s.trackLineDone]}/>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </View>

            {/* 버튼 */}
            <View style={s.footer}>
                <TouchableOpacity style={s.continueBtn} onPress={goToMarket}>
                    <Text style={s.continueBtnText}>계속 쇼핑하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={s.homeBtn}
                    onPress={() => {
                        navigation.getParent()?.navigate('Home');
                    }}
                >
                    <Text style={s.homeBtnText}>홈으로</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    body: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20},

    successCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(184,255,78,0.12)',
        borderWidth: 2,
        borderColor: 'rgba(184,255,78,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    successIcon: {fontSize: 40},

    content: {width: '100%', gap: 14},

    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: colors.sub,
        textAlign: 'center',
        marginTop: -8,
    },

    infoCard: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {fontSize: 12, color: colors.sub},
    infoValue: {fontSize: 12, fontWeight: '600', color: colors.text},

    pointBanner: {
        backgroundColor: 'rgba(184,255,78,0.07)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.22)',
        padding: 14,
        alignItems: 'center',
        gap: 4,
    },
    pointBannerTitle: {fontSize: 12, color: colors.sub},
    pointBannerValue: {fontSize: 28, fontWeight: '700', color: colors.accent},
    pointBannerSub: {fontSize: 11, color: colors.sub},

    trackCard: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
    },
    trackTitle: {fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 14},
    trackSteps: {flexDirection: 'row', alignItems: 'flex-start'},
    trackStep: {flex: 1, alignItems: 'center'},
    trackDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.border,
        borderWidth: 1,
        borderColor: colors.border2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    trackDotDone: {backgroundColor: colors.accent, borderColor: colors.accent},
    trackDotText: {fontSize: 10, color: colors.bg, fontWeight: '700'},
    trackLabel: {fontSize: 9, color: colors.sub, textAlign: 'center'},
    trackLabelDone: {color: colors.accent, fontWeight: '600'},
    trackLine: {
        position: 'absolute',
        top: 10,
        left: '50%',
        right: '-50%',
        height: 2,
        backgroundColor: colors.border,
        zIndex: -1,
    },
    trackLineDone: {backgroundColor: colors.accent},

    footer: {
        paddingHorizontal: 16,
        paddingBottom: 28,
        paddingTop: 12,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    continueBtn: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    continueBtnText: {fontSize: 15, fontWeight: '700', color: colors.bg},
    homeBtn: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    homeBtnText: {fontSize: 14, fontWeight: '500', color: colors.text},
});
