/**
 * Unit: monthlyDayCalendarLogic — map recurring month-days to YYYY-MM-DD in a given month.
 */
import {
  buildMonthlyKeyedDatesByYmd,
  clampDayOfMonthToCalendarMonth,
  formatMonthlyKeyedEntriesForCalendarCell,
  ymdForMonthlyDay,
  type MonthlyKeyedEntry,
} from './monthlyDayCalendarLogic';

describe('monthlyDayCalendarLogic', () => {
  it('clampDayOfMonthToCalendarMonth caps at last day of month', () => {
    expect(clampDayOfMonthToCalendarMonth(2026, 1, 31)).toBe(28);
    expect(clampDayOfMonthToCalendarMonth(2024, 1, 30)).toBe(29);
  });

  it('ymdForMonthlyDay returns expense YMD for that calendar month', () => {
    expect(ymdForMonthlyDay(2026, 3, 15)).toBe('2026-04-15');
  });

  it('buildMonthlyKeyedDatesByYmd groups and sorts by name', () => {
    const entries: MonthlyKeyedEntry[] = [
      { id: 2, name: 'B', dayOfMonth: 5 },
      { id: 1, name: 'A', dayOfMonth: 5 },
    ];
    const map = buildMonthlyKeyedDatesByYmd(2026, 3, entries);
    expect(Object.keys(map).sort()).toEqual(['2026-04-05']);
    expect(map['2026-04-05']!.map((e) => e.name)).toEqual(['A', 'B']);
  });

  it('formatMonthlyKeyedEntriesForCalendarCell joins lines', () => {
    const text = formatMonthlyKeyedEntriesForCalendarCell([
      { id: 1, name: 'MF', dayOfMonth: 10 },
    ]);
    expect(text).toBe('MF · day 10');
  });
});
