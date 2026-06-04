import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'RecipeList'>;

const savedRecipes = [
    {id: '1', emoji: '🔖', title: '닭가슴살 토마토 파스타'},
    {id: '2', emoji: '🔖', title: '두부 스테이크 샐러드'},
];

const historyRecipes = [
    {id: '3', emoji: '🍳', title: '오트밀 요거트 볼'},
    {id: '4', emoji: '🥗', title: '연어 샐러드'},
];

const aiRecipes = [
    {id: '5', emoji: '🤖', title: 'AI 저탄고단 도시락'},
    {id: '6', emoji: '🤖', title: 'AI 다이어트 브런치'},
];

export function RecipeListScreen({navigation, route}: Props) {
    const {type} = route.params;

    const recipes =
        type  === 'saved'
        ? savedRecipes
        : type === 'history'
        ? historyRecipes
        : aiRecipes;

    return (
        <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={s.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: type === 'ai' ? 100 : 24}}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={s.title}>
                        {type === 'saved'
                            ? '저장한 레시피'
                            : type === 'history'
                            ? '이전 식단'
                            : 'AI 생성 레시피'}
                    </Text>
                </View>

                {recipes.map(recipe => (
                    <TouchableOpacity
                        key={recipe.id}
                        style={s.card}
                        onPress={() =>
                            navigation.navigate('RecipeDetail', {
                                recipeId: recipe.id,
                                fromType: type,
                            })
                        }>
                        <Text style={s.emoji}>{recipe.emoji}</Text>
                        <Text style={s.text}>{recipe.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {type === 'ai' && (
                <View style={s.footer}>
                    <TouchableOpacity
                        style={s.generateBtn}
                        onPress={() => navigation.navigate('AIRecipeGenerate')}>
                        <Text style={s.generateBtnText}>
                            ✦ AI 레시피 생성하기
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    scroll: {paddingHorizontal: 16},
    footer: {
        height: 68,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.bg,
    },
    generateBtn: {
        height: 52,
        width: '100%',
        borderRadius: 14,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generateBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 12,
        paddingTop: 12,
    },

    backBtn: {
        fontSize: 24,
        color: colors.text,
        marginRight: 12,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emoji: {
        fontSize: 18,
        marginRight: 12,
    },
    text: {
        color: colors.text,
        fontSize: 14,
    },
});