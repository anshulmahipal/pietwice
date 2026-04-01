import { act, renderHook, waitFor } from '@testing-library/react-native';
import { loadAccountsFromDb, loadCashflowTotalsForRange } from '../accounts/accountDb';
import { loadBillsFromDb } from '../bills/billsDb';
import { loadBudgetPlans } from '../budgets/budgetDb';
import { loadExpenseTotalForRange } from '../expenseCategories/expenseCategoryDb';
import { useInsightsOverview } from './useInsightsOverview';

jest.mock('../accounts/accountDb', () => ({
  loadAccountsFromDb: jest.fn(),
  loadCashflowTotalsForRange: jest.fn(),
}));

jest.mock('../expenseCategories/expenseCategoryDb', () => ({
  loadExpenseTotalForRange: jest.fn(),
}));

jest.mock('../bills/billsDb', () => ({
  loadBillsFromDb: jest.fn(),
}));

jest.mock('../budgets/budgetDb', () => ({
  loadBudgetPlans: jest.fn(),
}));

const loadAccountsMock = loadAccountsFromDb as jest.MockedFunction<typeof loadAccountsFromDb>;
const loadCashflowMock = loadCashflowTotalsForRange as jest.MockedFunction<typeof loadCashflowTotalsForRange>;
const loadExpenseMock = loadExpenseTotalForRange as jest.MockedFunction<typeof loadExpenseTotalForRange>;
const loadBillsMock = loadBillsFromDb as jest.MockedFunction<typeof loadBillsFromDb>;
const loadBudgetPlansMock = loadBudgetPlans as jest.MockedFunction<typeof loadBudgetPlans>;

describe('useInsightsOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadAccountsMock.mockResolvedValue([
      { id: 1, accountName: 'HDFC', accountType: 'bank', currentBalance: '5000' },
    ]);
    loadCashflowMock.mockResolvedValue({ incomeTotal: 20000, expenseTotal: 8000 });
    loadExpenseMock.mockResolvedValue(7000);
    loadBillsMock.mockResolvedValue([
      {
        id: 1,
        billName: 'Electricity',
        providerName: 'BESCOM',
        amount: '1200',
        recurrenceType: 'monthly',
        dueDay: 10,
        dueDateYmd: null,
        reminderDaysBefore: 2,
        paymentUrl: '',
        isActive: true,
      },
    ]);
    loadBudgetPlansMock.mockResolvedValue([
      { periodType: 'monthly', amount: '10000', updatedAt: 'x' },
    ]);
  });

  it('loads key insights', async () => {
    const { result } = renderHook(() => useInsightsOverview());
    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.thisMonthExpense).toBe(7000);
    expect(result.current.thisMonthIncome).toBe(20000);
    expect(result.current.totalBalance).toBe(5000);
    expect(result.current.budgetRisks.length).toBeGreaterThanOrEqual(1);
  });

  it('supports manual reload', async () => {
    const { result } = renderHook(() => useInsightsOverview());
    await waitFor(() => expect(result.current.isReady).toBe(true));
    await act(async () => {
      await result.current.reload();
    });
    expect(loadBillsMock).toHaveBeenCalled();
  });
});
