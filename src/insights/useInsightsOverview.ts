import { useCallback, useEffect, useState } from 'react';
import { loadAccountsFromDb, loadCashflowTotalsForRange } from '../accounts/accountDb';
import { parseAmountValue } from '../accounts/accountLogic';
import { loadBillsFromDb } from '../bills/billsDb';
import { buildBillsDueEntriesInRange } from '../bills/billsLogic';
import { loadBudgetPlans } from '../budgets/budgetDb';
import { currentPeriodRangeYmd, parseBudgetAmountValue, periodLabel, type BudgetPeriodType } from '../budgets/budgetLogic';
import { loadExpenseTotalForRange } from '../expenseCategories/expenseCategoryDb';
import { monthYmdRange, toExpenseDateYmd } from '../houseExpense/expenseDate';
import { financialYearLabel, financialYearRangeYmd } from '../localization/indiaFormat';

export type InsightBudgetRiskRow = {
  periodType: BudgetPeriodType;
  periodLabel: string;
  budgetAmount: number;
  spentAmount: number;
  usagePercent: number;
};

export type InsightsOverview = {
  isReady: boolean;
  thisMonthExpense: number;
  thisMonthIncome: number;
  thisMonthNet: number;
  totalBalance: number;
  fyLabel: string;
  fyExpenseToDate: number;
  fyIncomeToDate: number;
  upcomingBillsCount: number;
  upcomingBillsTotal: number;
  budgetRisks: InsightBudgetRiskRow[];
  reload: () => Promise<void>;
};

export function useInsightsOverview(): InsightsOverview {
  const [isReady, setIsReady] = useState(false);
  const [thisMonthExpense, setThisMonthExpense] = useState(0);
  const [thisMonthIncome, setThisMonthIncome] = useState(0);
  const [thisMonthNet, setThisMonthNet] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [fyExpenseToDate, setFyExpenseToDate] = useState(0);
  const [fyIncomeToDate, setFyIncomeToDate] = useState(0);
  const [upcomingBillsCount, setUpcomingBillsCount] = useState(0);
  const [upcomingBillsTotal, setUpcomingBillsTotal] = useState(0);
  const [budgetRisks, setBudgetRisks] = useState<InsightBudgetRiskRow[]>([]);

  const reload = useCallback(async () => {
    const now = new Date();
    const monthRange = monthYmdRange(now.getFullYear(), now.getMonth());
    const fyRange = financialYearRangeYmd(now);
    const todayYmd = toExpenseDateYmd(now);
    const upcomingEnd = toExpenseDateYmd(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30),
    );

    const [monthExpense, monthCashflow, fyExpense, fyCashflow, accounts, bills, budgetPlans] =
      await Promise.all([
        loadExpenseTotalForRange(monthRange.startYmd, monthRange.endYmd),
        loadCashflowTotalsForRange(monthRange.startYmd, monthRange.endYmd),
        loadExpenseTotalForRange(fyRange.startYmd, todayYmd),
        loadCashflowTotalsForRange(fyRange.startYmd, todayYmd),
        loadAccountsFromDb(),
        loadBillsFromDb(),
        loadBudgetPlans(),
      ]);

    setThisMonthExpense(monthExpense);
    setThisMonthIncome(monthCashflow.incomeTotal);
    setThisMonthNet(monthCashflow.incomeTotal - monthCashflow.expenseTotal);
    setFyExpenseToDate(fyExpense);
    setFyIncomeToDate(fyCashflow.incomeTotal);
    setTotalBalance(accounts.reduce((sum, a) => sum + parseAmountValue(a.currentBalance), 0));

    const dueEntries = buildBillsDueEntriesInRange(todayYmd, upcomingEnd, bills);
    setUpcomingBillsCount(dueEntries.length);
    setUpcomingBillsTotal(dueEntries.reduce((sum, e) => sum + parseAmountValue(e.amount), 0));

    const risks: InsightBudgetRiskRow[] = [];
    for (const plan of budgetPlans) {
      const range = currentPeriodRangeYmd(plan.periodType, now);
      const spent = await loadExpenseTotalForRange(range.startYmd, range.endYmd);
      const budgetAmount = parseBudgetAmountValue(plan.amount);
      if (budgetAmount <= 0) {
        continue;
      }
      const usagePercent = Math.round((spent / budgetAmount) * 100);
      risks.push({
        periodType: plan.periodType,
        periodLabel: periodLabel(plan.periodType),
        budgetAmount,
        spentAmount: spent,
        usagePercent,
      });
    }
    risks.sort((a, b) => b.usagePercent - a.usagePercent);
    setBudgetRisks(risks);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await reload();
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  return {
    isReady,
    thisMonthExpense,
    thisMonthIncome,
    thisMonthNet,
    totalBalance,
    fyLabel: financialYearLabel(),
    fyExpenseToDate,
    fyIncomeToDate,
    upcomingBillsCount,
    upcomingBillsTotal,
    budgetRisks,
    reload,
  };
}
