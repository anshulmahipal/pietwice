/**
 * Unit: CreditCardCalendarLogic — map bill payment days to YMD per visible month.
 */
import {
  buildCreditCardDueDatesByYmd,
  clampBillDayToMonth,
  dueYmdForCreditCardInMonth,
  formatDueEntriesForCalendarCell,
} from './creditCardCalendarLogic';
import type { CreditCardDueEntry } from './creditCardCalendarLogic';

describe('CreditCardCalendarLogic', () => {
  describe('clampBillDayToMonth', () => {
    it('caps day 31 to last day in February', () => {
      expect(clampBillDayToMonth(2025, 1, 31)).toBe(28);
      expect(clampBillDayToMonth(2024, 1, 31)).toBe(29);
    });

    it('keeps day in range for 31-day months', () => {
      expect(clampBillDayToMonth(2025, 0, 31)).toBe(31);
    });
  });

  describe('dueYmdForCreditCardInMonth', () => {
    it('returns YYYY-MM-DD for the due date in that month', () => {
      expect(dueYmdForCreditCardInMonth(2025, 2, 15)).toBe('2025-03-15');
    });

    it('clamps to last day when bill day exceeds month length', () => {
      expect(dueYmdForCreditCardInMonth(2025, 1, 30)).toBe('2025-02-28');
    });
  });

  describe('buildCreditCardDueDatesByYmd', () => {
    it('groups multiple cards on the same calendar date', () => {
      const cards: CreditCardDueEntry[] = [
        { id: 1, cardName: 'Zeta', billPaymentDay: 10 },
        { id: 2, cardName: 'Alpha', billPaymentDay: 10 },
      ];
      const map = buildCreditCardDueDatesByYmd(2025, 3, cards);
      expect(Object.keys(map)).toEqual(['2025-04-10']);
      expect(map['2025-04-10'].map((c) => c.cardName)).toEqual(['Alpha', 'Zeta']);
    });
  });

  describe('formatDueEntriesForCalendarCell', () => {
    it('lists card name and billing day for each entry', () => {
      const s = formatDueEntriesForCalendarCell([
        { id: 1, cardName: 'Visa', billPaymentDay: 8 },
      ]);
      expect(s).toContain('Visa');
      expect(s).toContain('8');
    });
  });
});
