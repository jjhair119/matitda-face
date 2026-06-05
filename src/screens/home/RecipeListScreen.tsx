import React, {useEffect, useState, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {colors} from '../../theme';
import {getSavedRecipes, deleteRecipe, SavedRecipe, RecipePlanDay, RecipeMeal} from '../../api/recipes';

type Props = NativeStackScreenProps<HomeStackParamList, 'RecipeList'>;

const MEAL_LABEL: Record<string, string> = {
    breakfast: '아침',
    lunch: '점심',
    dinner: '저녁',
    snack: '간식',
};

function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function RecipeCard({recipe, onDelete}: {recipe: SavedRecipe; onDelete: () => void}) {
    const mealLabels = (recipe.meals ?? []).map(m => MEAL_LABEL[m] ?? m).join(' · ');

    return (
        <View style={s.card}>
            <View style={s.cardHeader}>
                <View style={s.cardMeta}>
                    <Text style={s.cardDays}>{recipe.days}일 플랜 · {mealLabels}</Text>
                    <Text style={s.cardDate}>{formatDate(recipe.created_at)}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert('레시피 삭제', '이 레시피를 삭제할까요?', [
                            {text: '취소', style: 'cancel'},
                            {text: '삭제', style: 'destructive', onPress: onDelete},
                        ]);
                    }}
                >
                    <Text style={s.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
            </View>

            {recipe.prompt ? (
                <Text style={s.cardPrompt} numberOfLines={2}>💬 {recipe.prompt}</Text>
            ) : null}

            <PlanPreview plan={Array.isArray(recipe.plan) ? recipe.plan : (recipe.plan as any).plan ?? []}/>
        </View>
    );
}

function MealDetail({m}: {m: RecipeMeal}) {
    const [expanded, setExpanded] = useState(false);
    return (
        <View style={s.mealBlock}>
            <TouchableOpacity style={s.mealHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
                <View style={s.mealLabelBadge}>
                    <Text style={s.mealLabel}>{m.meal_label ?? MEAL_LABEL[m.meal] ?? m.meal}</Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={s.mealTitle}>{m.title}</Text>
                    {m.nutrition?.calories > 0 && (
                        <Text style={s.mealKcal}>{Math.round(m.nutrition.calories)} kcal · 탄 {Math.round(m.nutrition.carbs_g)}g · 단 {Math.round(m.nutrition.protein_g)}g · 지 {Math.round(m.nutrition.fat_g)}g</Text>
                    )}
                </View>
                <Text style={s.expandIcon}>{expanded ? '▲' : '▽'}</Text>
            </TouchableOpacity>

            {expanded && (
                <View style={s.mealDetail}>
                    {m.description ? <Text style={s.mealDesc}>{m.description}</Text> : null}
                    {m.ingredients.length > 0 && (
                        <>
                            <Text style={s.detailSectionTitle}>재료</Text>
                            {m.ingredients.map((ing, i) => (
                                <Text key={i} style={s.detailItem}>• {ing}</Text>
                            ))}
                        </>
                    )}
                    {m.steps.length > 0 && (
                        <>
                            <Text style={s.detailSectionTitle}>조리 순서</Text>
                            {m.steps.map((step, i) => (
                                <Text key={i} style={s.detailItem}>{i + 1}. {step}</Text>
                            ))}
                        </>
                    )}
                </View>
            )}
        </View>
    );
}

function PlanPreview({plan}: {plan: RecipePlanDay[]}) {
    if (!Array.isArray(plan) || plan.length === 0) return null;
    return (
        <View style={s.planArea}>
            {plan.map((dayObj) => (
                <View key={dayObj.day} style={s.dayBlock}>
                    <Text style={s.dayTitle}>{dayObj.day}일차</Text>
                    {(dayObj.meals ?? []).map((m) => (
                        <MealDetail key={m.id ?? m.meal} m={m}/>
                    ))}
                </View>
            ))}
        </View>
    );
}

export function RecipeListScreen({navigation, route}: Props) {
    const {type} = route.params;
    const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await getSavedRecipes();
            setRecipes(data);
        } catch {
            Alert.alert('오류', '레시피 목록을 불러오지 못했어요.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id: string) => {
        try {
            await deleteRecipe(id);
            setRecipes(prev => prev.filter(r => r.id !== id));
        } catch {
            Alert.alert('오류', '삭제에 실패했어요.');
        }
    };

    return (
        <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={s.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: type === 'ai' ? 100 : 24}}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent}/>}
            >
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={s.title}>
                        {type === 'saved' ? '저장한 레시피' : 'AI 생성 레시피'}
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator color={colors.accent} style={{marginTop: 40}}/>
                ) : recipes.length === 0 ? (
                    <View style={s.empty}>
                        <Text style={s.emptyText}>저장된 레시피가 없어요</Text>
                        <Text style={s.emptySub}>AI 레시피를 생성하고 저장해보세요</Text>
                    </View>
                ) : (
                    recipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onDelete={() => handleDelete(recipe.id)}
                        />
                    ))
                )}
            </ScrollView>

            {type === 'ai' && (
                <View style={s.footer}>
                    <TouchableOpacity style={s.generateBtn} onPress={() => navigation.navigate('AIRecipeGenerate')}>
                        <Text style={s.generateBtnText}>✦ AI 레시피 생성하기</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    scroll: {paddingHorizontal: 16},
    header: {flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 12, paddingTop: 12},
    backBtn: {fontSize: 24, color: colors.text, marginRight: 12},
    title: {fontSize: 22, fontWeight: '700', color: colors.text},
    empty: {alignItems: 'center', paddingVertical: 60},
    emptyText: {fontSize: 15, color: colors.sub, marginBottom: 6},
    emptySub: {fontSize: 12, color: colors.sub, opacity: 0.6},

    card: {
        backgroundColor: colors.surface2,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        padding: 14,
    },
    cardHeader: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4},
    cardMeta: {flex: 1, gap: 2},
    cardDays: {fontSize: 14, fontWeight: '700', color: colors.text},
    cardDate: {fontSize: 11, color: colors.sub},
    cardPrompt: {fontSize: 11, color: colors.sub, marginBottom: 10, opacity: 0.8},

    planArea: {gap: 12, marginTop: 10},
    dayBlock: {marginBottom: 4},
    dayTitle: {fontSize: 11, fontWeight: '700', color: colors.accent, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5},
    mealBlock: {backgroundColor: colors.surface, borderRadius: 10, marginBottom: 6, overflow: 'hidden', borderWidth: 1, borderColor: colors.border},
    mealHeader: {flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10},
    mealLabelBadge: {backgroundColor: colors.surface2, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, minWidth: 32, alignItems: 'center'},
    mealLabel: {fontSize: 10, fontWeight: '700', color: colors.sub},
    mealTitle: {fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 2},
    mealKcal: {fontSize: 10, color: colors.sub},
    expandIcon: {fontSize: 10, color: colors.sub},
    mealDetail: {paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10},
    mealDesc: {fontSize: 12, color: colors.sub, marginBottom: 8, lineHeight: 18},
    detailSectionTitle: {fontSize: 11, fontWeight: '700', color: colors.text, marginTop: 8, marginBottom: 4},
    detailItem: {fontSize: 12, color: colors.text, lineHeight: 20},
    deleteBtnText: {fontSize: 14, color: '#ff6b6b66'},

    footer: {height: 68, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg},
    generateBtn: {height: 52, width: '100%', borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center'},
    generateBtnText: {fontSize: 15, fontWeight: '700', color: '#111'},
});
