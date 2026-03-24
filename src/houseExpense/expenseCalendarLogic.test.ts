/**
 * Unit: expenseCalendarLogic — delta when category spent changes; calendar day amount text.
 */
import { formatCalendarDayAmountOnly, spentDeltaForLineItem } from './expenseCalendarLogic';

describe('expenseCalendarLogic', () => {
  describe('formatCalendarDayAmountOnly', () => {
    it('returns null for zero or non-finite', () => {
      expect(formatCalendarDayAmountOnly(0)).toBeNull();
      expect(formatCalendarDayAmountOnly(Number.NaN)).toBeNull();
    });

    it('returns digits only for non-zero totals', () => {
      expect(formatCalendarDayAmountOnly(120)).toBe('120');
      expect(formatCalendarDayAmountOnly(12.5)).toBe('12.50');
      expect(formatCalendarDayAmountOnly(-5)).toBe('-5');
    });
  });

  describe('spentDeltaForLineItem', () => {
    it('returns difference between new and old spent strings', () => {
      expect(spentDeltaForLineItem('10', '25')).toBe(15);
      expect(spentDeltaForLineItem('25', '10')).toBe(-15);
    });

    it('treats missing or invalid as zero', () => {
      expect(spentDeltaForLineItem('', '5')).toBe(5);
      expect(spentDeltaForLineItem('10', '')).toBe(-10);
    });
  });
});
