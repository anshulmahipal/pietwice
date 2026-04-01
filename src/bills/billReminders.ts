import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BILL_REMINDER_ID_PREFIX, billReminderIdentifier, buildBillReminderCopy } from './billReminderLogic';
import { nextReminderDateForBill, type BillRow } from './billsLogic';

export const ANDROID_BILL_REMINDER_CHANNEL_ID = 'bill-reminders';

export async function ensureBillReminderAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(ANDROID_BILL_REMINDER_CHANNEL_ID, {
    name: 'Bills',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563eb',
  });
}

export async function getBillReminderPermissionGranted(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.status === Notifications.PermissionStatus.GRANTED ||
    settings.status === Notifications.PermissionStatus.PROVISIONAL
  );
}

export async function requestBillReminderPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  await ensureBillReminderAndroidChannel();
  const settings = await Notifications.requestPermissionsAsync();
  return (
    settings.status === Notifications.PermissionStatus.GRANTED ||
    settings.status === Notifications.PermissionStatus.PROVISIONAL
  );
}

export async function cancelAllBillReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(BILL_REMINDER_ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

export async function syncBillReminders(bills: BillRow[]): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await ensureBillReminderAndroidChannel();
  await cancelAllBillReminders();

  const now = new Date();
  for (const bill of bills) {
    const triggerDate = nextReminderDateForBill(bill, now);
    if (!triggerDate) {
      continue;
    }
    const { title, body } = buildBillReminderCopy(bill);
    await Notifications.scheduleNotificationAsync({
      identifier: billReminderIdentifier(bill.id),
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? ANDROID_BILL_REMINDER_CHANNEL_ID : undefined,
      },
    });
  }
}
