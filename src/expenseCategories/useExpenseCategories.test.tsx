/**
 * Unit: useExpenseCategories — in-memory edits and explicit SQLite save.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { DEFAULT_EXPENSE_CATEGORY_ROWS } from './defaultExpenseCategories';
import {
  loadExpenseCategoriesFromDb,
  replaceExpenseCategoriesInDb,
} from './expenseCategoryDb';
import { useExpenseCategories } from './useExpenseCategories';

jest.mock('./expenseCategoryDb', () => ({
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

describe('useExpenseCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadMock.mockResolvedValue([...DEFAULT_EXPENSE_CATEGORY_ROWS]);
  });

  it('loads categories from the database layer when storage is empty', async () => {
    const { result } = renderHook(() => useExpenseCategories());

    expect(result.current.isReady).toBe(false);

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.categories).toEqual(DEFAULT_EXPENSE_CATEGORY_ROWS);
    expect(loadMock).toHaveBeenCalled();
  });

  it('does not write to SQLite until saveCategories is called', async () => {
    const { result } = renderHook(() => useExpenseCategories());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    act(() => {
      result.current.addCategory('Car wash', '80');
    });

    expect(replaceMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.saveCategories();
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock.mock.calls[0][0]).toEqual(
      expect.arrayContaining([{ title: 'Car wash', amount: '80' }]),
    );
  });

  it('updates amount in memory and persists on save', async () => {
    loadMock.mockResolvedValue([{ title: 'Milk', amount: '' }]);

    const { result } = renderHook(() => useExpenseCategories());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    act(() => {
      result.current.updateCategoryAmount(0, '45');
    });

    await act(async () => {
      await result.current.saveCategories();
    });

    expect(replaceMock).toHaveBeenCalledWith([{ title: 'Milk', amount: '45' }]);
  });

  it('removeCategoryAt drops a row in memory and does nothing when only one category remains', async () => {
    loadMock.mockResolvedValue([
      { title: 'Milk', amount: '10' },
      { title: 'Rent', amount: '20' },
    ]);

    const { result } = renderHook(() => useExpenseCategories());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    act(() => {
      result.current.removeCategoryAt(0);
    });

    expect(result.current.categories).toEqual([{ title: 'Rent', amount: '20' }]);

    act(() => {
      result.current.removeCategoryAt(0);
    });

    expect(result.current.categories).toEqual([{ title: 'Rent', amount: '20' }]);
  });
});
