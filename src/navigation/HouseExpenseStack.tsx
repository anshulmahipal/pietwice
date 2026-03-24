import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import HouseExpenseDetailScreen from '../screens/tabs/HouseExpenseDetailScreen';
import HouseExpenseScreen from '../screens/tabs/HouseExpenseScreen';
import HouseExpenseSettingsScreen from '../screens/tabs/HouseExpenseSettingsScreen';
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
        options={({ navigation }) => ({
          title: 'House expense',
          headerTitleAlign: 'center',
          headerRight: () => (
            <Pressable
              testID="house-expense-header-settings"
              accessibilityLabel="House expense settings"
              accessibilityRole="button"
              onPress={() => navigation.navigate('HouseExpenseSettings')}
              style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
            >
              <Ionicons name="settings-outline" size={24} color="#2563eb" />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="HouseExpenseDetail"
        component={HouseExpenseDetailScreen}
        options={{
          title: 'Expense details',
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
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
});
