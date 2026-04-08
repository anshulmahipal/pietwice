export type ExpenseCategoryRow = {
  title: string;
  amount: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeStoredCategoryRows(
  persisted: string | null,
  defaultRows: readonly ExpenseCategoryRow[],
): ExpenseCategoryRow[] {
  if (persisted === null || persisted === '') {
    return defaultRows.map((r) => ({ ...r }));
  }

  try {
    const data = JSON.parse(persisted) as unknown;
    if (!Array.isArray(data)) {
      return defaultRows.map((r) => ({ ...r }));
    }

    if (data.length === 0) {
      return defaultRows.map((r) => ({ ...r }));
    }

    if (typeof data[0] === 'string') {
      const titles = (data as string[]).map((s) => s.trim()).filter((s) => s.length > 0);
      return titles.length > 0
        ? titles.map((title) => ({ title, amount: '' }))
        : defaultRows.map((r) => ({ ...r }));
    }

    const rows: ExpenseCategoryRow[] = [];
    for (const item of data) {
      if (!isPlainObject(item)) {
        continue;
      }
      const title = typeof item.title === 'string' ? item.title.trim() : '';
      if (!title) {
        continue;
      }
      let amount = '';
      if (typeof item.amount === 'string') {
        amount = item.amount;
      } else if (typeof item.amount === 'number' && Number.isFinite(item.amount)) {
        amount = String(item.amount);
      }
      rows.push({ title, amount });
    }

    return rows.length > 0 ? rows : defaultRows.map((r) => ({ ...r }));
  } catch {
    return defaultRows.map((r) => ({ ...r }));
  }
}

export function addCategoryRowIfNew(
  rows: ExpenseCategoryRow[],
  rawTitle: string,
  rawAmount: string,
): ExpenseCategoryRow[] {
  const title = rawTitle.trim();
  if (!title) {
    return rows;
  }

  const key = title.toLowerCase();
  if (rows.some((r) => r.title.toLowerCase() === key)) {
    return rows;
  }

  return [...rows, { title, amount: rawAmount.trim() }];
}

export function updateCategoryRow(
  rows: ExpenseCategoryRow[],
  index: number,
  field: 'title' | 'amount',
  value: string,
): ExpenseCategoryRow[] {
  if (index < 0 || index >= rows.length) {
    return rows;
  }

  const row = rows[index];

  if (field === 'title') {
    const t = value.trim();
    if (!t || t === row.title) {
      return rows;
    }
    const taken = rows.some(
      (r, i) => i !== index && r.title.toLowerCase() === t.toLowerCase(),
    );
    if (taken) {
      return rows;
    }
    const next = rows.slice();
    next[index] = { ...row, title: t };
    return next;
  }

  if (value === row.amount) {
    return rows;
  }
  const next = rows.slice();
  next[index] = { ...row, amount: value };
  return next;
}

/** Returns a new array without the row at `index`. Invalid index returns `rows` unchanged. */
export function removeCategoryRowAt(rows: ExpenseCategoryRow[], index: number): ExpenseCategoryRow[] {
  if (index < 0 || index >= rows.length) {
    return rows;
  }
  return rows.filter((_, i) => i !== index);
}
