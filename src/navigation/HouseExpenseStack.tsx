import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import HouseExpenseDetailScreen from '../screens/tabs/HouseExpenseDetailScreen';
import HouseExpenseScreen from '../screens/tabs/HouseExpenseScreen';
import type { HouseExpenseStackParamList } from './houseExpenseStackTypes';

export type { HouseExpenseStackParamList } from './houseExpenseStackTypes';

export type HouseExpenseStackNavigation = NativeStackNavigationProp<
  HouseExpenseStackParamList,
  'HouseExpenseHome'
>;

const Stack = createNativeStackNavigator<HouseExpenseStackParamList>();

export function HouseExpenseStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HouseExpenseHome"
        component={HouseExpenseScreen}
        options={{
          title: 'Home',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="HouseExpenseDetail"
        component={HouseExpenseDetailScreen}
        options={{
          title: 'Expense details',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}
