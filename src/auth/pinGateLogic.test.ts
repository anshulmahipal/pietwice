/**
 * Unit: PinGateLogic — comparing entered PIN to stored value.
 */
import { isStoredPinMatch } from './pinGateLogic';

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
});
