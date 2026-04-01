import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { BillRow } from './billsLogic';
import { cancelAllBillReminders, requestBillReminderPermission, syncBillReminders } from './billReminders';
import { BILL_REMINDERS_ENABLED_STORAGE_KEY, useBillReminders } from './useBillReminders';

jest.mock('./billReminders', () => ({
  requestBillReminderPermission: jest.fn(),
  syncBillReminders: jest.fn(() => Promise.resolve()),
  cancelAllBillReminders: jest.fn(() => Promise.resolve()),
}));

const requestMock = requestBillReminderPermission as jest.MockedFunction<typeof requestBillReminderPermission>;
const syncMock = syncBillReminders as jest.MockedFunction<typeof syncBillReminders>;
const cancelMock = cancelAllBillReminders as jest.MockedFunction<typeof cancelAllBillReminders>;

const oneBill: BillRow[] = [
  {
    id: 1,
    billName: 'Electricity',
    providerName: 'BESCOM',
    amount: '1500',
    recurrenceType: 'monthly',
    dueDay: 10,
    dueDateYmd: null,
    reminderDaysBefore: 2,
    paymentUrl: '',
    isActive: true,
  },
];

describe('useBillReminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    requestMock.mockResolvedValue(true);
  });

  it('loads enabled flag and syncs reminders', async () => {
    await AsyncStorage.setItem(BILL_REMINDERS_ENABLED_STORAGE_KEY, 'true');

    const { result } = renderHook(() => useBillReminders(oneBill, true));

    await waitFor(() => {
      expect(result.current.remindersPrefLoaded).toBe(true);
    });
    expect(result.current.remindersEnabled).toBe(true);
    await waitFor(() => {
      expect(syncMock).toHaveBeenCalledWith(oneBill);
    });
  });

  it('enables reminders when permission is granted', async () => {
    const { result } = renderHook(() => useBillReminders(oneBill, true));
    await waitFor(() => expect(result.current.remindersPrefLoaded).toBe(true));

    let ok = false;
    await act(async () => {
      ok = await result.current.tryEnableReminders();
    });

    expect(ok).toBe(true);
    expect(await AsyncStorage.getItem(BILL_REMINDERS_ENABLED_STORAGE_KEY)).toBe('true');
    expect(result.current.remindersEnabled).toBe(true);
  });

  it('disables reminders and cancels schedules', async () => {
    await AsyncStorage.setItem(BILL_REMINDERS_ENABLED_STORAGE_KEY, 'true');
    const { result } = renderHook(() => useBillReminders(oneBill, true));
    await waitFor(() => expect(result.current.remindersPrefLoaded).toBe(true));

    await act(async () => {
      await result.current.disableReminders();
    });
    expect(await AsyncStorage.getItem(BILL_REMINDERS_ENABLED_STORAGE_KEY)).toBe('false');
    expect(cancelMock).toHaveBeenCalled();
  });
});
