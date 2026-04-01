import React, { createContext, useContext } from 'react';

export type PinSessionContextValue = {
  replaceStoredPin: (pin: string) => void;
};

export const PinSessionContext = createContext<PinSessionContextValue | null>(
  null,
);

export function usePinSession(): PinSessionContextValue {
  const value = useContext(PinSessionContext);
  if (!value) {
    throw new Error('usePinSession must be used within PinSessionContext.Provider');
  }
  return value;
}
