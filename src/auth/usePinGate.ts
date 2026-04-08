import { deleteItemAsync } from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isStoredPinMatch, normalizeStoredPin } from './pinGateLogic';
import { getStoredPin, PIN_STORAGE_KEY, savePin } from './pinSecureStorage';

export type PinGatePhase =
  | 'loading'
  | 'create_pin'
  | 'create_pin_confirm'
  | 'unlock'
  | 'authenticated';

export function usePinGate() {
  const [phase, setPhase] = useState<PinGatePhase>('loading');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockResetToken, setUnlockResetToken] = useState(0);
  const [createPinError, setCreatePinError] = useState<string | null>(null);
  const [createPinResetToken, setCreatePinResetToken] = useState(0);
  const storedPinRef = useRef<string | null>(null);
  const pendingCreatePinRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const raw = await getStoredPin();
      if (cancelled) {
        return;
      }
      const normalized = normalizeStoredPin(raw);
      if (raw !== null && normalized === null) {
        try {
          await deleteItemAsync(PIN_STORAGE_KEY);
        } catch {
          // ignore delete failures
        }
      }
      storedPinRef.current = normalized;
      setPhase(normalized ? 'unlock' : 'create_pin');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const submitFirstCreatePin = useCallback((pin: string) => {
    pendingCreatePinRef.current = pin;
    setCreatePinError(null);
    setPhase('create_pin_confirm');
    setCreatePinResetToken((t) => t + 1);
  }, []);

  const submitConfirmCreatePin = useCallback(async (pin: string) => {
    const expected = pendingCreatePinRef.current;
    if (expected === null) {
      setPhase('create_pin');
      return;
    }
    if (pin !== expected) {
      setCreatePinError('PINs do not match');
      setCreatePinResetToken((t) => t + 1);
      return;
    }
    await savePin(pin);
    storedPinRef.current = pin;
    pendingCreatePinRef.current = null;
    setCreatePinError(null);
    setPhase('authenticated');
  }, []);

  const submitUnlockPin = useCallback(async (pin: string) => {
    if (isStoredPinMatch(pin, storedPinRef.current)) {
      setUnlockError(null);
      setPhase('authenticated');
      return;
    }
    setUnlockError('Incorrect PIN');
    setUnlockResetToken((token) => token + 1);
  }, []);

  const replaceStoredPin = useCallback((pin: string) => {
    storedPinRef.current = pin;
  }, []);

  return {
    phase,
    unlockError,
    unlockResetToken,
    createPinError,
    createPinResetToken,
    submitFirstCreatePin,
    submitConfirmCreatePin,
    submitUnlockPin,
    replaceStoredPin,
  };
}
