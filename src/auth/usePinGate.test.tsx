/**
 * Unit: usePinGate — load / create (with confirm) / unlock PIN and expose authenticated phase.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { PIN_STORAGE_KEY } from './pinSecureStorage';
import { usePinGate } from './usePinGate';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const getItemAsync = SecureStore.getItemAsync as jest.Mock;
const setItemAsync = SecureStore.setItemAsync as jest.Mock;
const deleteItemAsync = SecureStore.deleteItemAsync as jest.Mock;

describe('usePinGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in loading then moves to create_pin when no PIN is stored', async () => {
    getItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => usePinGate());

    expect(result.current.phase).toBe('loading');

    await waitFor(() => {
      expect(result.current.phase).toBe('create_pin');
    });
  });

  it('deletes invalid stored value and shows create_pin', async () => {
    getItemAsync.mockResolvedValue('not-valid');
    deleteItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePinGate());

    await waitFor(() => {
      expect(result.current.phase).toBe('create_pin');
    });

    expect(deleteItemAsync).toHaveBeenCalledWith(PIN_STORAGE_KEY);
  });

  it('starts in loading then moves to unlock when a valid PIN is stored', async () => {
    getItemAsync.mockResolvedValue('2026');

    const { result } = renderHook(() => usePinGate());

    await waitFor(() => {
      expect(result.current.phase).toBe('unlock');
    });

    expect(result.current.unlockError).toBeNull();
    expect(result.current.unlockResetToken).toBe(0);
  });

  it('persists PIN and authenticates after first entry and matching confirm', async () => {
    getItemAsync.mockResolvedValue(null);
    setItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePinGate());

    await waitFor(() => {
      expect(result.current.phase).toBe('create_pin');
    });

    await act(() => {
      result.current.submitFirstCreatePin('5678');
    });

    expect(result.current.phase).toBe('create_pin_confirm');

    await act(async () => {
      await result.current.submitConfirmCreatePin('5678');
    });

    expect(setItemAsync).toHaveBeenCalledWith(
      PIN_STORAGE_KEY,
      '5678',
      expect.any(Object),
    );
    expect(result.current.phase).toBe('authenticated');
  });

  it('sets create PIN error when confirm does not match', async () => {
    getItemAsync.mockResolvedValue(null);

    const { result } = renderHook(() => usePinGate());

    await waitFor(() => {
      expect(result.current.phase).toBe('create_pin');
    });

    await act(() => {
      result.current.submitFirstCreatePin('1111');
    });

    await act(async () => {
      await result.current.submitConfirmCreatePin('2222');
    });

    expect(result.current.createPinError).toBe('PINs do not match');
    expect(result.current.phase).toBe('create_pin_confirm');
  });

  it('authenticates on unlock when PIN matches', async () => {
    getItemAsync.mockResolvedValue('3041');

    const { result } = renderHook(() => usePinGate());

    await waitFor(() => {
      expect(result.current.phase).toBe('unlock');
    });

    await act(async () => {
      await result.current.submitUnlockPin('3041');
    });

    expect(result.current.phase).toBe('authenticated');
    expect(result.current.unlockError).toBeNull();
  });

  it('sets error and bumps reset token when unlock PIN is wrong', async () => {
    getItemAsync.mockResolvedValue('1111');

    const { result } = renderHook(() => usePinGate());

    await waitFor(() => {
      expect(result.current.phase).toBe('unlock');
    });

    await act(async () => {
      await result.current.submitUnlockPin('2222');
    });

    expect(result.current.phase).toBe('unlock');
    expect(result.current.unlockError).toBe('Incorrect PIN');
    expect(result.current.unlockResetToken).toBe(1);
  });
});
