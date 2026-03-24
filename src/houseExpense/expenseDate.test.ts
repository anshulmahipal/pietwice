import { monthYmdRange, parseExpenseDateYmd, toExpenseDateYmd } from './expenseDate';

describe('expenseDate', () => {
  it('toExpenseDateYmd uses local calendar date', () => {
    const d = new Date(2024, 5, 9);
    expect(toExpenseDateYmd(d)).toBe('2024-06-09');
  });

  it('parseExpenseDateYmd round-trips valid YMD', () => {
    const d = parseExpenseDateYmd('2024-03-22');
    expect(d).not.toBeNull();
    expect(toExpenseDateYmd(d!)).toBe('2024-03-22');
  });

  it('parseExpenseDateYmd rejects invalid strings', () => {
    expect(parseExpenseDateYmd('')).toBeNull();
    expect(parseExpenseDateYmd('24-03-22')).toBeNull();
    expect(parseExpenseDateYmd('2024-13-01')).toBeNull();
  });

  it('monthYmdRange covers full calendar month', () => {
    expect(monthYmdRange(2024, 0)).toEqual({ startYmd: '2024-01-01', endYmd: '2024-01-31' });
    expect(monthYmdRange(2024, 1)).toEqual({ startYmd: '2024-02-01', endYmd: '2024-02-29' });
  });
});
