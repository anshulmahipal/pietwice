import {
  currentPeriodRangeYmd,
  formatBudgetStatus,
  parseBudgetAmount,
  periodLabel,
} from './budgetLogic';

describe('budgetLogic', () => {
  it('labels periods', () => {
    expect(periodLabel('weekly')).toBe('Weekly');
    expect(periodLabel('biweekly')).toBe('Bi-weekly');
    expect(periodLabel('monthly')).toBe('Monthly');
  });

  it('validates budget amount', () => {
    expect(parseBudgetAmount('')).toEqual({ ok: false, error: 'Enter budget amount.' });
    expect(parseBudgetAmount('abc')).toEqual({
      ok: false,
      error: 'Use a valid amount (up to 2 decimals).',
    });
    expect(parseBudgetAmount('12000.50')).toEqual({ ok: true, amount: '12000.50' });
  });

  it('builds period ranges', () => {
    const now = new Date(2026, 3, 15); // Apr 15, 2026
    expect(currentPeriodRangeYmd('monthly', now)).toEqual({
      startYmd: '2026-04-01',
      endYmd: '2026-04-30',
    });
    const weekly = currentPeriodRangeYmd('weekly', now);
    expect(weekly.startYmd).toBe('2026-04-13');
    expect(weekly.endYmd).toBe('2026-04-19');
    const biweekly = currentPeriodRangeYmd('biweekly', now);
    expect(biweekly.endYmd >= biweekly.startYmd).toBe(true);
  });

  it('computes status labels', () => {
    expect(formatBudgetStatus(0, 500)).toBe('No budget set');
    expect(formatBudgetStatus(1000, 500)).toBe('On track');
    expect(formatBudgetStatus(1000, 850)).toBe('Near limit');
    expect(formatBudgetStatus(1000, 1050)).toBe('Over budget');
    expect(formatBudgetStatus(1000, 1300)).toBe('Critical overspend');
  });
});
