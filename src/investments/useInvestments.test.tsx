/**
 * Unit: useInvestments — load holdings and add with validation.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { insertInvestment, loadInvestmentsFromDb } from './investmentDb';
import { useInvestments } from './useInvestments';

jest.mock('./investmentDb', () => ({
  loadInvestmentsFromDb: jest.fn(),
  insertInvestment: jest.fn(() => Promise.resolve()),
  resetInvestmentDbConnectionForTests: jest.fn(),
}));

const loadMock = loadInvestmentsFromDb as jest.MockedFunction<typeof loadInvestmentsFromDb>;
const insertMock = insertInvestment as jest.MockedFunction<typeof insertInvestment>;

describe('useInvestments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadMock.mockResolvedValue([]);
  });

  it('loads holdings when ready', async () => {
    loadMock.mockResolvedValue([{ id: 1, holdingName: 'PPF', activityDay: 1 }]);

    const { result } = renderHook(() => useInvestments());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.holdings).toEqual([{ id: 1, holdingName: 'PPF', activityDay: 1 }]);
  });

  it('addHolding validates name and day before insert', async () => {
    const { result } = renderHook(() => useInvestments());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    await act(async () => {
      await result.current.addHolding('', '5');
    });
    expect(insertMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.addHolding('PPF', '0');
    });
    expect(insertMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.addHolding('PPF', '15');
    });
    expect(insertMock).toHaveBeenCalledWith('PPF', 15);
    expect(loadMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
