import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/home/HomeScreen';
import {MealUploadScreen} from '../screens/home/MealUploadScreen';
import {NotificationScreen} from '../screens/home/NotificationScreen';
import {MealId} from '../store/mealStore';
import {RecipeBookScreen} from '../screens/home/RecipeBookScreen';
import {RecipeListScreen} from '../screens/home/RecipeListScreen';
import { RecipeDetailScreen } from 'src/screens/home/RecipeDetailScreen';

export type HomeStackParamList = {
    Home: undefined;
    MealUpload: {mealId: MealId};
    Notification: undefined;

    RecipeBook: undefined;

    RecipeList: {
        type: 'saved' | 'history' | 'ai';
    };

    RecipeDetail: {
        recipeId: string;
    };
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
            <Stack.Screen
                name="Notification"
                component={NotificationScreen}
                options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
                name="RecipeBook"
                component={RecipeBookScreen}
            />
            <Stack.Screen
    name="RecipeList"
    component={RecipeListScreen}
/>

<Stack.Screen
    name="RecipeDetail"
    component={RecipeDetailScreen}
/>
        </Stack.Navigator>
    );
}
