/**
 * Unit: useCreditCards — load cards and add with validation.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { insertCreditCard, loadCreditCardsFromDb } from './creditCardDb';
import { useCreditCards } from './useCreditCards';

jest.mock('./creditCardDb', () => ({
  loadCreditCardsFromDb: jest.fn(),
  insertCreditCard: jest.fn(() => Promise.resolve()),
  resetCreditCardDbConnectionForTests: jest.fn(),
}));

const loadMock = loadCreditCardsFromDb as jest.MockedFunction<typeof loadCreditCardsFromDb>;
const insertMock = insertCreditCard as jest.MockedFunction<typeof insertCreditCard>;

describe('useCreditCards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadMock.mockResolvedValue([]);
  });

  it('loads cards when ready', async () => {
    loadMock.mockResolvedValue([{ id: 1, cardName: 'Visa', billPaymentDay: 10 }]);

    const { result } = renderHook(() => useCreditCards());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.cards).toEqual([{ id: 1, cardName: 'Visa', billPaymentDay: 10 }]);
  });

  it('addCard validates name and day before insert', async () => {
    const { result } = renderHook(() => useCreditCards());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    await act(async () => {
      await result.current.addCard('', '5');
    });
    expect(insertMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.addCard('Visa', '0');
    });
    expect(insertMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.addCard('Visa', '15');
    });
    expect(insertMock).toHaveBeenCalledWith('Visa', 15);
    expect(loadMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
