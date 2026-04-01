import { financialYearLabel, financialYearRangeYmd, formatInr } from './indiaFormat';

describe('indiaFormat', () => {
  it('formats INR values', () => {
    expect(formatInr(123456)).toContain('₹');
    expect(formatInr(123456)).toContain('1,23,456');
  });

  it('builds financial year label and range', () => {
    const d = new Date(2026, 3, 2); // Apr 2, 2026
    expect(financialYearLabel(d)).toBe('FY 2026-27');
    expect(financialYearRangeYmd(d)).toEqual({
      startYmd: '2026-04-01',
      endYmd: '2027-03-31',
    });
  });
});
