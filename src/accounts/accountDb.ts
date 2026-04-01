import * as SQLite from 'expo-sqlite';
import { monthYmdRange } from '../houseExpense/expenseDate';
import type { AccountType, LedgerEntryKind } from './accountLogic';

const DATABASE_NAME = 'monthly_expense.db';
const ACCOUNTS_TABLE = 'accounts';
const ENTRIES_TABLE = 'account_entries';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function resetAccountsDbConnectionForTests(): void {
  dbPromise = null;
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

async function ensureAccountsStore(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${ACCOUNTS_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      account_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      current_balance TEXT NOT NULL DEFAULT '0'
    );
    CREATE TABLE IF NOT EXISTS ${ENTRIES_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      account_id INTEGER NOT NULL,
      entry_kind TEXT NOT NULL,
      amount TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      entry_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(account_id) REFERENCES ${ACCOUNTS_TABLE}(id)
    );
  `);
  return db;
}

export type AccountRow = {
  id: number;
  accountName: string;
  accountType: AccountType;
  currentBalance: string;
};

export type AccountEntryRow = {
  id: number;
  accountId: number;
  accountName: string;
  entryKind: LedgerEntryKind;
  amount: string;
  note: string;
  entryDate: string;
  createdAt: string;
};

export async function loadAccountsFromDb(): Promise<AccountRow[]> {
  const db = await ensureAccountsStore();
  const rows = await db.getAllAsync<{
    id: number;
    account_name: string;
    account_type: string;
    current_balance: string;
  }>(
    `SELECT id, account_name, account_type, current_balance FROM ${ACCOUNTS_TABLE}
     ORDER BY id ASC`,
  );
  return rows.map((r) => ({
    id: r.id,
    accountName: r.account_name,
    accountType: (
      r.account_type === 'cash' ||
      r.account_type === 'wallet' ||
      r.account_type === 'credit_card'
        ? r.account_type
        : 'bank'
    ) as AccountType,
    currentBalance: r.current_balance,
  }));
}

export async function insertAccount(
  accountName: string,
  accountType: AccountType,
  openingBalance: string,
): Promise<void> {
  const db = await ensureAccountsStore();
  await db.runAsync(
    `INSERT INTO ${ACCOUNTS_TABLE} (account_name, account_type, current_balance) VALUES (?, ?, ?)`,
    accountName,
    accountType,
    openingBalance,
  );
}

export async function insertAccountEntry(
  accountId: number,
  entryKind: LedgerEntryKind,
  amount: string,
  note: string,
  entryDate: string,
): Promise<void> {
  const db = await ensureAccountsStore();
  const delta = entryKind === 'income' ? Number(amount) : -Number(amount);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO ${ENTRIES_TABLE} (account_id, entry_kind, amount, note, entry_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      accountId,
      entryKind,
      amount,
      note.trim(),
      entryDate,
      new Date().toISOString(),
    );
    await db.runAsync(
      `UPDATE ${ACCOUNTS_TABLE}
       SET current_balance = CAST(CAST(current_balance AS REAL) + ? AS TEXT)
       WHERE id = ?`,
      delta,
      accountId,
    );
  });
}

export async function loadRecentAccountEntries(limit = 40): Promise<AccountEntryRow[]> {
  const db = await ensureAccountsStore();
  const rows = await db.getAllAsync<{
    id: number;
    account_id: number;
    account_name: string;
    entry_kind: string;
    amount: string;
    note: string;
    entry_date: string;
    created_at: string;
  }>(
    `SELECT e.id, e.account_id, a.account_name, e.entry_kind, e.amount, e.note, e.entry_date, e.created_at
     FROM ${ENTRIES_TABLE} e
     JOIN ${ACCOUNTS_TABLE} a ON a.id = e.account_id
     ORDER BY e.entry_date DESC, e.id DESC
     LIMIT ?`,
    limit,
  );
  return rows.map((r) => ({
    id: r.id,
    accountId: r.account_id,
    accountName: r.account_name,
    entryKind: (r.entry_kind === 'expense' ? 'expense' : 'income') as LedgerEntryKind,
    amount: r.amount,
    note: r.note,
    entryDate: r.entry_date,
    createdAt: r.created_at,
  }));
}

export async function loadCurrentMonthCashflowTotals(now: Date = new Date()): Promise<{
  incomeTotal: number;
  expenseTotal: number;
}> {
  const { startYmd, endYmd } = monthYmdRange(now.getFullYear(), now.getMonth());
  return loadCashflowTotalsForRange(startYmd, endYmd);
}

export async function loadCashflowTotalsForRange(
  startYmd: string,
  endYmd: string,
): Promise<{ incomeTotal: number; expenseTotal: number }> {
  const db = await ensureAccountsStore();
  const rows = await db.getAllAsync<{ entry_kind: string; total: number | string | null }>(
    `SELECT entry_kind, SUM(CAST(amount AS REAL)) AS total
     FROM ${ENTRIES_TABLE}
     WHERE entry_date >= ? AND entry_date <= ?
     GROUP BY entry_kind`,
    startYmd,
    endYmd,
  );
  let incomeTotal = 0;
  let expenseTotal = 0;
  for (const row of rows) {
    const n = typeof row.total === 'number' ? row.total : Number(row.total ?? 0);
    if (!Number.isFinite(n)) {
      continue;
    }
    if (row.entry_kind === 'income') {
      incomeTotal = n;
    } else if (row.entry_kind === 'expense') {
      expenseTotal = n;
    }
  }
  return { incomeTotal, expenseTotal };
}
