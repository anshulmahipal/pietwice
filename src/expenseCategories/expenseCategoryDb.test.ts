/**
 * Unit: ExpenseCategoryDb — SQLite load/replace and AsyncStorage legacy migration.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_EXPENSE_CATEGORY_ROWS } from './defaultExpenseCategories';
import {
  LEGACY_EXPENSE_CATEGORY_STORAGE_KEY,
  loadExpenseCategoriesFromDb,
  replaceExpenseCategoriesInDb,
  resetExpenseCategoryDbConnectionForTests,
} from './expenseCategoryDb';

const mockExecAsync = jest.fn(() => Promise.resolve());
const mockGetAllAsync = jest.fn();
const mockRunAsync = jest.fn(() => Promise.resolve());
const mockWithTransactionAsync = jest.fn(async (task: () => Promise<void>) => {
  await task();
});

const PRAGMA_CATEGORY_SPENT_OK = [
  { name: 'title_key' },
  { name: 'spent' },
  { name: 'expense_date' },
];

function mockGetAllForInitAndCountThenSelect(
  count: number,
  selectRows: { sort_index: number; title: string; amount: string }[],
): void {
  mockGetAllAsync
    .mockResolvedValueOnce(PRAGMA_CATEGORY_SPENT_OK)
    .mockResolvedValueOnce([{ c: count }])
    .mockResolvedValueOnce(selectRows);
}

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: mockExecAsync,
      getAllAsync: mockGetAllAsync,
      runAsync: mockRunAsync,
      withTransactionAsync: mockWithTransactionAsync,
    }),
  ),
}));

describe('ExpenseCategoryDb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    resetExpenseCategoryDbConnectionForTests();
    mockGetAllAsync.mockReset();
    mockGetAllAsync.mockResolvedValue(PRAGMA_CATEGORY_SPENT_OK);
  });

  it('replaceExpenseCategoriesInDb clears and inserts rows in order', async () => {
    await replaceExpenseCategoriesInDb([
      { title: 'A', amount: '1' },
      { title: 'B', amount: '2' },
    ]);

    expect(mockWithTransactionAsync).toHaveBeenCalled();
    expect(mockExecAsync).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM'));
    expect(mockRunAsync).toHaveBeenCalledTimes(2);
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT'),
      0,
      'A',
      '1',
    );
    expect(mockRunAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT'),
      1,
      'B',
      '2',
    );
  });

  it('loadExpenseCategoriesFromDb returns rows when table has data', async () => {
    mockGetAllForInitAndCountThenSelect(2, [
      { sort_index: 0, title: 'X', amount: '10' },
      { sort_index: 1, title: 'Y', amount: '' },
    ]);

    const rows = await loadExpenseCategoriesFromDb();

    expect(rows).toEqual([
      { title: 'X', amount: '10' },
      { title: 'Y', amount: '' },
    ]);
  });

  it('loadExpenseCategoriesFromDb returns default rows when DB and legacy storage are empty', async () => {
    mockGetAllAsync
      .mockResolvedValueOnce(PRAGMA_CATEGORY_SPENT_OK)
      .mockResolvedValueOnce([{ c: 0 }]);

    const rows = await loadExpenseCategoriesFromDb();

    expect(rows).toEqual(DEFAULT_EXPENSE_CATEGORY_ROWS);
    expect(mockWithTransactionAsync).not.toHaveBeenCalled();
  });

  it('loadExpenseCategoriesFromDb migrates legacy AsyncStorage into SQLite when DB is empty', async () => {
    mockGetAllAsync
      .mockResolvedValueOnce(PRAGMA_CATEGORY_SPENT_OK)
      .mockResolvedValueOnce([{ c: 0 }]);
    await AsyncStorage.setItem(
      LEGACY_EXPENSE_CATEGORY_STORAGE_KEY,
      JSON.stringify([{ title: 'Legacy', amount: '99' }]),
    );

    const rows = await loadExpenseCategoriesFromDb();

    expect(rows).toEqual([{ title: 'Legacy', amount: '99' }]);
    expect(mockWithTransactionAsync).toHaveBeenCalled();
    expect(await AsyncStorage.getItem(LEGACY_EXPENSE_CATEGORY_STORAGE_KEY)).toBeNull();
  });
});
