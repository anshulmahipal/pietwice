/**
 * Unit: CreditCardDb — SQLite load and insert for credit cards.
 */
import {
  insertCreditCard,
  loadCreditCardsFromDb,
  resetCreditCardDbConnectionForTests,
} from './creditCardDb';

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

describe('CreditCardDb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCreditCardDbConnectionForTests();
    mockGetAllAsync.mockReset();
  });

  it('loadCreditCardsFromDb maps DB columns to CreditCardRow', async () => {
    mockGetAllAsync.mockResolvedValueOnce([
      { id: 1, card_name: 'A', bill_payment_day: 5 },
      { id: 2, card_name: 'B', bill_payment_day: 15 },
    ]);

    const rows = await loadCreditCardsFromDb();

    expect(mockExecAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS credit_cards'));
    expect(rows).toEqual([
      { id: 1, cardName: 'A', billPaymentDay: 5 },
      { id: 2, cardName: 'B', billPaymentDay: 15 },
    ]);
  });

  it('insertCreditCard runs INSERT with name and day', async () => {
    mockGetAllAsync.mockResolvedValueOnce([]);

    await insertCreditCard('Chase', 12);

    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO credit_cards'),
      'Chase',
      12,
    );
  });
});
