/**
 * Unit: useHouseExpenseDashboard — merge categories with spent map from DB.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  appendExpenseLineItems,
  loadExpenseCategoriesFromDb,
  loadCategorySpentMap,
  upsertCategorySpent,
} from '../expenseCategories/expenseCategoryDb';
import { useHouseExpenseDashboard } from './useHouseExpenseDashboard';

jest.mock('../expenseCategories/expenseCategoryDb', () => ({
  appendExpenseLineItems: jest.fn(() => Promise.resolve()),
  loadExpenseCategoriesFromDb: jest.fn(),
  loadCategorySpentMap: jest.fn(),
  upsertCategorySpent: jest.fn(() => Promise.resolve()),
  resetExpenseCategoryDbConnectionForTests: jest.fn(),
}));

const appendEntries = appendExpenseLineItems as jest.MockedFunction<typeof appendExpenseLineItems>;
const loadCats = loadExpenseCategoriesFromDb as jest.MockedFunction<
  typeof loadExpenseCategoriesFromDb
>;
const loadSpent = loadCategorySpentMap as jest.MockedFunction<typeof loadCategorySpentMap>;
const upsertSpent = upsertCategorySpent as jest.MockedFunction<typeof upsertCategorySpent>;

describe('useHouseExpenseDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadCats.mockResolvedValue([
      { title: 'Milk', amount: '100' },
      { title: 'Rent', amount: '5000' },
    ]);
    loadSpent.mockResolvedValue({ milk: '20' });
  });

  it('merges spent values by title key after refresh', async () => {
    const { result } = renderHook(() => useHouseExpenseDashboard());

    expect(result.current.isReady).toBe(false);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.isReady).toBe(true);
    expect(result.current.rows).toEqual([
      { title: 'Milk', amount: '100', spent: '20' },
      { title: 'Rent', amount: '5000', spent: '0' },
    ]);
  });

  it('saveSpent persists and refreshes merged rows', async () => {
    loadSpent.mockResolvedValueOnce({ milk: '20' }).mockResolvedValueOnce({ milk: '45' });

    const { result } = renderHook(() => useHouseExpenseDashboard());

    await act(async () => {
      await result.current.refresh();
    });

    await act(async () => {
      await result.current.saveSpent('Milk', '45', '2024-03-22');
    });

    expect(upsertSpent).toHaveBeenCalledWith('milk', '45', '2024-03-22');

    await waitFor(() => {
      expect(result.current.rows[0].spent).toBe('45');
    });
  });

  it('addExpenseEntries appends new bill entries and refreshes merged rows', async () => {
    loadSpent.mockResolvedValueOnce({ milk: '20' }).mockResolvedValueOnce({ milk: '35', grocery: '60' });

    const { result } = renderHook(() => useHouseExpenseDashboard());

    await act(async () => {
      await result.current.refresh();
    });

    await act(async () => {
      await result.current.addExpenseEntries(
        [
          { title: 'Milk', amount: '15' },
          { title: 'Grocery', amount: '60' },
        ],
        '2024-03-22',
      );
    });

    expect(appendEntries).toHaveBeenCalledWith(
      [
        { titleKey: 'milk', amount: '15' },
        { titleKey: 'grocery', amount: '60' },
      ],
      '2024-03-22',
    );

    await waitFor(() => {
      expect(result.current.rows[0].spent).toBe('35');
    });
  });
});
