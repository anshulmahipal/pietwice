import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { BillsScreen } from '../screens/tabs/BillsScreen';
import { CreditCardListScreen } from '../screens/tabs/CreditCardListScreen';
import { financeColors } from '../ui/financeTheme';
import { HouseExpenseStack } from './HouseExpenseStack';
import { ProfileStack } from './ProfileStack';

export type MainTabParamList = {
  HouseExpense: undefined;
  Bills: undefined;
  CreditCardList: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: financeColors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: financeColors.text,
          fontWeight: '700',
        },
        tabBarActiveTintColor: financeColors.accent,
        tabBarInactiveTintColor: financeColors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 18,
          height: 72,
          borderRadius: 26,
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: financeColors.surfaceStrong,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        sceneStyle: {
          backgroundColor: financeColors.background,
        },
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
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bills"
        component={BillsScreen}
        options={{
          title: 'Bills',
          tabBarLabel: 'Bills',
          tabBarAccessibilityLabel: 'Bills tab',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CreditCardList"
        component={CreditCardListScreen}
        options={{
          title: 'Credit card list',
          tabBarLabel: 'Credit card list',
          tabBarAccessibilityLabel: 'Credit card list tab',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'card' : 'card-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
