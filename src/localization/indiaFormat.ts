import { toExpenseDateYmd } from '../houseExpense/expenseDate';

const INR_FORMAT = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatInr(amount: number): string {
  if (!Number.isFinite(amount)) {
    return INR_FORMAT.format(0);
  }
  return INR_FORMAT.format(amount);
}

export function financialYearRangeYmd(now: Date = new Date()): { startYmd: string; endYmd: string } {
  const year = now.getFullYear();
  const month = now.getMonth();
  const fyStartYear = month >= 3 ? year : year - 1;
  const fyStart = new Date(fyStartYear, 3, 1);
  const fyEnd = new Date(fyStartYear + 1, 2, 31);
  return { startYmd: toExpenseDateYmd(fyStart), endYmd: toExpenseDateYmd(fyEnd) };
}

export function financialYearLabel(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = now.getMonth();
  const fyStartYear = month >= 3 ? year : year - 1;
  const nextShort = String((fyStartYear + 1) % 100).padStart(2, '0');
  return `FY ${fyStartYear}-${nextShort}`;
}
