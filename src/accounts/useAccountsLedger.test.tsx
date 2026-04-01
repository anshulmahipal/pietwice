import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  insertAccount,
  insertAccountEntry,
  loadAccountsFromDb,
  loadCurrentMonthCashflowTotals,
  loadRecentAccountEntries,
} from './accountDb';
import { useAccountsLedger } from './useAccountsLedger';

jest.mock('./accountDb', () => ({
  loadAccountsFromDb: jest.fn(),
  loadRecentAccountEntries: jest.fn(),
  loadCurrentMonthCashflowTotals: jest.fn(),
  insertAccount: jest.fn(() => Promise.resolve()),
  insertAccountEntry: jest.fn(() => Promise.resolve()),
}));

const loadAccountsMock = loadAccountsFromDb as jest.MockedFunction<typeof loadAccountsFromDb>;
const loadEntriesMock = loadRecentAccountEntries as jest.MockedFunction<typeof loadRecentAccountEntries>;
const loadTotalsMock = loadCurrentMonthCashflowTotals as jest.MockedFunction<typeof loadCurrentMonthCashflowTotals>;
const insertAccountMock = insertAccount as jest.MockedFunction<typeof insertAccount>;
const insertEntryMock = insertAccountEntry as jest.MockedFunction<typeof insertAccountEntry>;

describe('useAccountsLedger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadAccountsMock.mockResolvedValue([
      { id: 1, accountName: 'HDFC', accountType: 'bank', currentBalance: '1000' },
    ]);
    loadEntriesMock.mockResolvedValue([]);
    loadTotalsMock.mockResolvedValue({ incomeTotal: 3000, expenseTotal: 1200 });
  });

  it('loads accounts and totals', async () => {
    const { result } = renderHook(() => useAccountsLedger());
    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.totalBalance).toBe(1000);
    expect(result.current.monthlyIncome).toBe(3000);
    expect(result.current.monthlyExpense).toBe(1200);
  });

  it('validates account add form', async () => {
    const { result } = renderHook(() => useAccountsLedger());
    await waitFor(() => expect(result.current.isReady).toBe(true));

    let ok = true;
    await act(async () => {
      ok = await result.current.addAccount('', 'bank', '100');
    });
    expect(ok).toBe(false);
    expect(result.current.formError).toBe('Enter account name.');
    expect(insertAccountMock).not.toHaveBeenCalled();
  });

  it('adds account and entry', async () => {
    const { result } = renderHook(() => useAccountsLedger());
    await waitFor(() => expect(result.current.isReady).toBe(true));

    let ok = false;
    await act(async () => {
      ok = await result.current.addAccount('ICICI', 'bank', '5000');
    });
    expect(ok).toBe(true);
    expect(insertAccountMock).toHaveBeenCalledWith('ICICI', 'bank', '5000');

    await act(async () => {
      ok = await result.current.addEntry(1, 'income', '2000', 'Salary', new Date(2026, 3, 2));
    });
    expect(ok).toBe(true);
    expect(insertEntryMock).toHaveBeenCalled();
  });
});
