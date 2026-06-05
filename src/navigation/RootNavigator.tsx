import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '../store/authStore';
import {OnboardingNavigator} from './OnboardingNavigator';
import {MainTabNavigator} from './MainTabNavigator';
import {getToken} from '../api/client';
import {getMyInfo} from '../api/onboarding';

export type RootStackParamList = {
    Onboarding: undefined;
    Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    const {isLoggedIn, isOnboarded, setLoggedIn, setOnboarded, setUser} = useAuthStore();
    const [bootstrapping, setBootstrapping] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                if (token) {
                    const userInfo = await getMyInfo();
                    const onboardingDone = userInfo.nickname && userInfo.age && userInfo.height_cm && userInfo.weight_kg;
                    if (onboardingDone) {
                        setUser({
                            id: userInfo.id,
                            user_code: userInfo.user_code,
                            nickname: userInfo.nickname,
                            email: userInfo.email,
                            age: userInfo.age,
                            gender: userInfo.gender,
                            height: userInfo.height_cm,
                            weight: userInfo.weight_kg,
                            activityLevel: userInfo.activity_level === 'medium' ? 'normal' : userInfo.activity_level,
                            allergies: userInfo.allergies ?? [],
                            diseases: userInfo.diseases ?? [],
                            dietStyle: 'normal',
                            preferredIngredients: userInfo.preferences?.filter((p: any) => p.preference === 'like').map((p: any) => p.ingredient_name) ?? [],
                            dietGoal: userInfo.diet_goal ?? 'maintain',
                            tdee: userInfo.tdee_kcal ?? 1800,
                        });
                        setLoggedIn(true);
                        setOnboarded(true);
                    } else {
                        setLoggedIn(true);
                    }
                }
            } catch {
                // 토큰 만료 등 → 로그인 화면으로
            } finally {
                setBootstrapping(false);
            }
        })();
    }, []);

    if (bootstrapping) {
        return (
            <View style={{flex: 1, backgroundColor: '#0f1117', justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator color="#b8ff4e"/>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                {!isLoggedIn || !isOnboarded ? (
                    <Stack.Screen name="Onboarding" component={OnboardingNavigator}/>
                ) : (
                    <Stack.Screen name="Main" component={MainTabNavigator}/>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
