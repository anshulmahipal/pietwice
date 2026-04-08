import * as SQLite from 'expo-sqlite';
import { getMonthlyExpenseSqliteDb, resetMonthlyExpenseSqliteConnection } from '../database/monthlyExpenseSqliteDb';

const TABLE_NAME = 'credit_cards';

export function resetCreditCardDbConnectionForTests(): void {
  resetMonthlyExpenseSqliteConnection();
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return getMonthlyExpenseSqliteDb();
}

async function ensureCreditCardStore(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      card_name TEXT NOT NULL,
      bill_payment_day INTEGER NOT NULL
    );
  `);
  return db;
}

export type CreditCardRow = {
  id: number;
  cardName: string;
  billPaymentDay: number;
};

export async function loadCreditCardsFromDb(): Promise<CreditCardRow[]> {
  const db = await ensureCreditCardStore();
  const rows = await db.getAllAsync<{
    id: number;
    card_name: string;
    bill_payment_day: number;
  }>(
    `SELECT id, card_name, bill_payment_day FROM ${TABLE_NAME} ORDER BY id ASC`,
  );
  return rows.map((r) => ({
    id: r.id,
    cardName: r.card_name,
    billPaymentDay: r.bill_payment_day,
  }));
}

export async function insertCreditCard(cardName: string, billPaymentDay: number): Promise<void> {
  const db = await ensureCreditCardStore();
  await db.runAsync(
    `INSERT INTO ${TABLE_NAME} (card_name, bill_payment_day) VALUES (?, ?)`,
    cardName,
    billPaymentDay,
  );
}
