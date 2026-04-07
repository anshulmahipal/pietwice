import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'monthly_expense.db';
const TABLE_NAME = 'investments';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function resetInvestmentDbConnectionForTests(): void {
  dbPromise = null;
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
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
