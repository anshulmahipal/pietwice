import {
  buildBillsDueEntriesInRange,
  buildBillsDueByYmdForMonth,
  formatRegisteredBillCountLabel,
  nextReminderDateForBill,
  parseBillAmount,
  parseBillDueDay,
  parseOneTimeDueDateYmd,
  parseReminderDaysBefore,
  type BillRow,
} from './billsLogic';

describe('billsLogic', () => {
  it('formats registered bill count label', () => {
    expect(formatRegisteredBillCountLabel(0)).toBe('No bills');
    expect(formatRegisteredBillCountLabel(1)).toBe('1 bill');
    expect(formatRegisteredBillCountLabel(3)).toBe('3 bills');
  });

  it('validates add form fields', () => {
    expect(parseBillAmount('')).toEqual({ ok: false, error: 'Enter bill amount.' });
    expect(parseBillAmount('21.995')).toEqual({ ok: false, error: 'Use a valid amount (up to 2 decimals).' });
    expect(parseBillAmount('2100')).toEqual({ ok: true, amount: '2100' });

    expect(parseBillDueDay('0')).toEqual({ ok: false, error: 'Day must be between 1 and 31.' });
    expect(parseBillDueDay('11')).toEqual({ ok: true, day: 11 });

    expect(parseOneTimeDueDateYmd('2026-02-30')).toEqual({ ok: false, error: 'Use due date format YYYY-MM-DD.' });
    expect(parseOneTimeDueDateYmd('2026-02-28')).toEqual({ ok: true, ymd: '2026-02-28' });

    expect(parseReminderDaysBefore('31')).toEqual({
      ok: false,
      error: 'Reminder days must be between 0 and 30.',
    });
    expect(parseReminderDaysBefore('')).toEqual({ ok: true, days: 1 });
  });

  it('builds due map for monthly and one-time bills', () => {
    const bills: BillRow[] = [
      {
        id: 1,
        billName: 'Electricity',
        providerName: 'BESCOM',
        amount: '1500',
        recurrenceType: 'monthly',
        dueDay: 5,
        dueDateYmd: null,
        reminderDaysBefore: 2,
        paymentUrl: '',
        isActive: true,
      },
      {
        id: 2,
        billName: 'School fee',
        providerName: '',
        amount: '4500',
        recurrenceType: 'one_time',
        dueDay: null,
        dueDateYmd: '2026-04-12',
        reminderDaysBefore: 3,
        paymentUrl: '',
        isActive: true,
      },
    ];

    const map = buildBillsDueByYmdForMonth(2026, 3, bills);
    expect(map['2026-04-05']?.[0]?.billName).toBe('Electricity');
    expect(map['2026-04-12']?.[0]?.billName).toBe('School fee');
  });

  it('builds due entries inside date range', () => {
    const bills: BillRow[] = [
      {
        id: 1,
        billName: 'Electricity',
        providerName: '',
        amount: '1200',
        recurrenceType: 'monthly',
        dueDay: 10,
        dueDateYmd: null,
        reminderDaysBefore: 2,
        paymentUrl: '',
        isActive: true,
      },
      {
        id: 2,
        billName: 'School fee',
        providerName: '',
        amount: '3000',
        recurrenceType: 'one_time',
        dueDay: null,
        dueDateYmd: '2026-04-15',
        reminderDaysBefore: 1,
        paymentUrl: '',
        isActive: true,
      },
    ];

    const entries = buildBillsDueEntriesInRange('2026-04-01', '2026-04-30', bills);
    expect(entries.length).toBe(2);
    expect(entries[0].dueDateYmd).toBe('2026-04-10');
    expect(entries[1].dueDateYmd).toBe('2026-04-15');
  });

  it('computes next reminder for monthly and one-time bills', () => {
    const now = new Date(2026, 3, 1, 8, 0, 0);

    const monthly: BillRow = {
      id: 1,
      billName: 'Electricity',
      providerName: '',
      amount: '1500',
      recurrenceType: 'monthly',
      dueDay: 10,
      dueDateYmd: null,
      reminderDaysBefore: 2,
      paymentUrl: '',
      isActive: true,
    };
    const oneTime: BillRow = {
      id: 2,
      billName: 'School',
      providerName: '',
      amount: '4000',
      recurrenceType: 'one_time',
      dueDay: null,
      dueDateYmd: '2026-04-20',
      reminderDaysBefore: 1,
      paymentUrl: '',
      isActive: true,
    };

    expect(nextReminderDateForBill(monthly, now)?.toISOString()).toContain('2026-04-08');
    expect(nextReminderDateForBill(oneTime, now)?.toISOString()).toContain('2026-04-19');
  });
});
