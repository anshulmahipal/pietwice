/**
 * Unit: useCreditCardReminders — persisted toggle and sync/cancel reminders.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  cancelAllCreditCardBillReminders,
  requestCreditCardReminderPermission,
  syncCreditCardBillReminders,
} from './creditCardReminders';
import { CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY, useCreditCardReminders } from './useCreditCardReminders';

jest.mock('./creditCardReminders', () => ({
  requestCreditCardReminderPermission: jest.fn(),
  syncCreditCardBillReminders: jest.fn(() => Promise.resolve()),
  cancelAllCreditCardBillReminders: jest.fn(() => Promise.resolve()),
}));

const requestMock = requestCreditCardReminderPermission as jest.MockedFunction<
  typeof requestCreditCardReminderPermission
>;
const syncMock = syncCreditCardBillReminders as jest.MockedFunction<typeof syncCreditCardBillReminders>;
const cancelMock = cancelAllCreditCardBillReminders as jest.MockedFunction<
  typeof cancelAllCreditCardBillReminders
>;

describe('useCreditCardReminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    requestMock.mockResolvedValue(true);
  });

  it('loads enabled flag from AsyncStorage then syncs when on', async () => {
    await AsyncStorage.setItem(CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY, 'true');

    const cards = [{ id: 1, cardName: 'Visa', billPaymentDay: 10 }];
    const { result } = renderHook(() => useCreditCardReminders(cards, true));

    await waitFor(() => {
      expect(result.current.remindersPrefLoaded).toBe(true);
    });

    expect(result.current.remindersEnabled).toBe(true);

    await waitFor(() => {
      expect(syncMock).toHaveBeenCalledWith(cards);
    });
  });

  it('tryEnableReminders requests permission and persists when granted', async () => {
    const stableCards = [{ id: 2, cardName: 'Amex', billPaymentDay: 5 }];
    const { result } = renderHook(() => useCreditCardReminders(stableCards, true));

    await waitFor(() => {
      expect(result.current.remindersPrefLoaded).toBe(true);
    });

    let ok = false;
    await act(async () => {
      ok = await result.current.tryEnableReminders();
    });

    expect(ok).toBe(true);
    expect(requestMock).toHaveBeenCalled();
    expect(await AsyncStorage.getItem(CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY)).toBe('true');
    expect(result.current.remindersEnabled).toBe(true);
  });

  it('tryEnableReminders returns false when permission denied', async () => {
    requestMock.mockResolvedValue(false);

    const { result } = renderHook(() => useCreditCardReminders([], true));

    await waitFor(() => {
      expect(result.current.remindersPrefLoaded).toBe(true);
    });

    let ok = true;
    await act(async () => {
      ok = await result.current.tryEnableReminders();
    });

    expect(ok).toBe(false);
    expect(await AsyncStorage.getItem(CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY)).not.toBe('true');
  });

  it('disableReminders clears storage and cancels scheduled reminders', async () => {
    await AsyncStorage.setItem(CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY, 'true');

    const { result } = renderHook(() => useCreditCardReminders([], true));

    await waitFor(() => {
      expect(result.current.remindersPrefLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.disableReminders();
    });

    expect(await AsyncStorage.getItem(CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY)).toBe('false');
    expect(result.current.remindersEnabled).toBe(false);
    expect(cancelMock).toHaveBeenCalled();
  });

  it('does not sync or cancel until cards are loaded', async () => {
    await AsyncStorage.setItem(CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY, 'true');

    const cards = [{ id: 1, cardName: 'Visa', billPaymentDay: 10 }];
    const { result, rerender } = renderHook(
      ({ loaded }: { loaded: boolean }) => useCreditCardReminders(cards, loaded),
      { initialProps: { loaded: false } },
    );

    await waitFor(() => {
      expect(result.current.remindersPrefLoaded).toBe(true);
    });

    expect(syncMock).not.toHaveBeenCalled();
    expect(cancelMock).not.toHaveBeenCalled();

    rerender({ loaded: true });

    await waitFor(() => {
      expect(syncMock).toHaveBeenCalledWith(cards);
    });
  });
});
