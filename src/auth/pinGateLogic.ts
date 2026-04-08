import { PIN_LENGTH } from '../pin/pinEntryLogic';

export function isStoredPinMatch(enteredPin: string, storedPin: string | null): boolean {
  return storedPin !== null && enteredPin === storedPin;
}

/**
 * Only treat SecureStore values as a real PIN when they are exactly 4 digits.
 * Invalid or legacy values are ignored so the app shows first-time setup instead of unlock with "Incorrect PIN".
 */
export function normalizeStoredPin(raw: string | null): string | null {
  if (raw == null || typeof raw !== 'string') {
    return null;
  }
  const t = raw.trim();
  if (t.length !== PIN_LENGTH || !/^\d+$/.test(t)) {
    return null;
  }
  return t;
}
