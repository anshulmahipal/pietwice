/**
 * Unit: HouseExpenseSettingsScreen — thin wrapper; same UX as household budget onboarding.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import {
  loadExpenseCategoriesFromDb,
  replaceExpenseCategoriesInDb,
} from '../../expenseCategories/expenseCategoryDb';
import { DEFAULT_EXPENSE_CATEGORY_ROWS } from '../../expenseCategories/defaultExpenseCategories';
import HouseExpenseSettingsScreen from './HouseExpenseSettingsScreen';

jest.mock('../../expenseCategories/expenseCategoryDb', () => ({
  loadExpenseCategoriesFromDb: jest.fn(),
  replaceExpenseCategoriesInDb: jest.fn(() => Promise.resolve()),
  resetExpenseCategoryDbConnectionForTests: jest.fn(),
  loadCategorySpentMap: jest.fn(() => Promise.resolve({})),
  upsertCategorySpent: jest.fn(() => Promise.resolve()),
  loadExpenseDayTotalsForMonth: jest.fn(() => Promise.resolve({})),
  loadExpenseLineItemsForDay: jest.fn(() => Promise.resolve([])),
}));

const loadMock = loadExpenseCategoriesFromDb as jest.MockedFunction<
  typeof loadExpenseCategoriesFromDb
>;
const replaceMock = replaceExpenseCategoriesInDb as jest.MockedFunction<
  typeof replaceExpenseCategoriesInDb
>;

const Stack = createNativeStackNavigator();

function SettingsInStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="ExpenseCategories"
          component={HouseExpenseSettingsScreen}
          options={{
            title: 'Expense categories',
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('HouseExpenseSettingsScreen', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
    loadMock.mockResolvedValue([...DEFAULT_EXPENSE_CATEGORY_ROWS]);
  });

  it('shows the same category budget layout as onboarding (linear rows, Save)', async () => {
    render(<SettingsInStack />);

    await waitFor(() => {
      expect(screen.getByTestId('household-budget-overview-screen')).toBeTruthy();
    });

    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.getByTestId('household-budget-add-open')).toBeTruthy();
    expect(screen.getByTestId('household-budget-category-title-0')).toBeTruthy();
  });

  it('persists categories when Save is pressed', async () => {
    loadMock.mockResolvedValue([
      { title: 'Milk', amount: '100' },
      { title: 'Rent', amount: '5000' },
    ]);

    render(<SettingsInStack />);

    await waitFor(() => {
      expect(screen.getByTestId('household-budget-overview-screen')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('household-budget-continue'));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith([
        { title: 'Milk', amount: '100' },
        { title: 'Rent', amount: '5000' },
      ]);
    });
  });
});
