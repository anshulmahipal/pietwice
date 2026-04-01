import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  buildCreditCardBillReminderCopy,
  creditCardBillReminderIdentifier,
  CREDIT_CARD_BILL_REMINDER_ID_PREFIX,
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
} from './creditCardReminderLogic';

export const ANDROID_CREDIT_CARD_REMINDER_CHANNEL_ID = 'credit-card-bill-days';

export type CreditCardReminderRow = {
  id: number;
  cardName: string;
  billPaymentDay: number;
};

export async function ensureCreditCardReminderAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(ANDROID_CREDIT_CARD_REMINDER_CHANNEL_ID, {
    name: 'Credit card bill days',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563eb',
  });
}

export async function getCreditCardReminderPermissionGranted(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.status === Notifications.PermissionStatus.GRANTED ||
    settings.status === Notifications.PermissionStatus.PROVISIONAL
  );
}

export async function requestCreditCardReminderPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  await ensureCreditCardReminderAndroidChannel();
  const settings = await Notifications.requestPermissionsAsync();
  return (
    settings.status === Notifications.PermissionStatus.GRANTED ||
    settings.status === Notifications.PermissionStatus.PROVISIONAL
  );
}

export async function cancelAllCreditCardBillReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(CREDIT_CARD_BILL_REMINDER_ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

export async function syncCreditCardBillReminders(cards: CreditCardReminderRow[]): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await ensureCreditCardReminderAndroidChannel();
  await cancelAllCreditCardBillReminders();

  for (const card of cards) {
    const { title, body } = buildCreditCardBillReminderCopy(card.cardName, card.billPaymentDay);
    await Notifications.scheduleNotificationAsync({
      identifier: creditCardBillReminderIdentifier(card.id),
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: card.billPaymentDay,
        hour: DEFAULT_REMINDER_HOUR,
        minute: DEFAULT_REMINDER_MINUTE,
        channelId: Platform.OS === 'android' ? ANDROID_CREDIT_CARD_REMINDER_CHANNEL_ID : undefined,
      },
    });
  }
}
