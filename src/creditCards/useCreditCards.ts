import { useCallback, useEffect, useState } from 'react';
import { insertCreditCard, loadCreditCardsFromDb, type CreditCardRow } from './creditCardDb';
import { normalizeCardName, parseBillPaymentDay } from './creditCardLogic';

export function useCreditCards() {
  const [cards, setCards] = useState<CreditCardRow[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const rows = await loadCreditCardsFromDb();
    setCards(rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await reload();
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const addCard = useCallback(
    async (cardNameRaw: string, billPaymentDayRaw: string) => {
      setFormError(null);
      const name = normalizeCardName(cardNameRaw);
      if (name === '') {
        setFormError('Enter a card name.');
        return false;
      }
      const parsed = parseBillPaymentDay(billPaymentDayRaw);
      if (!parsed.ok) {
        setFormError(parsed.error);
        return false;
      }
      setIsSaving(true);
      try {
        await insertCreditCard(name, parsed.day);
        await reload();
        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  return { cards, isReady, isSaving, formError, addCard, clearFormError: () => setFormError(null) };
}
