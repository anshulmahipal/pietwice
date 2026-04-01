import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelAllCreditCardBillReminders,
  requestCreditCardReminderPermission,
  syncCreditCardBillReminders,
} from './creditCardReminders';

export const CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY = 'credit_card_bill_reminders_enabled_v1';

export type CreditCardReminderCard = {
  id: number;
  cardName: string;
  billPaymentDay: number;
};

export function useCreditCardReminders(cards: CreditCardReminderCard[], cardsLoaded: boolean) {
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [remindersPrefLoaded, setRemindersPrefLoaded] = useState(false);

  const cardsSignature = useMemo(
    () =>
      [...cards]
        .sort((a, b) => a.id - b.id)
        .map((c) => `${c.id}\t${c.billPaymentDay}\t${c.cardName}`)
        .join('\n'),
    [cards],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY);
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
    if (!remindersPrefLoaded || !cardsLoaded) {
      return;
    }
    void (async () => {
      if (remindersEnabled) {
        await syncCreditCardBillReminders(cards);
      } else {
        await cancelAllCreditCardBillReminders();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cards aligned with cardsSignature; avoid resync on array reference-only changes
  }, [remindersPrefLoaded, remindersEnabled, cardsSignature, cardsLoaded]);

  const tryEnableReminders = useCallback(async (): Promise<boolean> => {
    const granted = await requestCreditCardReminderPermission();
    if (!granted) {
      return false;
    }
    await AsyncStorage.setItem(CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY, 'true');
    setRemindersEnabled(true);
    return true;
  }, []);

  const disableReminders = useCallback(async () => {
    await AsyncStorage.setItem(CREDIT_CARD_REMINDERS_ENABLED_STORAGE_KEY, 'false');
    setRemindersEnabled(false);
    await cancelAllCreditCardBillReminders();
  }, []);

  return {
    remindersEnabled,
    remindersPrefLoaded,
    tryEnableReminders,
    disableReminders,
  };
}
