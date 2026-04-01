import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BillRow } from './billsLogic';
import {
  cancelAllBillReminders,
  requestBillReminderPermission,
  syncBillReminders,
} from './billReminders';

export const BILL_REMINDERS_ENABLED_STORAGE_KEY = 'bill_reminders_enabled_v1';

export function useBillReminders(bills: BillRow[], billsLoaded: boolean) {
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [remindersPrefLoaded, setRemindersPrefLoaded] = useState(false);

  const billsSignature = useMemo(
    () =>
      [...bills]
        .sort((a, b) => a.id - b.id)
        .map((b) => `${b.id}\t${b.recurrenceType}\t${b.dueDay ?? ''}\t${b.dueDateYmd ?? ''}\t${b.billName}`)
        .join('\n'),
    [bills],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(BILL_REMINDERS_ENABLED_STORAGE_KEY);
        if (!cancelled) {
          setRemindersEnabled(raw === 'true');
          setRemindersPrefLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setRemindersPrefLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!remindersPrefLoaded || !billsLoaded) {
      return;
    }
    void (async () => {
      if (remindersEnabled) {
        await syncBillReminders(bills);
      } else {
        await cancelAllBillReminders();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- aligns with billsSignature to avoid array ref-only syncs
  }, [remindersPrefLoaded, remindersEnabled, billsSignature, billsLoaded]);

  const tryEnableReminders = useCallback(async (): Promise<boolean> => {
    const granted = await requestBillReminderPermission();
    if (!granted) {
      return false;
    }
    await AsyncStorage.setItem(BILL_REMINDERS_ENABLED_STORAGE_KEY, 'true');
    setRemindersEnabled(true);
    return true;
  }, []);

  const disableReminders = useCallback(async () => {
    await AsyncStorage.setItem(BILL_REMINDERS_ENABLED_STORAGE_KEY, 'false');
    setRemindersEnabled(false);
    await cancelAllBillReminders();
  }, []);

  return {
    remindersEnabled,
    remindersPrefLoaded,
    tryEnableReminders,
    disableReminders,
  };
}
