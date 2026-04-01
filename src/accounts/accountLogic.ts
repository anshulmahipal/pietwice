export type AccountType = 'bank' | 'cash' | 'wallet' | 'credit_card';
export type LedgerEntryKind = 'income' | 'expense';

export function normalizeAccountName(raw: string): string {
  return raw.trim();
}

export function accountTypeLabel(type: AccountType): string {
  switch (type) {
    case 'bank':
      return 'Bank';
    case 'cash':
      return 'Cash';
    case 'wallet':
      return 'Wallet';
    case 'credit_card':
      return 'Credit card';
    default:
      return type;
  }
}

export function entryKindLabel(kind: LedgerEntryKind): string {
  return kind === 'income' ? 'Income' : 'Expense';
}

export type ParseAmountResult =
  | { ok: true; amount: string }
  | { ok: false; error: string };

export function parseCurrencyAmount(raw: string, missingMessage: string): ParseAmountResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, error: missingMessage };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { ok: false, error: 'Use a valid amount (up to 2 decimals).' };
  }
  return { ok: true, amount: trimmed };
}

export function parseAmountValue(amount: string): number {
  const n = Number(amount);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return n;
}
