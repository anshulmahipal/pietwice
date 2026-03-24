import * as SecureStore from 'expo-secure-store';

export const PIN_STORAGE_KEY = 'monthly_expense_login_pin_v1';

export async function getStoredPin(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_STORAGE_KEY);
}

export async function savePin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_STORAGE_KEY, pin, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}
