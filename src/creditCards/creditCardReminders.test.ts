/**
 * Unit: CreditCardReminders — schedule/cancel monthly bill reminders (expo-notifications mocked).
 */
import { Platform } from 'react-native';
import {
  cancelAllCreditCardBillReminders,
  syncCreditCardBillReminders,
} from './creditCardReminders';
import { creditCardBillReminderIdentifier } from './creditCardReminderLogic';

const mockSetNotificationChannelAsync = jest.fn(() => Promise.resolve());
const mockGetPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted', canAskAgain: true, granted: true, expires: 'never' }),
);
const mockRequestPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted', canAskAgain: true, granted: true, expires: 'never' }),
);
const mockGetAllScheduledNotificationsAsync = jest.fn(() => Promise.resolve([]));
const mockCancelScheduledNotificationAsync = jest.fn(() => Promise.resolve());
const mockScheduleNotificationAsync = jest.fn(() => Promise.resolve('scheduled-id'));

jest.mock('expo-notifications', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined', PROVISIONAL: 'provisional' },
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { MONTHLY: 'monthly' },
  setNotificationChannelAsync: (...args: unknown[]) => mockSetNotificationChannelAsync(...args),
  getPermissionsAsync: () => mockGetPermissionsAsync(),
  requestPermissionsAsync: () => mockRequestPermissionsAsync(),
  getAllScheduledNotificationsAsync: () => mockGetAllScheduledNotificationsAsync(),
  cancelScheduledNotificationAsync: (id: string) => mockCancelScheduledNotificationAsync(id),
  scheduleNotificationAsync: (req: unknown) => mockScheduleNotificationAsync(req),
}));

describe('CreditCardReminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllScheduledNotificationsAsync.mockResolvedValue([]);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
  });

  it('syncCreditCardBillReminders clears prior credit-card reminders then schedules monthly triggers', async () => {
    mockGetAllScheduledNotificationsAsync.mockResolvedValue([
      {
        identifier: creditCardBillReminderIdentifier(1),
        content: { title: 'x', body: 'y' },
        trigger: { type: 'monthly' },
      },
    ]);

    await syncCreditCardBillReminders([{ id: 2, cardName: 'Visa', billPaymentDay: 12 }]);

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(
      creditCardBillReminderIdentifier(1),
    );
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: creditCardBillReminderIdentifier(2),
        content: expect.objectContaining({
          title: 'Card bill reminder',
          body: expect.stringContaining('Visa') as string,
        }),
        trigger: expect.objectContaining({
          type: 'monthly',
          day: 12,
          hour: 9,
          minute: 0,
        }),
      }),
    );
  });

  it('cancelAllCreditCardBillReminders cancels only prefixed identifiers', async () => {
    mockGetAllScheduledNotificationsAsync.mockResolvedValue([
      { identifier: 'credit-card-bill-reminder-5', content: {}, trigger: {} },
      { identifier: 'other-app-notification', content: {}, trigger: {} },
    ]);

    await cancelAllCreditCardBillReminders();

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'credit-card-bill-reminder-5',
    );
  });
});
