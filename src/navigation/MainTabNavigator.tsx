import React, {useRef, useEffect} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Animated, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../theme';
import {HomeStackNavigator} from './HomeStackNavigator';
import {CommunityScreen} from '../screens/community/CommunityScreen';
import {FriendsScreen} from '../screens/friends/FriendsScreen';
import {MarketScreen} from '../screens/market/MarketScreen';
import {MyPageScreen} from '../screens/mypage/MyPageScreen';

export type MainTabParamList = {
    Friends: undefined;
    Community: undefined;
    Home: undefined;
    Market: undefined;
    MyPage: undefined;
};

const Tab = createMaterialTopTabNavigator<MainTabParamList>();

const tabItems = [
    {name: 'Friends' as const, label: '친구', icon: '👥'},
    {name: 'Community' as const, label: '커뮤니티', icon: '💬'},
    {name: 'Home' as const, label: '홈', icon: '🏠'},
    {name: 'Market' as const, label: '식재료구매', icon: '🛒'},
    {name: 'MyPage' as const, label: '마이', icon: '👤'},
];

function TabIcon({icon, focused}: { icon: string; focused: boolean }) {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (focused) {
            Animated.sequence([
                Animated.timing(scale, {toValue: 1.3, duration: 120, useNativeDriver: true}),
                Animated.timing(scale, {toValue: 1, duration: 120, useNativeDriver: true}),
            ]).start();
        }
    }, [focused]);

    return (
        <Animated.View style={{transform: [{scale}]}}>
            <Text style={{fontSize: 17, opacity: focused ? 1 : 0.38}}>{icon}</Text>
        </Animated.View>
    );
}

export function MainTabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            initialRouteName="Home"
            tabBarPosition="bottom"
            screenOptions={({route}) => {
                const item = tabItems.find((t) => t.name === route.name);
                return {
                    tabBarStyle: {
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                        borderTopWidth: 1,
                        paddingBottom: insets.bottom || 8,
                        height: 56 + (insets.bottom || 8),
                    },
                    tabBarIndicatorStyle: {height: 0},
                    tabBarActiveTintColor: colors.accent,
                    tabBarInactiveTintColor: colors.sub,
                    tabBarLabelStyle: {fontSize: 9, marginTop: 2},
                    tabBarLabel: item?.label ?? route.name,
                    tabBarIcon: ({focused}) => (
                        <TabIcon icon={item?.icon ?? ''} focused={focused}/>
                    ),
                    tabBarShowIcon: true,
                    tabBarIconStyle: {width: 24, height: 24},
                    swipeEnabled: true,
                    animationEnabled: true,
                };
            }}
        >
            <Tab.Screen name="Friends" component={FriendsScreen}/>
            <Tab.Screen name="Community" component={CommunityScreen}/>
            <Tab.Screen name="Home" component={HomeStackNavigator}/>
            <Tab.Screen name="Market" component={MarketScreen}/>
            <Tab.Screen name="MyPage" component={MyPageScreen}/>
        </Tab.Navigator>
    );
}
