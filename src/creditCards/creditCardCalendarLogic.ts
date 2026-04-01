import { toExpenseDateYmd } from '../houseExpense/expenseDate';

export type CreditCardDueEntry = {
  id: number;
  cardName: string;
  billPaymentDay: number;
};

export function clampBillDayToMonth(year: number, monthIndex: number, billPaymentDay: number): number {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const d = Math.min(Math.max(1, billPaymentDay), lastDay);
  return d;
}

export function dueYmdForCreditCardInMonth(
  year: number,
  monthIndex: number,
  billPaymentDay: number,
): string {
  const day = clampBillDayToMonth(year, monthIndex, billPaymentDay);
  return toExpenseDateYmd(new Date(year, monthIndex, day));
}

export function buildCreditCardDueDatesByYmd(
  year: number,
  monthIndex: number,
  cards: CreditCardDueEntry[],
): Record<string, CreditCardDueEntry[]> {
  const map: Record<string, CreditCardDueEntry[]> = {};
  for (const c of cards) {
    const ymd = dueYmdForCreditCardInMonth(year, monthIndex, c.billPaymentDay);
    if (!map[ymd]) {
      map[ymd] = [];
    }
    map[ymd].push(c);
  }
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => a.cardName.localeCompare(b.cardName));
  }
  return map;
}

/** Compact text for a calendar day cell (card names + configured bill day). */
export function formatDueEntriesForCalendarCell(entries: CreditCardDueEntry[]): string {
  return entries.map((e) => `${e.cardName} · day ${e.billPaymentDay}`).join('\n');
}
