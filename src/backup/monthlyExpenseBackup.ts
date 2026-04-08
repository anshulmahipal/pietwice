import * as SQLite from 'expo-sqlite';
import {
  closeMonthlyExpenseSqliteDb,
  getMonthlyExpenseSqliteDb,
  MONTHLY_EXPENSE_SQLITE_FILE_NAME,
  resetMonthlyExpenseSqliteConnection,
} from '../database/monthlyExpenseSqliteDb';
import { looksLikeSqliteDatabase } from './backupLogic';

export class InvalidBackupFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBackupFileError';
  }
}

export async function serializeMonthlyExpenseDatabase(): Promise<Uint8Array> {
  const db = await getMonthlyExpenseSqliteDb();
  return db.serializeAsync('main');
}

/**
 * Replaces the on-disk `monthly_expense.db` with the given serialized DB.
 * Callers should prompt the user to fully restart the app so all screens reload data.
 */
export async function replaceMonthlyExpenseDatabaseFromBackup(serializedMain: Uint8Array): Promise<void> {
  if (!looksLikeSqliteDatabase(serializedMain)) {
    throw new InvalidBackupFileError('This file does not look like a SQLite database backup.');
  }

  await closeMonthlyExpenseSqliteDb();
  await SQLite.deleteDatabaseAsync(MONTHLY_EXPENSE_SQLITE_FILE_NAME);

  const sourceDb = await SQLite.deserializeDatabaseAsync(serializedMain);
  const destDb = await SQLite.openDatabaseAsync(MONTHLY_EXPENSE_SQLITE_FILE_NAME);
  try {
    await SQLite.backupDatabaseAsync({
      sourceDatabase: sourceDb,
      destDatabase: destDb,
    });
  } finally {
    await sourceDb.closeAsync();
    await destDb.closeAsync();
    resetMonthlyExpenseSqliteConnection();
  }
}
