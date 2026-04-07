/**
 * Unit: monthlyDayInputLogic — validate 1–31 day-of-month input for finance hubs.
 */
import { parseDayOfMonth } from './monthlyDayInputLogic';

describe('monthlyDayInputLogic', () => {
  describe('parseDayOfMonth', () => {
    it('accepts integers 1 through 31', () => {
      expect(parseDayOfMonth('1')).toEqual({ ok: true, day: 1 });
      expect(parseDayOfMonth('31')).toEqual({ ok: true, day: 31 });
      expect(parseDayOfMonth(' 15 ')).toEqual({ ok: true, day: 15 });
    });

    it('rejects empty and non-numeric input', () => {
      expect(parseDayOfMonth('')).toEqual({
        ok: false,
        error: 'Enter a day of the month (1–31).',
      });
      expect(parseDayOfMonth('  ')).toEqual({
        ok: false,
        error: 'Enter a day of the month (1–31).',
      });
      expect(parseDayOfMonth('x')).toEqual({
        ok: false,
        error: 'Use a whole number from 1 to 31.',
      });
    });

    it('rejects out-of-range values', () => {
      expect(parseDayOfMonth('0')).toEqual({
        ok: false,
        error: 'Day must be between 1 and 31.',
      });
      expect(parseDayOfMonth('32')).toEqual({
        ok: false,
        error: 'Day must be between 1 and 31.',
      });
    });
  });
});
