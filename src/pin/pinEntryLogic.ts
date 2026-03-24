export const PIN_LENGTH = 4;

export function isSingleDigit(value: string): boolean {
  return /^[0-9]$/.test(value);
}

export function appendDigit(currentPin: string, digit: string): string {
  if (!isSingleDigit(digit) || currentPin.length >= PIN_LENGTH) {
    return currentPin;
  }
  return currentPin + digit;
}

export function deleteLastDigit(currentPin: string): string {
  return currentPin.slice(0, -1);
}
