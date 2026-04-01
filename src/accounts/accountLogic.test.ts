import { accountTypeLabel, entryKindLabel, normalizeAccountName, parseCurrencyAmount } from './accountLogic';

describe('accountLogic', () => {
  it('normalizes account names', () => {
    expect(normalizeAccountName('  HDFC Savings  ')).toBe('HDFC Savings');
  });

  it('labels account type and entry kind', () => {
    expect(accountTypeLabel('bank')).toBe('Bank');
    expect(accountTypeLabel('credit_card')).toBe('Credit card');
    expect(entryKindLabel('income')).toBe('Income');
    expect(entryKindLabel('expense')).toBe('Expense');
  });

  it('validates currency amount', () => {
    expect(parseCurrencyAmount('', 'Enter amount.')).toEqual({ ok: false, error: 'Enter amount.' });
    expect(parseCurrencyAmount('abc', 'Enter amount.')).toEqual({
      ok: false,
      error: 'Use a valid amount (up to 2 decimals).',
    });
    expect(parseCurrencyAmount('1200.50', 'Enter amount.')).toEqual({ ok: true, amount: '1200.50' });
  });
});
