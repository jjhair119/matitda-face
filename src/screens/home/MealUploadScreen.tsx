import React, {useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {useMealStore} from '../../store/mealStore';
import {analyzeMealPhoto} from '../../api/meals';
import {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'MealUpload'>;

type Phase = 'info' | 'camera_empty' | 'camera_food' | 'analyzing' | 'result';

function MacroItem({label, value, unit, color}: {label: string; value: number; unit: string; color: string}) {
    return (
        <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 15, fontWeight: '700', color}}>{value}</Text>
            <Text style={{fontSize: 10, color: colors.sub}}>{unit}</Text>
            <Text style={{fontSize: 10, color: colors.sub}}>{label}</Text>
        </View>
    );
}

function getTodayDate(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MealUploadScreen({navigation, route}: Props) {
    const {mealId} = route.params;
    const meals = useMealStore((s) => s.meals);
    const updateMeal = useMealStore((s) => s.updateMeal);
    const meal = meals.find((m) => m.id === mealId)!;

    const [phase, setPhase] = useState<Phase>('info');
    const [emptyPhotoUri, setEmptyPhotoUri] = useState<string | null>(null);
    const [foodPhotoUri, setFoodPhotoUri] = useState<string | null>(null);
    const [result, setResult] = useState<{
        actualKcal: number;
        macros: {carb: number; protein: number; fat: number};
        score: number;
        foods: string[];
        feedback: string;
    } | null>(null);

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const handleStartCamera = async () => {
        if (!permission?.granted) {
            const res = await requestPermission();
            if (!res.granted) {
                Alert.alert('카메라 권한 필요', '설정에서 카메라 권한을 허용해주세요.');
                return;
            }
        }
        setPhase('camera_empty');
    };

    const handleCaptureEmpty = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({quality: 0.8});
            if (!photo) return;
            setEmptyPhotoUri(photo.uri);
            setPhase('camera_food');
        } catch {
            Alert.alert('촬영 실패', '다시 시도해주세요.');
        }
    };

    const handleCaptureFood = async () => {
        if (!cameraRef.current || !emptyPhotoUri) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({quality: 0.8});
            if (!photo) return;
            setFoodPhotoUri(photo.uri);
            setPhase('analyzing');

            const analysis = await analyzeMealPhoto({
                emptyPhotoUri,
                foodPhotoUri: photo.uri,
                mealType: mealId,
                mealDate: getTodayDate(),
            });

            setResult(analysis);
            setPhase('result');
        } catch (e: any) {
            Alert.alert('분석 실패', e?.response?.data?.message ?? '다시 시도해주세요.');
            setPhase('camera_food');
        }
    };

    const handleUpload = () => {
        if (!result) return;
        updateMeal(mealId, {
            actualKcal: result.actualKcal,
            macros: result.macros,
            score: result.score,
            photoUri: foodPhotoUri,
            aiFeedback: result.feedback,
        });
        navigation.goBack();
    };

    /* ── INFO ── */
    if (phase === 'info') {
        return (
            <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.backBtn}>← 뒤로</Text>
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>{meal.emoji} {meal.label} 기록</Text>
                    <View style={{width: 50}}/>
                </View>

                <View style={s.body}>
                    <View style={s.infoCard}>
                        <Text style={s.infoKcal}>{meal.expectedKcal} kcal</Text>
                        <Text style={s.infoLabel}>예정 칼로리</Text>
                    </View>

                    <View style={s.card}>
                        <Text style={s.cardLabel}>식재료</Text>
                        <Text style={s.cardText}>{meal.ingredients}</Text>
                    </View>

                    <View style={s.card}>
                        <Text style={s.cardLabel}>목표 영양소</Text>
                        <View style={s.macroRow}>
                            <MacroItem
                                label="탄수"
                                value={Math.round((meal.expectedKcal * 0.45) / 4)}
                                unit="g"
                                color={colors.accent3}
                            />
                            <MacroItem
                                label="단백"
                                value={Math.round((meal.expectedKcal * 0.3) / 4)}
                                unit="g"
                                color={colors.teal}
                            />
                            <MacroItem
                                label="지방"
                                value={Math.round((meal.expectedKcal * 0.25) / 9)}
                                unit="g"
                                color={colors.amber}
                            />
                        </View>
                    </View>

                    <View style={s.stepGuide}>
                        <Text style={s.stepGuideTitle}>촬영 순서</Text>
                        <View style={s.stepRow}>
                            <View style={s.stepBadge}><Text style={s.stepBadgeText}>1</Text></View>
                            <Text style={s.stepText}>빈 그릇을 먼저 촬영해요</Text>
                        </View>
                        <View style={s.stepRow}>
                            <View style={s.stepBadge}><Text style={s.stepBadgeText}>2</Text></View>
                            <Text style={s.stepText}>음식이 담긴 그릇을 촬영해요</Text>
                        </View>
                        <Text style={s.stepHint}>AI가 두 사진을 비교해 실제 섭취량을 계산해요</Text>
                    </View>
                </View>

                <View style={s.footer}>
                    <TouchableOpacity style={s.primaryBtn} onPress={handleStartCamera}>
                        <Text style={s.primaryBtnText}>📸 촬영 시작</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    /* ── CAMERA EMPTY ── */
    if (phase === 'camera_empty') {
        return (
            <View style={{flex: 1, backgroundColor: '#000'}}>
                <CameraView ref={cameraRef} style={{flex: 1}} facing="back">
                    <SafeAreaView style={s.cameraOverlay}>
                        <TouchableOpacity style={s.cameraBack} onPress={() => setPhase('info')}>
                            <Text style={s.cameraBackText}>← 취소</Text>
                        </TouchableOpacity>
                        <View style={s.cameraStepBanner}>
                            <Text style={s.cameraStepLabel}>STEP 1 / 2</Text>
                            <Text style={s.cameraGuideText}>빈 그릇을 위에서 찍어주세요</Text>
                        </View>
                    </SafeAreaView>

                    <View style={s.cornerTL}/>
                    <View style={s.cornerTR}/>
                    <View style={s.cornerBL}/>
                    <View style={s.cornerBR}/>

                    <View style={s.shutterArea}>
                        <TouchableOpacity style={s.shutter} onPress={handleCaptureEmpty}>
                            <View style={s.shutterInner}/>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        );
    }

    /* ── CAMERA FOOD ── */
    if (phase === 'camera_food') {
        return (
            <View style={{flex: 1, backgroundColor: '#000'}}>
                <CameraView ref={cameraRef} style={{flex: 1}} facing="back">
                    <SafeAreaView style={s.cameraOverlay}>
                        <TouchableOpacity style={s.cameraBack} onPress={() => setPhase('camera_empty')}>
                            <Text style={s.cameraBackText}>← 다시 찍기</Text>
                        </TouchableOpacity>
                        <View style={[s.cameraStepBanner, {backgroundColor: 'rgba(184,255,78,0.18)'}]}>
                            <Text style={[s.cameraStepLabel, {color: colors.accent}]}>STEP 2 / 2</Text>
                            <Text style={s.cameraGuideText}>음식이 담긴 그릇을 찍어주세요</Text>
                        </View>
                    </SafeAreaView>

                    {emptyPhotoUri && (
                        <View style={s.emptyPhotoThumb}>
                            <Image source={{uri: emptyPhotoUri}} style={s.thumbImg}/>
                            <Text style={s.thumbLabel}>빈 그릇 ✓</Text>
                        </View>
                    )}

                    <View style={s.cornerTL}/>
                    <View style={s.cornerTR}/>
                    <View style={s.cornerBL}/>
                    <View style={s.cornerBR}/>

                    <View style={s.shutterArea}>
                        <TouchableOpacity style={[s.shutter, {borderColor: colors.accent}]} onPress={handleCaptureFood}>
                            <View style={[s.shutterInner, {backgroundColor: colors.accent}]}/>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        );
    }

    /* ── ANALYZING ── */
    if (phase === 'analyzing') {
        return (
            <SafeAreaView style={[s.container, {justifyContent: 'center', alignItems: 'center'}]} edges={['top', 'left', 'right']}>
                {foodPhotoUri && (
                    <Image source={{uri: foodPhotoUri}} style={s.analyzingPhoto} blurRadius={3}/>
                )}
                <View style={s.analyzingOverlay}>
                    <ActivityIndicator size="large" color={colors.accent}/>
                    <Text style={s.analyzingText}>AI 분석 중...</Text>
                    <Text style={s.analyzingSubText}>두 사진을 비교해 섭취량을 계산하고 있어요</Text>
                </View>
            </SafeAreaView>
        );
    }

    /* ── RESULT ── */
    return (
        <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
            <View style={s.header}>
                <View style={{width: 50}}/>
                <Text style={s.headerTitle}>분석 결과</Text>
                <View style={{width: 50}}/>
            </View>

            <ScrollView style={s.body} contentContainerStyle={{gap: 10, paddingBottom: 16}} showsVerticalScrollIndicator={false}>
                <View style={s.scoreSection}>
                    {foodPhotoUri && (
                        <Image source={{uri: foodPhotoUri}} style={s.resultPhoto}/>
                    )}
                    <View style={s.scoreRing}>
                        <Text style={s.scoreNum}>{result?.score}</Text>
                        <Text style={s.scoreUnit}>점</Text>
                    </View>
                    <Text style={s.scoreGrade}>
                        {(result?.score ?? 0) >= 90 ? '완벽해요! 🎉' : (result?.score ?? 0) >= 80 ? '훌륭해요 👍' : '잘 하셨어요 💪'}
                    </Text>
                    <Text style={s.scoreSub}>목표 대비 {Math.round(((result?.actualKcal ?? 0) / meal.expectedKcal) * 100)}% 달성</Text>
                </View>

                {result?.foods && result.foods.length > 0 && (
                    <View style={s.card}>
                        <Text style={s.cardLabel}>인식된 음식</Text>
                        <Text style={s.cardText}>{result.foods.join(' · ')}</Text>
                    </View>
                )}

                <View style={s.card}>
                    <View style={s.resultKcalRow}>
                        <Text style={s.cardLabel}>실제 섭취</Text>
                        <Text style={s.resultKcal}>
                            {result?.actualKcal}
                            <Text style={{fontSize: 12, color: colors.sub}}> / {meal.expectedKcal} kcal</Text>
                        </Text>
                    </View>
                    <View style={s.macroRow}>
                        <MacroItem label="탄수" value={result?.macros.carb ?? 0} unit="g" color={colors.accent3}/>
                        <MacroItem label="단백" value={result?.macros.protein ?? 0} unit="g" color={colors.teal}/>
                        <MacroItem label="지방" value={result?.macros.fat ?? 0} unit="g" color={colors.amber}/>
                    </View>
                </View>

                <View style={s.feedbackCard}>
                    <Text style={s.feedbackLabel}>✨ AI 피드백</Text>
                    <Text style={s.feedbackText}>{result?.feedback}</Text>
                </View>
            </ScrollView>

            <View style={s.footer}>
                <TouchableOpacity style={s.primaryBtn} onPress={handleUpload}>
                    <Text style={s.primaryBtnText}>🏠 홈에 업로드</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const CORNER_SIZE = 20;
const CORNER_THICK = 2;

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
    backBtn: {fontSize: 22, color: colors.text},
    headerTitle: {fontSize: 16, fontWeight: '600', color: colors.text},
    body: {flex: 1, padding: 16, gap: 10},
    footer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    primaryBtn: {backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: 'center'},
    primaryBtnText: {fontSize: 14, fontWeight: '700', color: colors.bg},

    infoCard: {
        backgroundColor: 'rgba(184,255,78,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.2)',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
    },
    infoKcal: {fontSize: 32, fontWeight: '700', color: colors.accent},
    infoLabel: {fontSize: 11, color: colors.sub, marginTop: 4},

    card: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 10,
    },
    cardLabel: {fontSize: 10, color: colors.sub, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '500'},
    cardText: {fontSize: 13, color: colors.text, lineHeight: 20},
    macroRow: {flexDirection: 'row', justifyContent: 'space-around'},

    stepGuide: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 8,
    },
    stepGuideTitle: {fontSize: 10, color: colors.sub, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '500'},
    stepRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    stepBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepBadgeText: {fontSize: 11, fontWeight: '700', color: colors.bg},
    stepText: {fontSize: 13, color: colors.text},
    stepHint: {fontSize: 11, color: colors.sub, marginTop: 2},

    /* camera */
    cameraOverlay: {flex: 1},
    cameraBack: {margin: 16},
    cameraBackText: {color: 'white', fontSize: 14, fontWeight: '500'},
    cameraStepBanner: {
        marginHorizontal: 16,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        gap: 2,
    },
    cameraStepLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', letterSpacing: 1},
    cameraGuideText: {color: 'white', fontSize: 13},
    shutterArea: {position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center'},
    shutter: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 4,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shutterInner: {width: 52, height: 52, borderRadius: 26, backgroundColor: 'white'},

    emptyPhotoThumb: {
        position: 'absolute',
        bottom: 58,
        right: 24,
        alignItems: 'center',
        gap: 4,
    },
    thumbImg: {width: 56, height: 56, borderRadius: 8, borderWidth: 2, borderColor: colors.accent},
    thumbLabel: {color: colors.accent, fontSize: 10, fontWeight: '600'},

    /* corner guides */
    cornerTL: {position: 'absolute', top: '28%', left: '10%', width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: colors.accent},
    cornerTR: {position: 'absolute', top: '28%', right: '10%', width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: colors.accent},
    cornerBL: {position: 'absolute', top: '72%', left: '10%', width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: colors.accent},
    cornerBR: {position: 'absolute', top: '72%', right: '10%', width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: colors.accent},

    /* analyzing */
    analyzingPhoto: {position: 'absolute', inset: 0, width: '100%', height: '100%'},
    analyzingOverlay: {alignItems: 'center', gap: 12, backgroundColor: 'rgba(15,17,23,0.85)', padding: 32, borderRadius: 20},
    analyzingText: {fontSize: 18, fontWeight: '700', color: colors.text},
    analyzingSubText: {fontSize: 13, color: colors.sub},

    /* result */
    scoreSection: {alignItems: 'center', gap: 6},
    resultPhoto: {width: '100%', height: 160, borderRadius: 12, marginBottom: 4},
    scoreRing: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 5,
        borderColor: colors.accent,
        backgroundColor: 'rgba(184,255,78,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreNum: {fontSize: 26, fontWeight: '700', color: colors.accent},
    scoreUnit: {fontSize: 10, color: colors.sub, marginTop: -2},
    scoreGrade: {fontSize: 16, fontWeight: '700', color: colors.text},
    scoreSub: {fontSize: 12, color: colors.sub},
    resultKcalRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    resultKcal: {fontSize: 18, fontWeight: '700', color: colors.accent},
    feedbackCard: {
        backgroundColor: 'rgba(52,211,153,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(52,211,153,0.2)',
        borderRadius: 12,
        padding: 14,
        gap: 6,
    },
    feedbackLabel: {fontSize: 11, color: colors.teal, fontWeight: '600'},
    feedbackText: {fontSize: 13, color: colors.sub, lineHeight: 20},
});
