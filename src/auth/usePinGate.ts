import { useCallback, useEffect, useRef, useState } from 'react';
import { isStoredPinMatch } from './pinGateLogic';
import { getStoredPin, savePin } from './pinSecureStorage';

export type PinGatePhase = 'loading' | 'create_pin' | 'unlock' | 'authenticated';

export function usePinGate() {
  const [phase, setPhase] = useState<PinGatePhase>('loading');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockResetToken, setUnlockResetToken] = useState(0);
  const storedPinRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const pin = await getStoredPin();
      if (cancelled) {
        return;
      }
      storedPinRef.current = pin;
      setPhase(pin ? 'unlock' : 'create_pin');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const submitCreatedPin = useCallback(async (pin: string) => {
    await savePin(pin);
    storedPinRef.current = pin;
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
    submitCreatedPin,
    submitUnlockPin,
    replaceStoredPin,
  };
}
