import { useCallback, useEffect, useMemo, useState } from 'react';
import { toExpenseDateYmd } from '../houseExpense/expenseDate';
import {
  insertAccount,
  insertAccountEntry,
  loadAccountsFromDb,
  loadCurrentMonthCashflowTotals,
  loadRecentAccountEntries,
  type AccountEntryRow,
  type AccountRow,
} from './accountDb';
import {
  normalizeAccountName,
  parseAmountValue,
  parseCurrencyAmount,
  type AccountType,
  type LedgerEntryKind,
} from './accountLogic';

export function useAccountsLedger() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [recentEntries, setRecentEntries] = useState<AccountEntryRow[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [nextAccounts, nextEntries, totals] = await Promise.all([
      loadAccountsFromDb(),
      loadRecentAccountEntries(),
      loadCurrentMonthCashflowTotals(),
    ]);
    setAccounts(nextAccounts);
    setRecentEntries(nextEntries);
    setMonthlyIncome(totals.incomeTotal);
    setMonthlyExpense(totals.expenseTotal);
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

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + parseAmountValue(account.currentBalance), 0),
    [accounts],
  );

  const addAccount = useCallback(
    async (accountNameRaw: string, accountType: AccountType, openingBalanceRaw: string) => {
      setFormError(null);
      const accountName = normalizeAccountName(accountNameRaw);
      if (accountName === '') {
        setFormError('Enter account name.');
        return false;
      }
      const opening = parseCurrencyAmount(openingBalanceRaw, 'Enter opening balance.');
      if (!opening.ok) {
        setFormError(opening.error);
        return false;
      }
      setIsSaving(true);
      try {
        await insertAccount(accountName, accountType, opening.amount);
        await reload();
        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const addEntry = useCallback(
    async (
      accountId: number | null,
      entryKind: LedgerEntryKind,
      amountRaw: string,
      noteRaw: string,
      entryDate: Date,
    ) => {
      setFormError(null);
      if (accountId === null) {
        setFormError('Choose an account.');
        return false;
      }
      const amount = parseCurrencyAmount(amountRaw, 'Enter amount.');
      if (!amount.ok) {
        setFormError(amount.error);
        return false;
      }
      setIsSaving(true);
      try {
        await insertAccountEntry(accountId, entryKind, amount.amount, noteRaw, toExpenseDateYmd(entryDate));
        await reload();
        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  return {
    accounts,
    recentEntries,
    monthlyIncome,
    monthlyExpense,
    totalBalance,
    isReady,
    isSaving,
    formError,
    addAccount,
    addEntry,
    reload,
    clearFormError: () => setFormError(null),
  };
}
