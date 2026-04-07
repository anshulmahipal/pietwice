/**
 * Unit: Profile stack home — finance entry rows, change entry PIN modal.
 */
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { PinSessionContext } from '../../auth/PinSessionContext';
import { ProfileStack } from '../../navigation/ProfileStack';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('react-native-calendars', () => {
  const ReactNs = require('react');
  const { View } = require('react-native');
  return {
    Calendar: () =>
      ReactNs.createElement(View, { testID: 'mock-profile-hub-calendar-widget' }),
  };
});

jest.mock('../../budgets/useBudgetsOverview', () => ({
  useBudgetsOverview: () => ({
    rows: [
      {
        periodType: 'weekly',
        periodLabel: 'Weekly',
        amount: '2000',
        spent: 500,
        statusLabel: 'On track',
        rangeLabel: '2026-04-13 to 2026-04-19',
      },
    ],
    isReady: true,
    isSaving: false,
    formError: null,
    saveBudget: jest.fn(async () => true),
    reload: jest.fn(async () => {}),
    clearFormError: jest.fn(),
  }),
}));

jest.mock('../../accounts/useAccountsLedger', () => ({
  useAccountsLedger: () => ({
    accounts: [{ id: 1, accountName: 'HDFC', accountType: 'bank', currentBalance: '1000' }],
    recentEntries: [],
    monthlyIncome: 0,
    monthlyExpense: 0,
    totalBalance: 1000,
    isReady: true,
    isSaving: false,
    formError: null,
    addAccount: jest.fn(async () => true),
    addEntry: jest.fn(async () => true),
    reload: jest.fn(async () => {}),
    clearFormError: jest.fn(),
  }),
}));

jest.mock('../../investments/useInvestments', () => ({
  useInvestments: () => ({
    holdings: [],
    isReady: true,
    isSaving: false,
    formError: null,
    addHolding: jest.fn(async () => true),
    clearFormError: jest.fn(),
  }),
}));

jest.mock('../../insurancePolicies/useInsurancePolicies', () => ({
  useInsurancePolicies: () => ({
    policies: [],
    isReady: true,
    isSaving: false,
    formError: null,
    addPolicy: jest.fn(async () => true),
    clearFormError: jest.fn(),
  }),
}));

jest.mock('../../insights/useInsightsOverview', () => ({
  useInsightsOverview: () => ({
    isReady: true,
    thisMonthExpense: 1000,
    thisMonthIncome: 2000,
    thisMonthNet: 1000,
    totalBalance: 5000,
    fyLabel: 'FY 2026-27',
    fyExpenseToDate: 10000,
    fyIncomeToDate: 20000,
    upcomingBillsCount: 2,
    upcomingBillsTotal: 4000,
    budgetRisks: [],
    reload: jest.fn(async () => {}),
  }),
}));

const getItemAsync = SecureStore.getItemAsync as jest.Mock;

function renderProfileStack() {
  return render(
    <PinSessionContext.Provider value={{ replaceStoredPin: jest.fn() }}>
      <NavigationContainer>
        <ProfileStack />
      </NavigationContainer>
    </PinSessionContext.Provider>,
  );
}

describe('Profile stack (home)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows finance entry rows and change entry PIN', () => {
    renderProfileStack();

    expect(screen.getByTestId('screen-profile')).toBeTruthy();
    expect(screen.getByLabelText('Open insights hub')).toBeTruthy();
    expect(screen.getByLabelText('Open accounts hub')).toBeTruthy();
    expect(screen.getByLabelText('Open budgets hub')).toBeTruthy();
    expect(screen.getByLabelText('Open investments hub')).toBeTruthy();
    expect(screen.getByLabelText('Open insurance hub')).toBeTruthy();
    expect(screen.getByLabelText('Change entry PIN')).toBeTruthy();
  });

  it('navigates to budgets hub', async () => {
    renderProfileStack();

    fireEvent.press(screen.getByLabelText('Open budgets hub'));

    await waitFor(() => {
      expect(screen.getByTestId('screen-budget-hub')).toBeTruthy();
    });
  });

  it('navigates to accounts hub', async () => {
    renderProfileStack();

    fireEvent.press(screen.getByLabelText('Open accounts hub'));

    await waitFor(() => {
      expect(screen.getByTestId('screen-accounts-hub')).toBeTruthy();
    });
  });

  it('navigates to insights hub', async () => {
    renderProfileStack();

    fireEvent.press(screen.getByLabelText('Open insights hub'));

    await waitFor(() => {
      expect(screen.getByTestId('screen-insights-hub')).toBeTruthy();
    });
  });

  it('navigates to investments hub layout', async () => {
    renderProfileStack();

    fireEvent.press(screen.getByLabelText('Open investments hub'));

    await waitFor(() => {
      expect(screen.getByTestId('screen-investment-hub')).toBeTruthy();
    });
    expect(screen.getByText('Holdings tracked')).toBeTruthy();
    expect(screen.getByTestId('investment-hub-count-value')).toHaveTextContent('0');
  });

  it('navigates to insurance hub layout', async () => {
    renderProfileStack();

    fireEvent.press(screen.getByLabelText('Open insurance hub'));

    await waitFor(() => {
      expect(screen.getByTestId('screen-insurance-hub')).toBeTruthy();
    });
    expect(screen.getByText('Policies tracked')).toBeTruthy();
    expect(screen.getByTestId('insurance-hub-count-value')).toHaveTextContent('0');
  });

  it('opens change-PIN modal with current PIN step after pressing change', async () => {
    getItemAsync.mockResolvedValue('4242');

    renderProfileStack();

    fireEvent.press(screen.getByLabelText('Change entry PIN'));

    expect(await screen.findByTestId('profile-change-pin-modal')).toBeTruthy();
    expect(screen.getByText('Enter current PIN')).toBeTruthy();
    expect(getItemAsync).toHaveBeenCalled();
  });
});
