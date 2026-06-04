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

type Props = NativeStackScreenProps<HomeStackParamList, 'RecipeDetail'>;

export function RecipeDetailScreen({navigation}: Props) {
    return (
        <SafeAreaView style={s.container}>
            <ScrollView style={s.scroll}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={s.back}>← 뒤로</Text>
                </TouchableOpacity>

                <Text style={s.title}>
                    🥗 연어 샐러드
                </Text>

                <Text style={s.kcal}>
                    420 kcal
                </Text>

                <View style={s.infoCard}>
                    <Text style={s.info}>단백질 38g</Text>
                    <Text style={s.info}>탄수화물 22g</Text>
                    <Text style={s.info}>지방 14g</Text>
                </View>

                <Text style={s.section}>재료</Text>

                <View style={s.card}>
                    <Text style={s.content}>연어 150g</Text>
                    <Text style={s.content}>양상추</Text>
                    <Text style={s.content}>방울토마토</Text>
                    <Text style={s.content}>올리브오일</Text>
                </View>

                <Text style={s.section}>조리 방법</Text>

                <View style={s.card}>
                    <Text style={s.content}>1. 채소를 씻는다.</Text>
                    <Text style={s.content}>2. 연어를 굽는다.</Text>
                    <Text style={s.content}>3. 접시에 담는다.</Text>
                </View>

                <TouchableOpacity style={s.button}>
                    <Text style={s.buttonText}>
                        🔖 저장하기
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},
    scroll: {padding: 16},

    back: {
        color: colors.sub,
        marginBottom: 20,
    },

    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: '700',
    },

    kcal: {
        color: colors.accent,
        fontSize: 18,
        marginTop: 8,
        marginBottom: 16,
    },

    infoCard: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },

    info: {
        color: colors.text,
        marginBottom: 4,
    },

    section: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },

    card: {
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },

    content: {
        color: colors.text,
        marginBottom: 8,
    },

    button: {
        height: 50,
        borderRadius: 12,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        color: '#111',
        fontWeight: '700',
    },
});