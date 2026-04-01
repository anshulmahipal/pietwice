/**
 * Unit: CreditCardLogic — card name and bill payment day validation.
 */
import { formatRegisteredCardCountLabel, normalizeCardName, parseBillPaymentDay } from './creditCardLogic';

describe('CreditCardLogic', () => {
  describe('normalizeCardName', () => {
    it('trims whitespace', () => {
      expect(normalizeCardName('  Visa  ')).toBe('Visa');
    });

    it('returns empty string for whitespace-only', () => {
      expect(normalizeCardName('   \t')).toBe('');
    });
  });

  describe('parseBillPaymentDay', () => {
    it('accepts 1 and 31', () => {
      expect(parseBillPaymentDay('1')).toEqual({ ok: true, day: 1 });
      expect(parseBillPaymentDay('31')).toEqual({ ok: true, day: 31 });
    });

    it('rejects out of range', () => {
      expect(parseBillPaymentDay('0').ok).toBe(false);
      expect(parseBillPaymentDay('32').ok).toBe(false);
    });

    it('rejects non-integers and empty', () => {
      expect(parseBillPaymentDay('').ok).toBe(false);
      expect(parseBillPaymentDay('1.5').ok).toBe(false);
      expect(parseBillPaymentDay('abc').ok).toBe(false);
    });
  });

  describe('formatRegisteredCardCountLabel', () => {
    it('uses singular and plural labels', () => {
      expect(formatRegisteredCardCountLabel(0)).toBe('No cards');
      expect(formatRegisteredCardCountLabel(1)).toBe('1 card');
      expect(formatRegisteredCardCountLabel(3)).toBe('3 cards');
    });
  });
});
