/**
 * Unit: householdIncomeLogic — income field validation for household setup.
 */
import { validateHouseholdIncomes, validateIncomeField } from './householdIncomeLogic';

describe('householdIncomeLogic', () => {
  describe('validateIncomeField', () => {
    it('returns null for empty or whitespace', () => {
      expect(validateIncomeField('')).toBeNull();
      expect(validateIncomeField('   ')).toBeNull();
    });

    it('parses integers and decimals', () => {
      expect(validateIncomeField('0')).toBe(0);
      expect(validateIncomeField('120000')).toBe(120000);
      expect(validateIncomeField('1,20,000')).toBe(120000);
      expect(validateIncomeField(' 95000.50 ')).toBe(95000.5);
    });

    it('returns null for negative or non-numeric', () => {
      expect(validateIncomeField('-1')).toBeNull();
      expect(validateIncomeField('abc')).toBeNull();
    });
  });

  describe('validateHouseholdIncomes', () => {
    it('requires both fields valid', () => {
      expect(validateHouseholdIncomes('', '100')).toEqual({ ok: false });
      expect(validateHouseholdIncomes('100', '')).toEqual({ ok: false });
      expect(validateHouseholdIncomes('x', '1')).toEqual({ ok: false });
    });

    it('accepts zero for either partner', () => {
      expect(validateHouseholdIncomes('0', '0')).toEqual({
        ok: true,
        husband: '0',
        wife: '0',
      });
    });

    it('normalizes to plain numeric strings', () => {
      expect(validateHouseholdIncomes('1,00,000', '50000')).toEqual({
        ok: true,
        husband: '100000',
        wife: '50000',
      });
    });
  });
});
