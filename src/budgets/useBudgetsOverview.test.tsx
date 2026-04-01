import { act, renderHook, waitFor } from '@testing-library/react-native';
import { loadExpenseTotalForRange } from '../expenseCategories/expenseCategoryDb';
import { loadBudgetPlans, upsertBudgetPlan } from './budgetDb';
import { useBudgetsOverview } from './useBudgetsOverview';

jest.mock('./budgetDb', () => ({
  loadBudgetPlans: jest.fn(),
  upsertBudgetPlan: jest.fn(() => Promise.resolve()),
}));

jest.mock('../expenseCategories/expenseCategoryDb', () => ({
  loadExpenseTotalForRange: jest.fn(),
}));

const loadPlansMock = loadBudgetPlans as jest.MockedFunction<typeof loadBudgetPlans>;
const upsertMock = upsertBudgetPlan as jest.MockedFunction<typeof upsertBudgetPlan>;
const loadSpentMock = loadExpenseTotalForRange as jest.MockedFunction<typeof loadExpenseTotalForRange>;

describe('useBudgetsOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadPlansMock.mockResolvedValue([{ periodType: 'monthly', amount: '10000', updatedAt: 'x' }]);
    loadSpentMock.mockResolvedValue(3000);
  });

  it('loads rows with statuses', async () => {
    const { result } = renderHook(() => useBudgetsOverview());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(result.current.rows.length).toBe(3);
    const monthly = result.current.rows.find((r) => r.periodType === 'monthly');
    expect(monthly?.amount).toBe('10000');
    expect(monthly?.spent).toBe(3000);
    expect(monthly?.statusLabel).toBe('On track');
  });

  it('validates before saving', async () => {
    const { result } = renderHook(() => useBudgetsOverview());
    await waitFor(() => expect(result.current.isReady).toBe(true));

    let ok = true;
    await act(async () => {
      ok = await result.current.saveBudget('weekly', '');
    });
    expect(ok).toBe(false);
    expect(result.current.formError).toBe('Enter budget amount.');
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('upserts and reloads on save', async () => {
    const { result } = renderHook(() => useBudgetsOverview());
    await waitFor(() => expect(result.current.isReady).toBe(true));

    let ok = false;
    await act(async () => {
      ok = await result.current.saveBudget('weekly', '4000');
    });
    expect(ok).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith('weekly', '4000');
  });
});
