import { useCallback, useEffect, useState } from 'react';
import {
  insertBill,
  loadBillsFromDb,
  type InsertBillInput,
} from './billsDb';
import {
  normalizeBillName,
  normalizePaymentUrl,
  normalizeProviderName,
  parseBillAmount,
  parseBillDueDay,
  parseOneTimeDueDateYmd,
  parseReminderDaysBefore,
  type BillRecurrenceType,
  type BillRow,
} from './billsLogic';

export function useBills() {
  const [bills, setBills] = useState<BillRow[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const rows = await loadBillsFromDb();
    setBills(rows);
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

  const addBill = useCallback(
    async (
      billNameRaw: string,
      providerRaw: string,
      amountRaw: string,
      recurrenceType: BillRecurrenceType,
      dueDayRaw: string,
      oneTimeDueDateRaw: string,
      reminderDaysRaw: string,
      paymentUrlRaw: string,
    ) => {
      setFormError(null);

      const billName = normalizeBillName(billNameRaw);
      if (billName === '') {
        setFormError('Enter a bill name.');
        return false;
      }
      const providerName = normalizeProviderName(providerRaw);

      const amount = parseBillAmount(amountRaw);
      if (!amount.ok) {
        setFormError(amount.error);
        return false;
      }

      const reminderDays = parseReminderDaysBefore(reminderDaysRaw);
      if (!reminderDays.ok) {
        setFormError(reminderDays.error);
        return false;
      }

      let dueDay: number | null = null;
      let dueDateYmd: string | null = null;
      if (recurrenceType === 'monthly') {
        const parsedDueDay = parseBillDueDay(dueDayRaw);
        if (!parsedDueDay.ok) {
          setFormError(parsedDueDay.error);
          return false;
        }
        dueDay = parsedDueDay.day;
      } else {
        const parsedDueDate = parseOneTimeDueDateYmd(oneTimeDueDateRaw);
        if (!parsedDueDate.ok) {
          setFormError(parsedDueDate.error);
          return false;
        }
        dueDateYmd = parsedDueDate.ymd;
      }

      const input: InsertBillInput = {
        billName,
        providerName,
        amount: amount.amount,
        recurrenceType,
        dueDay,
        dueDateYmd,
        reminderDaysBefore: reminderDays.days,
        paymentUrl: normalizePaymentUrl(paymentUrlRaw),
      };

      setIsSaving(true);
      try {
        await insertBill(input);
        await reload();
        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  return {
    bills,
    isReady,
    isSaving,
    formError,
    addBill,
    clearFormError: () => setFormError(null),
  };
}
