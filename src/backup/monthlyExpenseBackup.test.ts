/**
 * Unit: monthlyExpenseBackup — serialize DB and replace from backup bytes.
 */
import * as SQLite from 'expo-sqlite';
import { resetMonthlyExpenseSqliteConnection } from '../database/monthlyExpenseSqliteDb';
import {
  replaceMonthlyExpenseDatabaseFromBackup,
  serializeMonthlyExpenseDatabase,
} from './monthlyExpenseBackup';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
  deleteDatabaseAsync: jest.fn(),
  deserializeDatabaseAsync: jest.fn(),
  backupDatabaseAsync: jest.fn(),
}));

jest.mock('../database/monthlyExpenseSqliteDb', () => {
  const actual = jest.requireActual('../database/monthlyExpenseSqliteDb');
  return {
    ...actual,
    getMonthlyExpenseSqliteDb: jest.fn(),
    closeMonthlyExpenseSqliteDb: jest.fn(),
  };
});

const { getMonthlyExpenseSqliteDb, closeMonthlyExpenseSqliteDb } = jest.requireMock(
  '../database/monthlyExpenseSqliteDb',
) as {
  getMonthlyExpenseSqliteDb: jest.Mock;
  closeMonthlyExpenseSqliteDb: jest.Mock;
};

function sqliteHeaderBytes(): Uint8Array {
  const b = new Uint8Array(512);
  const enc = new TextEncoder();
  b.set(enc.encode('SQLite format 3\0'), 0);
  return b;
}

describe('monthlyExpenseBackup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMonthlyExpenseSqliteConnection();
  });

  describe('serializeMonthlyExpenseDatabase', () => {
    it('returns serializeAsync(main) from shared DB', async () => {
      const payload = new Uint8Array([1, 2, 3]);
      const serializeAsync = jest.fn().mockResolvedValue(payload);
      getMonthlyExpenseSqliteDb.mockResolvedValue({ serializeAsync });

      await expect(serializeMonthlyExpenseDatabase()).resolves.toBe(payload);
      expect(serializeAsync).toHaveBeenCalledWith('main');
    });
  });

  describe('replaceMonthlyExpenseDatabaseFromBackup', () => {
    it('throws when payload is not SQLite', async () => {
      await expect(replaceMonthlyExpenseDatabaseFromBackup(new Uint8Array([0]))).rejects.toThrow(
        'does not look like a SQLite',
      );
      expect(closeMonthlyExpenseSqliteDb).not.toHaveBeenCalled();
    });

    it('closes DB, deletes file, deserializes, backups to new file, then closes connections', async () => {
      const headerPayload = sqliteHeaderBytes();
      const sourceDb = { closeAsync: jest.fn().mockResolvedValue(undefined) };
      const destDb = { closeAsync: jest.fn().mockResolvedValue(undefined) };
      closeMonthlyExpenseSqliteDb.mockResolvedValue(undefined);
      (SQLite.deleteDatabaseAsync as jest.Mock).mockResolvedValue(undefined);
      (SQLite.deserializeDatabaseAsync as jest.Mock).mockResolvedValue(sourceDb);
      (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(destDb);
      (SQLite.backupDatabaseAsync as jest.Mock).mockResolvedValue(undefined);

      await replaceMonthlyExpenseDatabaseFromBackup(headerPayload);

      expect(closeMonthlyExpenseSqliteDb).toHaveBeenCalledTimes(1);
      expect(SQLite.deleteDatabaseAsync).toHaveBeenCalledWith('monthly_expense.db');
      expect(SQLite.deserializeDatabaseAsync).toHaveBeenCalledWith(headerPayload);
      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('monthly_expense.db');
      expect(SQLite.backupDatabaseAsync).toHaveBeenCalledWith({
        sourceDatabase: sourceDb,
        destDatabase: destDb,
      });
      expect(sourceDb.closeAsync).toHaveBeenCalledTimes(1);
      expect(destDb.closeAsync).toHaveBeenCalledTimes(1);
    });
  });
});
