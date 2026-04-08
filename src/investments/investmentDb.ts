import * as SQLite from 'expo-sqlite';
import { getMonthlyExpenseSqliteDb, resetMonthlyExpenseSqliteConnection } from '../database/monthlyExpenseSqliteDb';

const TABLE_NAME = 'investments';

export function resetInvestmentDbConnectionForTests(): void {
  resetMonthlyExpenseSqliteConnection();
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return getMonthlyExpenseSqliteDb();
}

async function ensureInvestmentStore(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      holding_name TEXT NOT NULL,
      activity_day INTEGER NOT NULL
    );
  `);
  return db;
}

export type InvestmentRow = {
  id: number;
  holdingName: string;
  activityDay: number;
};

export async function loadInvestmentsFromDb(): Promise<InvestmentRow[]> {
  const db = await ensureInvestmentStore();
  const rows = await db.getAllAsync<{
    id: number;
    holding_name: string;
    activity_day: number;
  }>(`SELECT id, holding_name, activity_day FROM ${TABLE_NAME} ORDER BY id ASC`);
  return rows.map((r) => ({
    id: r.id,
    holdingName: r.holding_name,
    activityDay: r.activity_day,
  }));
}

export async function insertInvestment(holdingName: string, activityDay: number): Promise<void> {
  const db = await ensureInvestmentStore();
  await db.runAsync(
    `INSERT INTO ${TABLE_NAME} (holding_name, activity_day) VALUES (?, ?)`,
    holdingName,
    activityDay,
  );
}
