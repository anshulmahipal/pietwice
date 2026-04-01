import { monthYmdRange, parseExpenseDateYmd, toExpenseDateYmd } from '../houseExpense/expenseDate';

export type BillRecurrenceType = 'monthly' | 'one_time';

export type BillRow = {
  id: number;
  billName: string;
  providerName: string;
  amount: string;
  recurrenceType: BillRecurrenceType;
  dueDay: number | null;
  dueDateYmd: string | null;
  reminderDaysBefore: number;
  paymentUrl: string;
  isActive: boolean;
};

export type BillDueEntry = {
  id: number;
  billName: string;
  providerName: string;
  amount: string;
  dueDateYmd: string;
};

export type BillDueEntryWithDate = BillDueEntry;

export function normalizeBillName(raw: string): string {
  return raw.trim();
}

export function normalizeProviderName(raw: string): string {
  return raw.trim();
}

export function normalizePaymentUrl(raw: string): string {
  return raw.trim();
}

export function formatRegisteredBillCountLabel(count: number): string {
  if (count === 0) {
    return 'No bills';
  }
  if (count === 1) {
    return '1 bill';
  }
  return `${count} bills`;
}

export type ParseAmountResult =
  | { ok: true; amount: string }
  | { ok: false; error: string };

export function parseBillAmount(raw: string): ParseAmountResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, error: 'Enter bill amount.' };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { ok: false, error: 'Use a valid amount (up to 2 decimals).' };
  }
  return { ok: true, amount: trimmed };
}

export type ParseReminderDaysResult =
  | { ok: true; days: number }
  | { ok: false; error: string };

export function parseReminderDaysBefore(raw: string): ParseReminderDaysResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: true, days: 1 };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: 'Reminder days must be a whole number.' };
  }
  const days = Number(trimmed);
  if (!Number.isInteger(days) || days < 0 || days > 30) {
    return { ok: false, error: 'Reminder days must be between 0 and 30.' };
  }
  return { ok: true, days };
}

export type ParseDueDayResult =
  | { ok: true; day: number }
  | { ok: false; error: string };

export function parseBillDueDay(raw: string): ParseDueDayResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, error: 'Enter due day (1–31).' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: 'Use a whole number from 1 to 31.' };
  }
  const day = Number(trimmed);
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return { ok: false, error: 'Day must be between 1 and 31.' };
  }
  return { ok: true, day };
}

export function parseOneTimeDueDateYmd(
  raw: string,
): { ok: true; ymd: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, error: 'Enter one-time due date (YYYY-MM-DD).' };
  }
  const date = parseExpenseDateYmd(trimmed);
  if (!date) {
    return { ok: false, error: 'Use due date format YYYY-MM-DD.' };
  }
  return { ok: true, ymd: trimmed };
}

function dueYmdForMonthly(year: number, monthIndex: number, dueDay: number): string {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const clamped = Math.min(Math.max(dueDay, 1), lastDay);
  return toExpenseDateYmd(new Date(year, monthIndex, clamped));
}

function monthDiffInclusive(startYmd: string, endYmd: string): Array<{ year: number; monthIndex: number }> {
  const start = parseExpenseDateYmd(startYmd);
  const end = parseExpenseDateYmd(endYmd);
  if (!start || !end || start.getTime() > end.getTime()) {
    return [];
  }
  const out: Array<{ year: number; monthIndex: number }> = [];
  let year = start.getFullYear();
  let month = start.getMonth();
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();
  while (year < endYear || (year === endYear && month <= endMonth)) {
    out.push({ year, monthIndex: month });
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return out;
}

export function buildBillsDueByYmdForMonth(
  year: number,
  monthIndex: number,
  bills: BillRow[],
): Record<string, BillDueEntry[]> {
  const { startYmd, endYmd } = monthYmdRange(year, monthIndex);
  const map: Record<string, BillDueEntry[]> = {};

  for (const bill of bills) {
    if (!bill.isActive) {
      continue;
    }

    let ymd: string | null = null;
    if (bill.recurrenceType === 'monthly' && typeof bill.dueDay === 'number') {
      ymd = dueYmdForMonthly(year, monthIndex, bill.dueDay);
    } else if (bill.recurrenceType === 'one_time' && bill.dueDateYmd) {
      if (bill.dueDateYmd >= startYmd && bill.dueDateYmd <= endYmd) {
        ymd = bill.dueDateYmd;
      }
    }

    if (!ymd) {
      continue;
    }

    const list = map[ymd] ?? [];
    list.push({
      id: bill.id,
      billName: bill.billName,
      providerName: bill.providerName,
      amount: bill.amount,
      dueDateYmd: ymd,
    });
    map[ymd] = list;
  }

  for (const ymd of Object.keys(map)) {
    map[ymd].sort((a, b) => a.billName.localeCompare(b.billName));
  }

  return map;
}

export function buildBillsDueEntriesInRange(
  startYmd: string,
  endYmd: string,
  bills: BillRow[],
): BillDueEntryWithDate[] {
  const entries: BillDueEntryWithDate[] = [];
  const months = monthDiffInclusive(startYmd, endYmd);

  for (const bill of bills) {
    if (!bill.isActive) {
      continue;
    }
    if (bill.recurrenceType === 'one_time') {
      if (bill.dueDateYmd && bill.dueDateYmd >= startYmd && bill.dueDateYmd <= endYmd) {
        entries.push({
          id: bill.id,
          billName: bill.billName,
          providerName: bill.providerName,
          amount: bill.amount,
          dueDateYmd: bill.dueDateYmd,
        });
      }
      continue;
    }
    if (bill.recurrenceType === 'monthly' && typeof bill.dueDay === 'number') {
      for (const month of months) {
        const dueYmd = dueYmdForMonthly(month.year, month.monthIndex, bill.dueDay);
        if (dueYmd >= startYmd && dueYmd <= endYmd) {
          entries.push({
            id: bill.id,
            billName: bill.billName,
            providerName: bill.providerName,
            amount: bill.amount,
            dueDateYmd: dueYmd,
          });
        }
      }
    }
  }

  entries.sort((a, b) => {
    if (a.dueDateYmd !== b.dueDateYmd) {
      return a.dueDateYmd.localeCompare(b.dueDateYmd);
    }
    return a.billName.localeCompare(b.billName);
  });
  return entries;
}

export function nextReminderDateForBill(
  bill: BillRow,
  now: Date = new Date(),
): Date | null {
  if (!bill.isActive) {
    return null;
  }

  const reminderDays = Math.max(0, bill.reminderDaysBefore);

  if (bill.recurrenceType === 'one_time') {
    if (!bill.dueDateYmd) {
      return null;
    }
    const due = parseExpenseDateYmd(bill.dueDateYmd);
    if (!due) {
      return null;
    }
    const trigger = new Date(due.getFullYear(), due.getMonth(), due.getDate() - reminderDays, 9, 0, 0);
    if (trigger.getTime() <= now.getTime()) {
      return null;
    }
    return trigger;
  }

  if (bill.recurrenceType === 'monthly' && bill.dueDay) {
    let year = now.getFullYear();
    let month = now.getMonth();
    for (let i = 0; i < 18; i += 1) {
      const dueYmd = dueYmdForMonthly(year, month, bill.dueDay);
      const due = parseExpenseDateYmd(dueYmd);
      if (!due) {
        return null;
      }
      const trigger = new Date(
        due.getFullYear(),
        due.getMonth(),
        due.getDate() - reminderDays,
        9,
        0,
        0,
      );
      if (trigger.getTime() > now.getTime()) {
        return trigger;
      }
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
  }

  return null;
}
