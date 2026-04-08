/**
 * Unit: HouseholdBudgetOverviewScreen — edit category budgets during onboarding.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { HouseholdBudgetOverviewScreen } from './HouseholdBudgetOverviewScreen';

const mockLoadExpenseCategoriesFromDb = jest.fn();
const mockReplaceExpenseCategoriesInDb = jest.fn(() => Promise.resolve());

jest.mock('../expenseCategories/expenseCategoryDb', () => ({
  loadExpenseCategoriesFromDb: (...args: unknown[]) => mockLoadExpenseCategoriesFromDb(...args),
  replaceExpenseCategoriesInDb: (...args: unknown[]) => mockReplaceExpenseCategoriesInDb(...args),
}));

describe('HouseholdBudgetOverviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadExpenseCategoriesFromDb.mockResolvedValue([
      { title: 'Milk', amount: '100' },
      { title: 'Rent', amount: '5000' },
    ]);
  });

  it('loads categories and shows editable rows plus total', async () => {
    const onComplete = jest.fn();

    render(<HouseholdBudgetOverviewScreen onComplete={onComplete} />);

    expect(screen.getByTestId('household-budget-overview-loading')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId('household-budget-overview-screen')).toBeTruthy();
    });

    expect(mockLoadExpenseCategoriesFromDb).toHaveBeenCalled();
    expect(screen.getByDisplayValue('Milk')).toBeTruthy();
    expect(screen.getByDisplayValue('Rent')).toBeTruthy();
    expect(screen.getByTestId('household-budget-total')).toBeTruthy();
  });

  it('persists categories and calls onComplete when Continue is pressed', async () => {
    const onComplete = jest.fn();

    render(<HouseholdBudgetOverviewScreen onComplete={onComplete} />);

    await waitFor(() => {
      expect(screen.getByTestId('household-budget-overview-screen')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('household-budget-continue'));

    await waitFor(() => {
      expect(mockReplaceExpenseCategoriesInDb).toHaveBeenCalledWith([
        { title: 'Milk', amount: '100' },
        { title: 'Rent', amount: '5000' },
      ]);
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('removes a category when delete is pressed', async () => {
    const onComplete = jest.fn();

    render(<HouseholdBudgetOverviewScreen onComplete={onComplete} />);

    await waitFor(() => {
      expect(screen.getByTestId('household-budget-overview-screen')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('household-budget-delete-0'));

    fireEvent.press(screen.getByTestId('household-budget-continue'));

    await waitFor(() => {
      expect(mockReplaceExpenseCategoriesInDb).toHaveBeenCalledWith([
        { title: 'Rent', amount: '5000' },
      ]);
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('adds a category in memory before save', async () => {
    const onComplete = jest.fn();

    render(<HouseholdBudgetOverviewScreen onComplete={onComplete} />);

    await waitFor(() => {
      expect(screen.getByTestId('household-budget-overview-screen')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('household-budget-add-open'));

    fireEvent.changeText(screen.getByTestId('household-budget-new-title'), 'Fuel');
    fireEvent.changeText(screen.getByTestId('household-budget-new-amount'), '2000');
    fireEvent.press(screen.getByTestId('household-budget-add'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fuel')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('household-budget-continue'));

    await waitFor(() => {
      expect(mockReplaceExpenseCategoriesInDb).toHaveBeenCalledWith([
        { title: 'Milk', amount: '100' },
        { title: 'Rent', amount: '5000' },
        { title: 'Fuel', amount: '2000' },
      ]);
    });
  });
});
