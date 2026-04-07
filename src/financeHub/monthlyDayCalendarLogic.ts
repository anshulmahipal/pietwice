import { toExpenseDateYmd } from '../houseExpense/expenseDate';

export type MonthlyKeyedEntry = {
  id: number;
  name: string;
  dayOfMonth: number;
};

export function clampDayOfMonthToCalendarMonth(
  year: number,
  monthIndex: number,
  dayOfMonth: number,
): number {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(Math.max(1, dayOfMonth), lastDay);
}

export function ymdForMonthlyDay(
  year: number,
  monthIndex: number,
  dayOfMonth: number,
): string {
  const day = clampDayOfMonthToCalendarMonth(year, monthIndex, dayOfMonth);
  return toExpenseDateYmd(new Date(year, monthIndex, day));
}

export function buildMonthlyKeyedDatesByYmd(
  year: number,
  monthIndex: number,
  entries: MonthlyKeyedEntry[],
): Record<string, MonthlyKeyedEntry[]> {
  const map: Record<string, MonthlyKeyedEntry[]> = {};
  for (const e of entries) {
    const ymd = ymdForMonthlyDay(year, monthIndex, e.dayOfMonth);
    if (!map[ymd]) {
      map[ymd] = [];
    }
    map[ymd].push(e);
  }
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

export function formatMonthlyKeyedEntriesForCalendarCell(entries: MonthlyKeyedEntry[]): string {
  return entries.map((e) => `${e.name} · day ${e.dayOfMonth}`).join('\n');
}
