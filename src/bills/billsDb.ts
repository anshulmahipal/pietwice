import * as SQLite from 'expo-sqlite';
import type { BillRecurrenceType, BillRow } from './billsLogic';

const DATABASE_NAME = 'monthly_expense.db';
const TABLE_NAME = 'bills';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function resetBillsDbConnectionForTests(): void {
  dbPromise = null;
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

async function ensureBillsStore(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      bill_name TEXT NOT NULL,
      provider_name TEXT NOT NULL DEFAULT '',
      amount TEXT NOT NULL,
      recurrence_type TEXT NOT NULL,
      due_day INTEGER,
      due_date_ymd TEXT,
      reminder_days_before INTEGER NOT NULL DEFAULT 1,
      payment_url TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1
    );
  `);
  return db;
}

export type InsertBillInput = {
  billName: string;
  providerName: string;
  amount: string;
  recurrenceType: BillRecurrenceType;
  dueDay: number | null;
  dueDateYmd: string | null;
  reminderDaysBefore: number;
  paymentUrl: string;
};

export async function loadBillsFromDb(): Promise<BillRow[]> {
  const db = await ensureBillsStore();
  const rows = await db.getAllAsync<{
    id: number;
    bill_name: string;
    provider_name: string;
    amount: string;
    recurrence_type: string;
    due_day: number | null;
    due_date_ymd: string | null;
    reminder_days_before: number;
    payment_url: string | null;
    is_active: number;
  }>(
    `SELECT id, bill_name, provider_name, amount, recurrence_type, due_day, due_date_ymd, reminder_days_before, payment_url, is_active
     FROM ${TABLE_NAME}
     ORDER BY id ASC`,
  );
  return rows.map((r) => ({
    id: r.id,
    billName: r.bill_name,
    providerName: r.provider_name,
    amount: r.amount,
    recurrenceType: r.recurrence_type === 'one_time' ? 'one_time' : 'monthly',
    dueDay: typeof r.due_day === 'number' ? r.due_day : null,
    dueDateYmd: r.due_date_ymd,
    reminderDaysBefore: r.reminder_days_before,
    paymentUrl: r.payment_url ?? '',
    isActive: r.is_active === 1,
  }));
}

export async function insertBill(input: InsertBillInput): Promise<void> {
  const db = await ensureBillsStore();
  await db.runAsync(
    `INSERT INTO ${TABLE_NAME} (bill_name, provider_name, amount, recurrence_type, due_day, due_date_ymd, reminder_days_before, payment_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    input.billName,
    input.providerName,
    input.amount,
    input.recurrenceType,
    input.dueDay,
    input.dueDateYmd,
    input.reminderDaysBefore,
    input.paymentUrl,
  );
}
