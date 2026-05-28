import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MyPageScreen} from '../screens/mypage/MyPageScreen';
import {ProfileEditScreen} from '../screens/mypage/ProfileEditScreen';
import {PointCouponScreen} from '../screens/mypage/PointCouponScreen';
import {DietHistoryScreen} from '../screens/mypage/DietHistoryScreen';

export type MyPageStackParamList = {
    MyPage: undefined;
    ProfileEdit: undefined;
    PointCoupon: undefined;
    DietHistory: undefined;
};

const Stack = createNativeStackNavigator<MyPageStackParamList>();

export function MyPageStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="MyPage" component={MyPageScreen}/>
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{animation: 'slide_from_right'}}/>
            <Stack.Screen name="PointCoupon" component={PointCouponScreen} options={{animation: 'slide_from_right'}}/>
            <Stack.Screen name="DietHistory" component={DietHistoryScreen} options={{animation: 'slide_from_right'}}/>
        </Stack.Navigator>
    );
}
