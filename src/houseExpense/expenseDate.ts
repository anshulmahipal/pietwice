/** Local calendar date as YYYY-MM-DD (for SQLite / persistence). */
export function toExpenseDateYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseExpenseDateYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) {
    return null;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) {
    return null;
  }
  return d;
}

export function formatExpenseDateDisplay(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Inclusive YYYY-MM-DD range for a calendar month (monthIndex 0–11). */
export function monthYmdRange(year: number, monthIndex: number): { startYmd: string; endYmd: string } {
  const mm = String(monthIndex + 1).padStart(2, '0');
  const startYmd = `${year}-${mm}-01`;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const endYmd = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;
  return { startYmd, endYmd };
}
