import { useCallback, useState } from 'react';
import { isStoredPinMatch } from './pinGateLogic';
import { savePin } from './pinSecureStorage';

export type ChangePinStep = 'verify_current' | 'enter_new' | 'confirm_new';

type UseChangePinFlowOptions = {
  replaceStoredPin: (pin: string) => void;
};

export function useChangePinFlow({ replaceStoredPin }: UseChangePinFlowOptions) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<ChangePinStep>('verify_current');
  const [storedPinSnapshot, setStoredPinSnapshot] = useState<string | null>(null);
  const [pendingNewPin, setPendingNewPin] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);

  const close = useCallback(() => {
    setVisible(false);
    setStep('verify_current');
    setStoredPinSnapshot(null);
    setPendingNewPin(null);
    setErrorMessage(null);
    setResetToken(0);
  }, []);

  const open = useCallback((storedPin: string | null) => {
    setStoredPinSnapshot(storedPin);
    setStep('verify_current');
    setPendingNewPin(null);
    setErrorMessage(null);
    setResetToken(0);
    setVisible(true);
  }, []);

  const submitCurrentPin = useCallback(
    (pin: string) => {
      if (!isStoredPinMatch(pin, storedPinSnapshot)) {
        setErrorMessage('Incorrect PIN');
        setResetToken((t) => t + 1);
        return;
      }
      setErrorMessage(null);
      setStep('enter_new');
      setResetToken((t) => t + 1);
    },
    [storedPinSnapshot],
  );

  const submitNewPin = useCallback((pin: string) => {
    setPendingNewPin(pin);
    setStep('confirm_new');
    setResetToken((t) => t + 1);
  }, []);

  const submitConfirmPin = useCallback(
    async (pin: string) => {
      if (pin !== pendingNewPin) {
        setErrorMessage('PINs do not match');
        setResetToken((t) => t + 1);
        return;
      }
      await savePin(pin);
      replaceStoredPin(pin);
      close();
    },
    [pendingNewPin, replaceStoredPin, close],
  );

  return {
    visible,
    step,
    errorMessage,
    resetToken,
    open,
    close,
    submitCurrentPin,
    submitNewPin,
    submitConfirmPin,
  };
}
