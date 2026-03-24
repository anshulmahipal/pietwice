/**
 * Unit: HouseExpenseStack — House expense root with settings action in header.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { HouseExpenseStack } from './HouseExpenseStack';

jest.mock('../expenseCategories/expenseCategoryDb', () => {
  const defaults = require('../expenseCategories/defaultExpenseCategories')
    .DEFAULT_EXPENSE_CATEGORY_ROWS as { title: string; amount: string }[];
  return {
    loadExpenseCategoriesFromDb: jest.fn(() => Promise.resolve([...defaults])),
    replaceExpenseCategoriesInDb: jest.fn(() => Promise.resolve()),
    resetExpenseCategoryDbConnectionForTests: jest.fn(),
    loadCategorySpentMap: jest.fn(() => Promise.resolve({})),
    upsertCategorySpent: jest.fn(() => Promise.resolve()),
    loadExpenseDayTotalsForMonth: jest.fn(() => Promise.resolve({})),
    loadExpenseLineItemsForDay: jest.fn(() => Promise.resolve([])),
  };
});

jest.mock('../houseExpense/useHouseExpenseDashboard', () => ({
  useHouseExpenseDashboard: () => ({
    rows: [
      { title: 'Milk', amount: '100', spent: '25' },
      { title: 'Water', amount: '', spent: '10' },
    ],
    isReady: true,
    refresh: jest.fn(() => Promise.resolve()),
    saveSpent: jest.fn(() => Promise.resolve()),
  }),
}));

jest.mock('../houseExpense/useExpenseCalendarMonth', () => ({
  useExpenseCalendarMonth: () => ({
    dayTotals: {},
    reloadDayTotals: jest.fn(() => Promise.resolve()),
    loadLinesForDay: jest.fn(() => Promise.resolve([])),
  }),
}));

jest.mock('react-native-calendars', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Calendar: ({
      dayComponent: Day,
    }: {
      dayComponent?: (p: { date?: { dateString: string; day: number }; state?: string }) => React.ReactElement | null;
    }) => {
      const dateData = {
        dateString: '2024-06-15',
        day: 15,
        month: 6,
        year: 2024,
        timestamp: 0,
      };
      return React.createElement(
        View,
        { testID: 'mock-house-expense-calendar-widget' },
        Day ? React.createElement(Day, { date: dateData, state: '' }) : null,
      );
    },
  };
});

describe('HouseExpenseStack', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  it('shows the house expense home first with a settings control in the header', () => {
    render(
      <NavigationContainer>
        <HouseExpenseStack />
      </NavigationContainer>,
    );

    expect(screen.getByTestId('screen-house-expense')).toBeTruthy();
    expect(screen.getByTestId('house-expense-header-settings')).toBeTruthy();
  });

  it('opens expense details when the combined summary is pressed', async () => {
    render(
      <NavigationContainer>
        <HouseExpenseStack />
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByTestId('house-expense-combined-nav'));

    await waitFor(() => {
      expect(screen.getByTestId('screen-house-expense-detail')).toBeTruthy();
    });
  });

  it('opens the settings screen when the header settings control is pressed', async () => {
    render(
      <NavigationContainer>
        <HouseExpenseStack />
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByTestId('house-expense-header-settings'));

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-settings-screen')).toBeTruthy();
    });

    expect(screen.getByTestId('house-expense-settings-header-edit')).toBeTruthy();
  });
});
