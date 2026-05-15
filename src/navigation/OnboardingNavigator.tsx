import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SocialLoginScreen } from '../screens/auth/SocialLoginScreen';
import { BasicInfoScreen } from '../screens/auth/BasicInfoScreen';
import { HealthInfoScreen } from '../screens/auth/HealthInfoScreen';
import { PreferenceScreen } from '../screens/auth/PreferenceScreen';

export type OnboardingStackParamList = {
  SocialLogin: undefined;
  BasicInfo: undefined;
  HealthInfo: undefined;
  Preference: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SocialLogin" component={SocialLoginScreen} />
      <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
      <Stack.Screen name="HealthInfo" component={HealthInfoScreen} />
      <Stack.Screen name="Preference" component={PreferenceScreen} />
    </Stack.Navigator>
  );
}
