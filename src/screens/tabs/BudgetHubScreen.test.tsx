import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { BudgetHubScreen } from './BudgetHubScreen';

const saveBudget = jest.fn(() => Promise.resolve(true));
const reload = jest.fn(() => Promise.resolve());
const clearFormError = jest.fn();

jest.mock('../../budgets/useBudgetsOverview', () => ({
  useBudgetsOverview: jest.fn(),
}));

import { useBudgetsOverview } from '../../budgets/useBudgetsOverview';

const useMock = useBudgetsOverview as jest.MockedFunction<typeof useBudgetsOverview>;
const Stack = createNativeStackNavigator();

function BudgetHost() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="BudgetHub" component={BudgetHubScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('BudgetHubScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMock.mockReturnValue({
      rows: [
        {
          periodType: 'weekly',
          periodLabel: 'Weekly',
          amount: '3000',
          spent: 1200,
          statusLabel: 'On track',
          rangeLabel: '2026-04-13 to 2026-04-19',
        },
        {
          periodType: 'biweekly',
          periodLabel: 'Bi-weekly',
          amount: '',
          spent: 1800,
          statusLabel: 'No budget set',
          rangeLabel: '2026-04-06 to 2026-04-19',
        },
        {
          periodType: 'monthly',
          periodLabel: 'Monthly',
          amount: '10000',
          spent: 4200,
          statusLabel: 'On track',
          rangeLabel: '2026-04-01 to 2026-04-30',
        },
      ],
      isReady: true,
      isSaving: false,
      formError: null,
      saveBudget,
      reload,
      clearFormError,
    });
  });

  it('renders period cards', () => {
    render(<BudgetHost />);
    expect(screen.getByTestId('budget-row-weekly')).toBeTruthy();
    expect(screen.getByTestId('budget-row-biweekly')).toBeTruthy();
    expect(screen.getByTestId('budget-row-monthly')).toBeTruthy();
  });

  it('opens editor and saves amount', async () => {
    render(<BudgetHost />);
    fireEvent.press(screen.getByTestId('budget-row-weekly'));
    await waitFor(() => expect(screen.getByTestId('budget-edit-modal')).toBeTruthy());
    fireEvent.changeText(screen.getByTestId('budget-edit-amount-input'), '4500');
    fireEvent.press(screen.getByTestId('budget-edit-save'));
    await waitFor(() => {
      expect(saveBudget).toHaveBeenCalledWith('weekly', '4500');
    });
  });
});
