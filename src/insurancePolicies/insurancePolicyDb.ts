import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'monthly_expense.db';
const TABLE_NAME = 'insurance_policies';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function resetInsurancePolicyDbConnectionForTests(): void {
  dbPromise = null;
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

async function ensureInsurancePolicyStore(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      policy_name TEXT NOT NULL,
      renewal_day INTEGER NOT NULL
    );
  `);
  return db;
}

export type InsurancePolicyRow = {
  id: number;
  policyName: string;
  renewalDay: number;
};

export async function loadInsurancePoliciesFromDb(): Promise<InsurancePolicyRow[]> {
  const db = await ensureInsurancePolicyStore();
  const rows = await db.getAllAsync<{
    id: number;
    policy_name: string;
    renewal_day: number;
  }>(`SELECT id, policy_name, renewal_day FROM ${TABLE_NAME} ORDER BY id ASC`);
  return rows.map((r) => ({
    id: r.id,
    policyName: r.policy_name,
    renewalDay: r.renewal_day,
  }));
}

export async function insertInsurancePolicy(policyName: string, renewalDay: number): Promise<void> {
  const db = await ensureInsurancePolicyStore();
  await db.runAsync(
    `INSERT INTO ${TABLE_NAME} (policy_name, renewal_day) VALUES (?, ?)`,
    policyName,
    renewalDay,
  );
}
