/**
 * Unit: ExpenseDashboardLogic — budget/spent parsing and progress segments.
 */
import {
  aggregateDashboardTotals,
  formatUsedPendingLabel,
  parseAmount,
  progressSegmentLengths,
  usedPercentLabel,
} from './expenseDashboardLogic';

describe('ExpenseDashboardLogic', () => {
  describe('parseAmount', () => {
    it('parses non-negative numbers', () => {
      expect(parseAmount('100')).toBe(100);
      expect(parseAmount(' 99.5 ')).toBe(99.5);
      expect(parseAmount('1,000')).toBe(1000);
    });

    it('returns 0 for invalid input', () => {
      expect(parseAmount('')).toBe(0);
      expect(parseAmount('abc')).toBe(0);
      expect(parseAmount('-3')).toBe(0);
    });
  });

  describe('progressSegmentLengths', () => {
    it('splits bar by used vs pending when budget is positive', () => {
      expect(progressSegmentLengths(200, 50)).toEqual({
        usedFlex: 0.25,
        pendingFlex: 0.75,
        usedPercent: 25,
      });
    });

    it('caps used at budget for the bar', () => {
      expect(progressSegmentLengths(100, 500)).toEqual({
        usedFlex: 1,
        pendingFlex: 0,
        usedPercent: 100,
      });
    });

    it('uses full pending when budget is zero', () => {
      expect(progressSegmentLengths(0, 50)).toEqual({
        usedFlex: 0,
        pendingFlex: 1,
        usedPercent: 0,
      });
    });
  });

  describe('formatUsedPendingLabel', () => {
    it('shows spent and budget when budget > 0', () => {
      expect(formatUsedPendingLabel(50, 200)).toBe('50 / 200');
    });

    it('shows em dash when no budget', () => {
      expect(formatUsedPendingLabel(10, 0)).toBe('10 / —');
    });
  });

  describe('usedPercentLabel', () => {
    it('returns percentage when budget > 0', () => {
      expect(usedPercentLabel(200, 50)).toBe('25%');
    });

    it('returns en dash when budget is zero', () => {
      expect(usedPercentLabel(0, 10)).toBe('—');
    });
  });

  describe('aggregateDashboardTotals', () => {
    it('sums budgets and spent and computes non-negative pending', () => {
      expect(
        aggregateDashboardTotals([
          { amount: '100', spent: '25' },
          { amount: '200', spent: '50' },
        ]),
      ).toEqual({ totalBudget: 300, totalSpent: 75, totalPending: 225 });
    });

    it('treats overspend as zero pending', () => {
      expect(aggregateDashboardTotals([{ amount: '50', spent: '80' }])).toEqual({
        totalBudget: 50,
        totalSpent: 80,
        totalPending: 0,
      });
    });

    it('handles empty rows', () => {
      expect(aggregateDashboardTotals([])).toEqual({
        totalBudget: 0,
        totalSpent: 0,
        totalPending: 0,
      });
    });
  });
});
