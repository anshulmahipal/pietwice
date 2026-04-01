export const CREDIT_CARD_BILL_REMINDER_ID_PREFIX = 'credit-card-bill-reminder-';

export const DEFAULT_REMINDER_HOUR = 9;
export const DEFAULT_REMINDER_MINUTE = 0;

export function creditCardBillReminderIdentifier(cardId: number): string {
  return `${CREDIT_CARD_BILL_REMINDER_ID_PREFIX}${cardId}`;
}

export function buildCreditCardBillReminderCopy(
  cardName: string,
  billPaymentDay: number,
): { title: string; body: string } {
  return {
    title: 'Card bill reminder',
    body: `${cardName}: company bill payment day is the ${billPaymentDay}${ordinalSuffix(billPaymentDay)} of each month.`,
  };
}

function ordinalSuffix(day: number): string {
  const d = day % 100;
  if (d >= 11 && d <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
