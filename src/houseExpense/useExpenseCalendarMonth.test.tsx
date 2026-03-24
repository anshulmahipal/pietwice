/**
 * Unit: useExpenseCalendarMonth — load month totals from DB helpers.
 */
import { act, renderHook } from '@testing-library/react-native';
import {
  loadExpenseDayTotalsForMonth,
  loadExpenseLineItemsForDay,
} from '../expenseCategories/expenseCategoryDb';
import { useExpenseCalendarMonth } from './useExpenseCalendarMonth';

jest.mock('../expenseCategories/expenseCategoryDb', () => ({
  loadExpenseDayTotalsForMonth: jest.fn(),
  loadExpenseLineItemsForDay: jest.fn(),
}));

const loadTotals = loadExpenseDayTotalsForMonth as jest.MockedFunction<
  typeof loadExpenseDayTotalsForMonth
>;
const loadLines = loadExpenseLineItemsForDay as jest.MockedFunction<typeof loadExpenseLineItemsForDay>;

describe('useExpenseCalendarMonth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadTotals.mockResolvedValue({ '2024-06-10': 30 });
    loadLines.mockResolvedValue([]);
  });

  it('reloadDayTotals fills dayTotals for the visible month', async () => {
    const anchor = new Date(2024, 5, 1);
    const { result } = renderHook(() => useExpenseCalendarMonth(anchor));

    await act(async () => {
      await result.current.reloadDayTotals();
    });

    expect(loadTotals).toHaveBeenCalledWith(2024, 5);
    expect(result.current.dayTotals).toEqual({ '2024-06-10': 30 });
  });

  it('loadLinesForDay delegates to DB', async () => {
    loadLines.mockResolvedValueOnce([
      { id: 1, titleKey: 'milk', amount: '10', expenseDate: '2024-06-10' },
    ]);
    const { result } = renderHook(() => useExpenseCalendarMonth(new Date(2024, 5, 1)));

    let lines: Awaited<ReturnType<typeof loadLines>> = [];
    await act(async () => {
      lines = await result.current.loadLinesForDay('2024-06-10');
    });

    expect(loadLines).toHaveBeenCalledWith('2024-06-10');
    expect(lines).toEqual([{ id: 1, titleKey: 'milk', amount: '10', expenseDate: '2024-06-10' }]);
  });
});
