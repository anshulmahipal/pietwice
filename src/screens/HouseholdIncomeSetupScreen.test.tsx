/**
 * Unit: HouseholdIncomeSetupScreen — capture husband/wife income then continue.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HOUSEHOLD_INCOME_STORAGE_KEY } from '../householdIncome/householdIncomeStorage';
import { HouseholdIncomeSetupScreen } from './HouseholdIncomeSetupScreen';

describe('HouseholdIncomeSetupScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('saves incomes and calls onComplete when both amounts are valid', async () => {
    const onComplete = jest.fn();

    render(<HouseholdIncomeSetupScreen onComplete={onComplete} />);

    fireEvent.changeText(screen.getByTestId('household-income-husband'), '120000');
    fireEvent.changeText(screen.getByTestId('household-income-wife'), '95000');

    fireEvent.press(screen.getByTestId('household-income-continue'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });

    const raw = await AsyncStorage.getItem(HOUSEHOLD_INCOME_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual({
      husbandIncome: '120000',
      wifeIncome: '95000',
    });
  });

  it('shows error when a field is empty', async () => {
    const onComplete = jest.fn();

    render(<HouseholdIncomeSetupScreen onComplete={onComplete} />);

    fireEvent.changeText(screen.getByTestId('household-income-husband'), '100');
    fireEvent.press(screen.getByTestId('household-income-continue'));

    expect(
      await screen.findByText(/Enter a valid amount for both incomes/),
    ).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
