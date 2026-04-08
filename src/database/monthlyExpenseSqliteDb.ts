import * as SQLite from 'expo-sqlite';

/** Single app database file; all feature modules share this connection pool. */
export const MONTHLY_EXPENSE_SQLITE_FILE_NAME = 'monthly_expense.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function resetMonthlyExpenseSqliteConnection(): void {
  dbPromise = null;
}

export async function getMonthlyExpenseSqliteDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(MONTHLY_EXPENSE_SQLITE_FILE_NAME);
  }
  return dbPromise;
}

export async function closeMonthlyExpenseSqliteDb(): Promise<void> {
  if (!dbPromise) {
    return;
  }
  const db = await dbPromise;
  await db.closeAsync();
  dbPromise = null;
}
