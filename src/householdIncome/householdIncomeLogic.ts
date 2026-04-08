/**
 * Validates monthly income fields shown on first-time household setup.
 */
export function validateIncomeField(raw: string): number | null {
  const t = String(raw).trim();
  if (t === '') {
    return null;
  }
  const cleaned = t.replace(/,/g, '');
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return n;
}

export function validateHouseholdIncomes(husbandRaw: string, wifeRaw: string): {
  ok: true;
  husband: string;
  wife: string;
} | {
  ok: false;
} {
  const h = validateIncomeField(husbandRaw);
  const w = validateIncomeField(wifeRaw);
  if (h === null || w === null) {
    return { ok: false };
  }
  return {
    ok: true,
    husband: String(h),
    wife: String(w),
  };
}
