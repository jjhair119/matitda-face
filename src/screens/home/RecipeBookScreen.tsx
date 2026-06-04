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

type Props = NativeStackScreenProps<HomeStackParamList, 'RecipeBook'>;

export function RecipeBookScreen({navigation}: Props) {
    return (
        <SafeAreaView style={s.container}>
            <ScrollView
                style={s.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.header}> <TouchableOpacity onPress={() => navigation.goBack()} > <Text style={s.backBtn}>←</Text> </TouchableOpacity> <Text style={s.title}> 📖 레시피북 </Text> </View> <Text style={s.subtitle}> 저장한 레시피와 AI 생성 레시피를 관리해보세요 </Text>
                {/* 카테고리 */}

<TouchableOpacity
    style={s.categoryCard}
    onPress={() =>
        navigation.navigate('RecipeList', {
            type: 'saved',
        })
    }>
    <Text style={s.categoryEmoji}>🔖</Text>

    <View style={s.categoryContent}>
        <Text style={s.categoryTitle}>저장한 레시피</Text>
        <Text style={s.categoryDesc}>
            즐겨찾기한 레시피 모아보기
        </Text>
    </View>

    <Text style={s.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity
    style={s.categoryCard}
    onPress={() =>
        navigation.navigate('RecipeList', {
            type: 'history',
        })
    }>
    <Text style={s.categoryEmoji}>🍽️</Text>

    <View style={s.categoryContent}>
        <Text style={s.categoryTitle}>이전 식단</Text>
        <Text style={s.categoryDesc}>
            과거 식단 기록 보기
        </Text>
    </View>

    <Text style={s.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity
    style={s.categoryCard}
    onPress={() =>
        navigation.navigate('RecipeList', {
            type: 'ai',
        })
    }>
    <Text style={s.categoryEmoji}>🤖</Text>

    <View style={s.categoryContent}>
        <Text style={s.categoryTitle}>AI 생성 레시피</Text>
        <Text style={s.categoryDesc}>
            생성한 레시피 모아보기
        </Text>
    </View>

    <Text style={s.arrow}>›</Text>
</TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    scroll: {
        flex: 1,
        paddingHorizontal: 16,
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

    subtitle: {
        color: colors.sub,
        fontSize: 12,
        marginBottom: 20,
    },

    aiCard: {
        backgroundColor: colors.surface2,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.25)',
        marginBottom: 24,
    },

    aiTitle: {
        color: colors.accent,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },

    aiDesc: {
        color: colors.sub,
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 14,
    },

    generateBtn: {
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },

    generateBtnText: {
        color: '#111',
        fontWeight: '700',
        fontSize: 14,
    },

    sectionTitle: {
        color: colors.sub,
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 6,
    },

    recipeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },

    recipeEmoji: {
        fontSize: 18,
        marginRight: 12,
    },

    recipeText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },

    categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
},

categoryEmoji: {
    fontSize: 22,
    marginRight: 14,
},

categoryContent: {
    flex: 1,
},

categoryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
},

categoryDesc: {
    color: colors.sub,
    fontSize: 11,
},

arrow: {
    color: colors.sub,
    fontSize: 24,
},
});