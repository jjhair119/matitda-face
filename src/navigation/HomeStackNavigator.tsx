import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/home/HomeScreen';
import {MealUploadScreen} from '../screens/home/MealUploadScreen';
import {MealId} from '../store/mealStore';

export type HomeStackParamList = {
    Home: undefined;
    MealUpload: {mealId: MealId};
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen
                name="MealUpload"
                component={MealUploadScreen}
                options={{animation: 'slide_from_bottom'}}
            />
        </Stack.Navigator>
    );
}
