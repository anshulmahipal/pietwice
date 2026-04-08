import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { BillsScreen } from '../screens/tabs/BillsScreen';
import { BudgetHubScreen } from '../screens/tabs/BudgetHubScreen';
import { CreditCardListScreen } from '../screens/tabs/CreditCardListScreen';
import { financeColors } from '../ui/financeTheme';
import { HouseExpenseStack } from './HouseExpenseStack';
import { ProfileStack } from './ProfileStack';

export type MainTabParamList = {
  Home: undefined;
  Bills: undefined;
  Budget: undefined;
  Cards: undefined;
  More: undefined;
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
          height: 76,
          borderTopWidth: 1,
          borderTopColor: financeColors.border,
          paddingTop: 10,
          paddingBottom: 12,
          backgroundColor: financeColors.surfaceStrong,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HouseExpenseStack}
        options={{
          headerShown: false,
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
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
        name="Budget"
        component={BudgetHubScreen}
        options={{
          title: 'Budget',
          tabBarLabel: 'Budget',
          tabBarAccessibilityLabel: 'Budget tab',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cards"
        component={CreditCardListScreen}
        options={{
          title: 'Cards',
          tabBarLabel: 'Cards',
          tabBarAccessibilityLabel: 'Cards tab',
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
        name="More"
        component={ProfileStack}
        options={{
          headerShown: false,
          title: 'More',
          tabBarLabel: 'More',
          tabBarAccessibilityLabel: 'More tab',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
