/**
 * Unit: useChangePinFlow — verify current PIN, set new PIN, confirm, persist.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { PIN_STORAGE_KEY } from './pinSecureStorage';
import { useChangePinFlow } from './useChangePinFlow';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const setItemAsync = SecureStore.setItemAsync as jest.Mock;

describe('useChangePinFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setItemAsync.mockResolvedValue(undefined);
  });

  it('starts closed with verify step', () => {
    const replaceStoredPin = jest.fn();
    const { result } = renderHook(() =>
      useChangePinFlow({ replaceStoredPin }),
    );

    expect(result.current.visible).toBe(false);
    expect(result.current.step).toBe('verify_current');
  });

  it('opens with snapshot PIN and shows verify step', () => {
    const replaceStoredPin = jest.fn();
    const { result } = renderHook(() =>
      useChangePinFlow({ replaceStoredPin }),
    );

    act(() => {
      result.current.open('2026');
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.step).toBe('verify_current');
    expect(result.current.errorMessage).toBeNull();
  });

  it('on wrong current PIN sets error and bumps reset token', () => {
    const replaceStoredPin = jest.fn();
    const { result } = renderHook(() =>
      useChangePinFlow({ replaceStoredPin }),
    );

    act(() => {
      result.current.open('2026');
    });

    act(() => {
      result.current.submitCurrentPin('9999');
    });

    expect(result.current.step).toBe('verify_current');
    expect(result.current.errorMessage).toBe('Incorrect PIN');
    expect(result.current.resetToken).toBe(1);
    expect(setItemAsync).not.toHaveBeenCalled();
  });

  it('moves to enter_new after correct current PIN', () => {
    const replaceStoredPin = jest.fn();
    const { result } = renderHook(() =>
      useChangePinFlow({ replaceStoredPin }),
    );

    act(() => {
      result.current.open('2026');
    });

    act(() => {
      result.current.submitCurrentPin('2026');
    });

    expect(result.current.step).toBe('enter_new');
    expect(result.current.errorMessage).toBeNull();
  });

  it('moves to confirm_new after new PIN entry', () => {
    const replaceStoredPin = jest.fn();
    const { result } = renderHook(() =>
      useChangePinFlow({ replaceStoredPin }),
    );

    act(() => {
      result.current.open('2026');
    });
    act(() => {
      result.current.submitCurrentPin('2026');
    });
    act(() => {
      result.current.submitNewPin('5555');
    });

    expect(result.current.step).toBe('confirm_new');
  });

  it('on confirm mismatch sets error and does not save', async () => {
    const replaceStoredPin = jest.fn();
    const { result } = renderHook(() =>
      useChangePinFlow({ replaceStoredPin }),
    );

    act(() => {
      result.current.open('2026');
    });
    act(() => {
      result.current.submitCurrentPin('2026');
    });
    act(() => {
      result.current.submitNewPin('5555');
    });

    await act(async () => {
      await result.current.submitConfirmPin('5556');
    });

    expect(result.current.step).toBe('confirm_new');
    expect(result.current.errorMessage).toBe('PINs do not match');
    expect(setItemAsync).not.toHaveBeenCalled();
    expect(replaceStoredPin).not.toHaveBeenCalled();
  });

  it('saves PIN, replaces session ref, and closes on matching confirm', async () => {
    const replaceStoredPin = jest.fn();
    const { result } = renderHook(() =>
      useChangePinFlow({ replaceStoredPin }),
    );

    act(() => {
      result.current.open('2026');
    });
    act(() => {
      result.current.submitCurrentPin('2026');
    });
    act(() => {
      result.current.submitNewPin('7777');
    });

    await act(async () => {
      await result.current.submitConfirmPin('7777');
    });

    await waitFor(() => {
      expect(result.current.visible).toBe(false);
    });

    expect(setItemAsync).toHaveBeenCalledWith(
      PIN_STORAGE_KEY,
      '7777',
      expect.any(Object),
    );
    expect(replaceStoredPin).toHaveBeenCalledWith('7777');
  });

  it('close resets state for next open', () => {
    const replaceStoredPin = jest.fn();
    const { result } = renderHook(() =>
      useChangePinFlow({ replaceStoredPin }),
    );

    act(() => {
      result.current.open('2026');
    });
    act(() => {
      result.current.close();
    });

    expect(result.current.visible).toBe(false);
    expect(result.current.step).toBe('verify_current');

    act(() => {
      result.current.open('2026');
    });

    expect(result.current.errorMessage).toBeNull();
    expect(result.current.resetToken).toBe(0);
  });
});
