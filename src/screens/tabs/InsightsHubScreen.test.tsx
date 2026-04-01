import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { InsightsHubScreen } from './InsightsHubScreen';

jest.mock('../../insights/useInsightsOverview', () => ({
  useInsightsOverview: () => ({
    isReady: true,
    thisMonthExpense: 8000,
    thisMonthIncome: 20000,
    thisMonthNet: 12000,
    totalBalance: 50000,
    fyLabel: 'FY 2026-27',
    fyExpenseToDate: 24000,
    fyIncomeToDate: 60000,
    upcomingBillsCount: 3,
    upcomingBillsTotal: 6000,
    budgetRisks: [
      {
        periodType: 'monthly',
        periodLabel: 'Monthly',
        budgetAmount: 20000,
        spentAmount: 17000,
        usagePercent: 85,
      },
    ],
    reload: jest.fn(async () => {}),
  }),
}));

const Stack = createNativeStackNavigator();

function Host() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="InsightsHub" component={InsightsHubScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('InsightsHubScreen', () => {
  it('renders insights blocks and budget risk', () => {
    render(<Host />);
    expect(screen.getByTestId('screen-insights-hub')).toBeTruthy();
    expect(screen.getByText('FY 2026-27 to date')).toBeTruthy();
    expect(screen.getByTestId('insight-risk-monthly')).toBeTruthy();
  });
});
