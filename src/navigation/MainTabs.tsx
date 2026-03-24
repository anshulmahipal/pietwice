import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { CreditCardListScreen } from '../screens/tabs/CreditCardListScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';
import { HouseExpenseStack } from './HouseExpenseStack';

export type MainTabParamList = {
  HouseExpense: undefined;
  CreditCardList: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="HouseExpense"
        component={HouseExpenseStack}
        options={{
          headerShown: false,
          title: 'House expense',
          tabBarLabel: 'House expense',
          tabBarAccessibilityLabel: 'House expense tab',
        }}
      />
      <Tab.Screen
        name="CreditCardList"
        component={CreditCardListScreen}
        options={{
          title: 'Credit card list',
          tabBarLabel: 'Credit card list',
          tabBarAccessibilityLabel: 'Credit card list tab',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tab.Navigator>
  );
}
