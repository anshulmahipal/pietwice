/**
 * Unit: HouseExpenseSettingsScreen — edit mode, header Save, SQLite persist.
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

  it('starts in view mode with non-editable fields and Edit in the header', async () => {
    render(<SettingsInStack />);

    await waitFor(() => {
      expect(screen.queryByTestId('house-expense-settings-loading')).toBeNull();
    });

    expect(screen.getByTestId('house-expense-category-title-0')).toHaveProp('editable', false);
    expect(screen.getByTestId('house-expense-category-amount-0')).toHaveProp('editable', false);
    expect(screen.getByTestId('house-expense-settings-header-edit')).toBeTruthy();
    expect(screen.queryByTestId('house-expense-new-category-title')).toBeNull();
  });

  it('enters edit mode from the header and enables inputs and Add', async () => {
    render(<SettingsInStack />);

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-settings-header-edit')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('house-expense-settings-header-edit'));

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-settings-header-save')).toBeTruthy();
    });

    expect(screen.getByTestId('house-expense-category-title-0')).toHaveProp('editable', true);
    expect(screen.getByTestId('house-expense-new-category-title')).toBeTruthy();
  });

  it('adds a new category in memory when Add is pressed in edit mode', async () => {
    render(<SettingsInStack />);

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-settings-header-edit')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('house-expense-settings-header-edit'));

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-new-category-title')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('house-expense-new-category-title'), 'Subscriptions');
    fireEvent.changeText(screen.getByTestId('house-expense-new-category-amount'), '499');
    fireEvent.press(screen.getByTestId('house-expense-add-category-button'));

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-category-title-11')).toHaveProp(
        'value',
        'Subscriptions',
      );
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('persists from the header Save control and leaves edit mode', async () => {
    loadMock.mockResolvedValue([{ title: 'Milk', amount: '10' }]);

    render(<SettingsInStack />);

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-settings-header-edit')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('house-expense-settings-header-edit'));

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-settings-header-save')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('house-expense-settings-header-save'));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith([{ title: 'Milk', amount: '10' }]);
    });

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-settings-header-edit')).toBeTruthy();
    });
  });
});
