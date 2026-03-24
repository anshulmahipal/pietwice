import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { monthYmdRange } from '../houseExpense/expenseDate';
import { spentDeltaForLineItem } from '../houseExpense/expenseCalendarLogic';
import { DEFAULT_EXPENSE_CATEGORY_ROWS } from './defaultExpenseCategories';
import type { ExpenseCategoryRow } from './expenseCategoryLogic';
import { normalizeStoredCategoryRows } from './expenseCategoryLogic';

const DATABASE_NAME = 'monthly_expense.db';
const TABLE_NAME = 'expense_categories';
const SPENT_TABLE_NAME = 'category_spent';
const LINE_ITEMS_TABLE = 'expense_line_items';
/** Previous AsyncStorage key; migrated once into SQLite then removed. */
export const LEGACY_EXPENSE_CATEGORY_STORAGE_KEY = 'house_expense_categories_v1';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function resetExpenseCategoryDbConnectionForTests(): void {
  dbPromise = null;
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

async function ensureCategorySpentExpenseDateColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const cols =
    (await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${SPENT_TABLE_NAME})`)) ?? [];
  if (!cols.some((c) => c.name === 'expense_date')) {
    await db.execAsync(`ALTER TABLE ${SPENT_TABLE_NAME} ADD COLUMN expense_date TEXT;`);
  }
}

export async function initExpenseCategoryStore(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      sort_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS ${SPENT_TABLE_NAME} (
      title_key TEXT NOT NULL PRIMARY KEY,
      spent TEXT NOT NULL DEFAULT '0'
    );
    CREATE TABLE IF NOT EXISTS ${LINE_ITEMS_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      title_key TEXT NOT NULL,
      amount TEXT NOT NULL,
      expense_date TEXT NOT NULL
    );
  `);
  await ensureCategorySpentExpenseDateColumn(db);
  await seedExpenseLineItemsFromLegacySpent(db);
}

