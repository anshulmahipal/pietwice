/**
 * Unit: PinEntryLogic — four-digit PIN buffer rules (numeric only, max length).
 */
import {
  PIN_LENGTH,
  appendDigit,
  deleteLastDigit,
  isSingleDigit,
} from './pinEntryLogic';

describe('PinEntryLogic', () => {
  describe('PIN_LENGTH', () => {
    it('is four', () => {
      expect(PIN_LENGTH).toBe(4);
    });
  });

  describe('isSingleDigit', () => {
    it.each(['0', '1', '5', '9'])('accepts %s', (d) => {
      expect(isSingleDigit(d)).toBe(true);
    });

    it.each(['', '10', 'a', ' ', '-1'])('rejects %j', (d) => {
      expect(isSingleDigit(d)).toBe(false);
    });
  });

  describe('appendDigit', () => {
    it('appends a digit when under the limit', () => {
      expect(appendDigit('', '3')).toBe('3');
      expect(appendDigit('12', '7')).toBe('127');
    });

    it('does not append when already at max length', () => {
      expect(appendDigit('1234', '5')).toBe('1234');
    });

    it('ignores non-numeric input', () => {
      expect(appendDigit('1', 'x')).toBe('1');
      expect(appendDigit('1', '12')).toBe('1');
    });
  });

  describe('deleteLastDigit', () => {
    it('removes the last character', () => {
      expect(deleteLastDigit('123')).toBe('12');
    });

    it('returns empty string when empty', () => {
      expect(deleteLastDigit('')).toBe('');
    });
  });
});
