import { act, renderHook, waitFor } from '@testing-library/react-native';
import { insertBill, loadBillsFromDb } from './billsDb';
import { useBills } from './useBills';

jest.mock('./billsDb', () => ({
  loadBillsFromDb: jest.fn(),
  insertBill: jest.fn(() => Promise.resolve()),
}));

const loadMock = loadBillsFromDb as jest.MockedFunction<typeof loadBillsFromDb>;
const insertMock = insertBill as jest.MockedFunction<typeof insertBill>;

describe('useBills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadMock.mockResolvedValue([]);
  });

  it('loads bills initially', async () => {
    const { result } = renderHook(() => useBills());
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(loadMock).toHaveBeenCalled();
  });

  it('validates form fields before add', async () => {
    const { result } = renderHook(() => useBills());
    await waitFor(() => expect(result.current.isReady).toBe(true));

    let ok = true;
    await act(async () => {
      ok = await result.current.addBill('', '', '', 'monthly', '', '', '1', '');
    });
    expect(ok).toBe(false);
    expect(result.current.formError).toBe('Enter a bill name.');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('adds monthly bill and reloads', async () => {
    const { result } = renderHook(() => useBills());
    await waitFor(() => expect(result.current.isReady).toBe(true));

    let ok = false;
    await act(async () => {
      ok = await result.current.addBill(
        'Electricity',
        'BESCOM',
        '1500',
        'monthly',
        '10',
        '',
        '2',
        '',
      );
    });

    expect(ok).toBe(true);
    expect(insertMock).toHaveBeenCalledWith({
      billName: 'Electricity',
      providerName: 'BESCOM',
      amount: '1500',
      recurrenceType: 'monthly',
      dueDay: 10,
      dueDateYmd: null,
      reminderDaysBefore: 2,
      paymentUrl: '',
    });
  });
});