/** One-time style backfill: one line per category from category_spent when line items are empty. */
async function seedExpenseLineItemsFromLegacySpent(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    INSERT INTO ${LINE_ITEMS_TABLE} (title_key, amount, expense_date)
    SELECT cs.title_key, cs.spent, cs.expense_date
    FROM ${SPENT_TABLE_NAME} cs
    WHERE cs.spent IS NOT NULL
      AND TRIM(cs.spent) != ''
      AND cs.spent != '0'
      AND ABS(CAST(cs.spent AS REAL)) > 1e-9
      AND cs.expense_date IS NOT NULL
      AND TRIM(cs.expense_date) != ''
      AND NOT EXISTS (SELECT 1 FROM ${LINE_ITEMS_TABLE} e WHERE e.title_key = cs.title_key);
  `);
}

export type ExpenseLineItemRow = {
  id: number;
  titleKey: string;
  amount: string;
  expenseDate: string;
};

async function countCategoryRows(db: SQLite.SQLiteDatabase): Promise<number> {
  const rows = await db.getAllAsync<{ c: number }>(
    `SELECT COUNT(*) AS c FROM ${TABLE_NAME}`,
  );
  const n = rows[0]?.c;
  return typeof n === 'number' ? n : Number(n ?? 0);
}

export async function loadExpenseCategoriesFromDb(): Promise<ExpenseCategoryRow[]> {
  await initExpenseCategoryStore();
  const db = await getDatabase();
  const count = await countCategoryRows(db);

  if (count > 0) {
    const rows = await db.getAllAsync<{
      sort_index: number;
      title: string;
      amount: string | null;
    }>(`SELECT sort_index, title, amount FROM ${TABLE_NAME} ORDER BY sort_index ASC`);

    return rows.map((r) => ({
      title: r.title,
      amount: r.amount ?? '',
    }));
  }

  const legacyJson = await AsyncStorage.getItem(LEGACY_EXPENSE_CATEGORY_STORAGE_KEY);
  if (legacyJson !== null) {
    const migrated = normalizeStoredCategoryRows(legacyJson, DEFAULT_EXPENSE_CATEGORY_ROWS);
    await replaceExpenseCategoriesInDb(migrated);
    await AsyncStorage.removeItem(LEGACY_EXPENSE_CATEGORY_STORAGE_KEY);
    return migrated;
  }

  return DEFAULT_EXPENSE_CATEGORY_ROWS.map((r) => ({ ...r }));
}

export async function replaceExpenseCategoriesInDb(categories: ExpenseCategoryRow[]): Promise<void> {
  await initExpenseCategoryStore();
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await db.execAsync(`DELETE FROM ${TABLE_NAME};`);
    for (let i = 0; i < categories.length; i += 1) {
      const row = categories[i];
      await db.runAsync(
        `INSERT INTO ${TABLE_NAME} (sort_index, title, amount) VALUES (?, ?, ?)`,
        i,
        row.title,
        row.amount,
      );
    }
  });
}

export async function loadCategorySpentMap(): Promise<Record<string, string>> {
  await initExpenseCategoryStore();
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ title_key: string; spent: string | null }>(
    `SELECT title_key, spent FROM ${SPENT_TABLE_NAME}`,
  );
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.title_key] = r.spent ?? '0';
  }
  return map;
}

export async function upsertCategorySpent(
  titleKey: string,
  spent: string,
  expenseDateYmd: string,
): Promise<void> {
  await initExpenseCategoryStore();
  const db = await getDatabase();
  const prev = await db.getFirstAsync<{ spent: string | null }>(
    `SELECT spent FROM ${SPENT_TABLE_NAME} WHERE title_key = ?`,
    titleKey,
  );
  const oldSpent = prev?.spent ?? '0';
  const delta = spentDeltaForLineItem(oldSpent, spent);

  await db.runAsync(
    `INSERT INTO ${SPENT_TABLE_NAME} (title_key, spent, expense_date) VALUES (?, ?, ?) ON CONFLICT(title_key) DO UPDATE SET spent = excluded.spent, expense_date = excluded.expense_date`,
    titleKey,
    spent,
    expenseDateYmd,
  );

  if (delta !== 0) {
    await db.runAsync(
      `INSERT INTO ${LINE_ITEMS_TABLE} (title_key, amount, expense_date) VALUES (?, ?, ?)`,
      titleKey,
      String(delta),
      expenseDateYmd,
    );
  }
}

/** Sum of line-item amounts per calendar day for the given month (YYYY-MM-DD → total). */
export async function loadExpenseDayTotalsForMonth(
  year: number,
  monthIndex: number,
): Promise<Record<string, number>> {
  await initExpenseCategoryStore();
  const db = await getDatabase();
  const { startYmd, endYmd } = monthYmdRange(year, monthIndex);
  const rows = await db.getAllAsync<{ expense_date: string; total: number }>(
    `SELECT expense_date, SUM(CAST(amount AS REAL)) AS total
     FROM ${LINE_ITEMS_TABLE}
     WHERE expense_date >= ? AND expense_date <= ?
     GROUP BY expense_date`,
    startYmd,
    endYmd,
  );
  const map: Record<string, number> = {};
  for (const r of rows) {
    const n = typeof r.total === 'number' ? r.total : parseFloat(String(r.total));
    map[r.expense_date] = Number.isFinite(n) ? n : 0;
  }
  return map;
}

export async function loadExpenseLineItemsForDay(expenseDateYmd: string): Promise<ExpenseLineItemRow[]> {
  await initExpenseCategoryStore();
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    title_key: string;
    amount: string;
    expense_date: string;
  }>(
    `SELECT id, title_key, amount, expense_date FROM ${LINE_ITEMS_TABLE}
     WHERE expense_date = ?
     ORDER BY id DESC`,
    expenseDateYmd,
  );
  return rows.map((r) => ({
    id: r.id,
    titleKey: r.title_key,
    amount: r.amount,
    expenseDate: r.expense_date,
  }));
}
