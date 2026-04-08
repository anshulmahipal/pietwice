/**
 * Unit: PinGateLogic — comparing entered PIN to stored value.
 */
import { isStoredPinMatch, normalizeStoredPin } from './pinGateLogic';

describe('PinGateLogic', () => {
  describe('isStoredPinMatch', () => {
    it('returns true when entered PIN equals stored PIN', () => {
      expect(isStoredPinMatch('1234', '1234')).toBe(true);
    });

    it('returns false when PINs differ', () => {
      expect(isStoredPinMatch('1234', '9999')).toBe(false);
    });

    it('returns false when stored PIN is null', () => {
      expect(isStoredPinMatch('1234', null)).toBe(false);
    });
  });

  describe('normalizeStoredPin', () => {
    it('returns null for null, empty, or non-numeric', () => {
      expect(normalizeStoredPin(null)).toBeNull();
      expect(normalizeStoredPin('')).toBeNull();
      expect(normalizeStoredPin('12abc')).toBeNull();
      expect(normalizeStoredPin('12345')).toBeNull();
      expect(normalizeStoredPin('123')).toBeNull();
    });

    it('returns trimmed 4-digit string when valid', () => {
      expect(normalizeStoredPin('4242')).toBe('4242');
      expect(normalizeStoredPin(' 3333 ')).toBe('3333');
    });
  });
});
