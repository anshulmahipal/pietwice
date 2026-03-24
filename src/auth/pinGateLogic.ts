export function isStoredPinMatch(enteredPin: string, storedPin: string | null): boolean {
  return storedPin !== null && enteredPin === storedPin;
}
