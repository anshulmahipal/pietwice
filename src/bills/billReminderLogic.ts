import type { BillRow } from './billsLogic';

export const BILL_REMINDER_ID_PREFIX = 'bill-reminder-';

export function billReminderIdentifier(billId: number): string {
  return `${BILL_REMINDER_ID_PREFIX}${billId}`;
}

export function buildBillReminderCopy(bill: BillRow): { title: string; body: string } {
  const providerPrefix = bill.providerName ? `${bill.providerName}: ` : '';
  return {
    title: 'Bill reminder',
    body: `${providerPrefix}${bill.billName} is coming up.`,
  };
}
