import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccountsHubScreen } from './AccountsHubScreen';

const addAccount = jest.fn(() => Promise.resolve(true));
const addEntry = jest.fn(() => Promise.resolve(true));
const reload = jest.fn(() => Promise.resolve());
const clearFormError = jest.fn();

jest.mock('../../accounts/useAccountsLedger', () => ({
  useAccountsLedger: jest.fn(),
}));

import { useAccountsLedger } from '../../accounts/useAccountsLedger';

const useMock = useAccountsLedger as jest.MockedFunction<typeof useAccountsLedger>;
const Stack = createNativeStackNavigator();

function Host() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="AccountsHub" component={AccountsHubScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('AccountsHubScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMock.mockReturnValue({
      accounts: [{ id: 1, accountName: 'HDFC', accountType: 'bank', currentBalance: '1000' }],
      recentEntries: [{ id: 1, accountId: 1, accountName: 'HDFC', entryKind: 'income', amount: '500', note: 'Cashback', entryDate: '2026-04-02', createdAt: 'x' }],
      monthlyIncome: 500,
      monthlyExpense: 100,
      totalBalance: 1000,
      isReady: true,
      isSaving: false,
      formError: null,
      addAccount,
      addEntry,
      reload,
      clearFormError,
    });
  });

  it('renders summary, accounts, and entries', () => {
    render(<Host />);
    expect(screen.getByTestId('screen-accounts-hub')).toBeTruthy();
    expect(screen.getByTestId('accounts-row-1')).toBeTruthy();
    expect(screen.getByTestId('account-entry-row-1')).toBeTruthy();
  });

  it('adds account through modal', async () => {
    render(<Host />);
    fireEvent.press(screen.getByTestId('accounts-add-account-open'));
    await waitFor(() => expect(screen.getByTestId('accounts-add-account-modal')).toBeTruthy());
    fireEvent.changeText(screen.getByTestId('accounts-name-input'), 'ICICI');
    fireEvent.changeText(screen.getByTestId('accounts-opening-balance-input'), '5000');
    fireEvent.press(screen.getByTestId('accounts-add-account-save'));
    await waitFor(() => {
      expect(addAccount).toHaveBeenCalledWith('ICICI', 'bank', '5000');
    });
  });

  it('adds entry through header action', async () => {
    render(<Host />);
    fireEvent.press(screen.getByTestId('accounts-header-add-entry'));
    await waitFor(() => expect(screen.getByTestId('accounts-add-entry-modal')).toBeTruthy());
    fireEvent.press(screen.getByTestId('accounts-entry-kind-income'));
    fireEvent.changeText(screen.getByTestId('accounts-entry-amount-input'), '2500');
    fireEvent.changeText(screen.getByTestId('accounts-entry-note-input'), 'Salary');
    fireEvent.press(screen.getByTestId('accounts-add-entry-save'));
    await waitFor(() => {
      expect(addEntry).toHaveBeenCalled();
    });
  });
});
