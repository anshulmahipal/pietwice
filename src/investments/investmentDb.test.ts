/**
 * Unit: InvestmentDb — SQLite load and insert for investments.
 */
import {
  insertInvestment,
  loadInvestmentsFromDb,
  resetInvestmentDbConnectionForTests,
} from './investmentDb';

const mockExecAsync = jest.fn(() => Promise.resolve());
const mockGetAllAsync = jest.fn();
const mockRunAsync = jest.fn(() => Promise.resolve());

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: mockExecAsync,
      getAllAsync: mockGetAllAsync,
      runAsync: mockRunAsync,
    }),
  ),
}));

describe('InvestmentDb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetInvestmentDbConnectionForTests();
    mockGetAllAsync.mockReset();
  });

  it('loadInvestmentsFromDb maps DB columns to InvestmentRow', async () => {
    mockGetAllAsync.mockResolvedValueOnce([
      { id: 1, holding_name: 'Index fund', activity_day: 5 },
    ]);

    const rows = await loadInvestmentsFromDb();

    expect(mockExecAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS investments'));
    expect(rows).toEqual([{ id: 1, holdingName: 'Index fund', activityDay: 5 }]);
  });

  it('insertInvestment runs INSERT with name and day', async () => {
    mockGetAllAsync.mockResolvedValueOnce([]);

    await insertInvestment('PPF', 1);

    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO investments'),
      'PPF',
      1,
    );
  });
});
