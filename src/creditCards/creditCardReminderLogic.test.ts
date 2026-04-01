/**
 * Unit: CreditCardReminderLogic — reminder id and notification copy.
 */
import {
  buildCreditCardBillReminderCopy,
  creditCardBillReminderIdentifier,
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
} from './creditCardReminderLogic';

describe('CreditCardReminderLogic', () => {
  it('builds stable notification identifiers per card id', () => {
    expect(creditCardBillReminderIdentifier(42)).toBe('credit-card-bill-reminder-42');
  });

  it('builds title and body with card name and bill day', () => {
    const { title, body } = buildCreditCardBillReminderCopy('Corporate Visa', 15);
    expect(title).toBe('Card bill reminder');
    expect(body).toContain('Corporate Visa');
    expect(body).toContain('15');
  });

  it('exports default reminder time (local)', () => {
    expect(DEFAULT_REMINDER_HOUR).toBe(9);
    expect(DEFAULT_REMINDER_MINUTE).toBe(0);
  });
});
