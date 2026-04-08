import * as SQLite from 'expo-sqlite';
import { getMonthlyExpenseSqliteDb, resetMonthlyExpenseSqliteConnection } from '../database/monthlyExpenseSqliteDb';
import type { BudgetPeriodType } from './budgetLogic';

const TABLE_NAME = 'budget_plans';

export function resetBudgetDbConnectionForTests(): void {
  resetMonthlyExpenseSqliteConnection();
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return getMonthlyExpenseSqliteDb();
}

async function ensureBudgetStore(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      period_type TEXT NOT NULL PRIMARY KEY,
      amount TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return db;
}

export type BudgetPlanRow = {
  periodType: BudgetPeriodType;
  amount: string;
  updatedAt: string;
};

export async function loadBudgetPlans(): Promise<BudgetPlanRow[]> {
  const db = await ensureBudgetStore();
  const rows = await db.getAllAsync<{
    period_type: string;
    amount: string;
    updated_at: string;
  }>(
    `SELECT period_type, amount, updated_at FROM ${TABLE_NAME} ORDER BY period_type ASC`,
  );
  return rows
    .filter(
      (r) => r.period_type === 'weekly' || r.period_type === 'biweekly' || r.period_type === 'monthly',
    )
    .map((r) => ({
      periodType: r.period_type as BudgetPeriodType,
      amount: r.amount,
      updatedAt: r.updated_at,
    }));
}

export async function upsertBudgetPlan(periodType: BudgetPeriodType, amount: string): Promise<void> {
  const db = await ensureBudgetStore();
  await db.runAsync(
    `INSERT INTO ${TABLE_NAME} (period_type, amount, updated_at) VALUES (?, ?, ?) ON CONFLICT(period_type) DO UPDATE SET amount = excluded.amount, updated_at = excluded.updated_at`,
    periodType,
    amount,
    new Date().toISOString(),
  );
}
