import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AccountsHubScreen } from '../screens/tabs/AccountsHubScreen';
import { BudgetHubScreen } from '../screens/tabs/BudgetHubScreen';
import { InsuranceHubScreen } from '../screens/tabs/InsuranceHubScreen';
import { InsightsHubScreen } from '../screens/tabs/InsightsHubScreen';
import { InvestmentHubScreen } from '../screens/tabs/InvestmentHubScreen';
import HouseExpenseSettingsScreen from '../screens/tabs/HouseExpenseSettingsScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';
import type { ProfileStackParamList } from './profileStackTypes';

export type { ProfileStackParamList } from './profileStackTypes';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{
          title: 'More',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="InsightsHub"
        component={InsightsHubScreen}
        options={{
          title: 'Insights',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="AccountsHub"
        component={AccountsHubScreen}
        options={{
          title: 'Accounts',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="BudgetHub"
        component={BudgetHubScreen}
        options={{
          title: 'Budgets',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="HouseExpenseSettings"
        component={HouseExpenseSettingsScreen}
        options={{
          title: 'Expense categories',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="InvestmentHub"
        component={InvestmentHubScreen}
        options={{
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="InsuranceHub"
        component={InsuranceHubScreen}
        options={{
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}
