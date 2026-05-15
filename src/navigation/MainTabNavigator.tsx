import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../theme';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CommunityScreen } from '../screens/community/CommunityScreen';
import { FriendsScreen } from '../screens/friends/FriendsScreen';
import { MarketScreen } from '../screens/market/MarketScreen';
import { MyPageScreen } from '../screens/mypage/MyPageScreen';

export type MainTabParamList = {
  Friends: undefined;
  Community: undefined;
  Home: undefined;
  Market: undefined;
  MyPage: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabItems = [
  { name: 'Friends' as const, label: '친구', icon: '👥' },
  { name: 'Community' as const, label: '커뮤니티', icon: '💬' },
  { name: 'Home' as const, label: '홈', icon: '🏠' },
  { name: 'Market' as const, label: '식재료구매', icon: '🛒' },
  { name: 'MyPage' as const, label: '마이', icon: '👤' },
];

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const item = tabItems.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 20,
            paddingTop: 8,
            height: 68,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.sub,
          tabBarLabel: item?.label ?? route.name,
          tabBarLabelStyle: { fontSize: 9 },
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 17, opacity: focused ? 1 : 0.38 }}>
              {item?.icon}
            </Text>
          ),
        };
      }}
    >
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="MyPage" component={MyPageScreen} />
    </Tab.Navigator>
  );
}
