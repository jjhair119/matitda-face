import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MarketScreen} from '../screens/market/MarketScreen';
import {StoreDetailScreen} from '../screens/market/StoreDetailScreen';
import {CartScreen} from '../screens/market/CartScreen';
import {CheckoutScreen} from '../screens/market/CheckoutScreen';
import {OrderCompleteScreen} from '../screens/market/OrderCompleteScreen';

export type MarketStackParamList = {
    MarketMain: undefined;
    StoreDetail: {storeId: string};
    Cart: undefined;
    Checkout: undefined;
    OrderComplete: {earnedPoints: number; deliveryTime: number};
};

const Stack = createNativeStackNavigator<MarketStackParamList>();

export function MarketStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="MarketMain" component={MarketScreen}/>
            <Stack.Screen name="StoreDetail" component={StoreDetailScreen} options={{animation: 'slide_from_right'}}/>
            <Stack.Screen name="Cart" component={CartScreen} options={{animation: 'slide_from_right'}}/>
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{animation: 'slide_from_right'}}/>
            <Stack.Screen name="OrderComplete" component={OrderCompleteScreen} options={{animation: 'fade'}}/>
        </Stack.Navigator>
    );
}
