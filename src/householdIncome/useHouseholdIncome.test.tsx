/**
 * Unit: useHouseholdIncome — load stored household income and total.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';
import { HOUSEHOLD_INCOME_STORAGE_KEY } from './householdIncomeStorage';
import { useHouseholdIncomeSummary } from './useHouseholdIncome';

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useFocusEffect: (cb: () => void) => {
      React.useEffect(() => {
        cb();
      }, [cb]);
    },
  };
});

describe('useHouseholdIncomeSummary', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null data when nothing stored', async () => {
    const { result } = renderHook(() => useHouseholdIncomeSummary());

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.totalMonthly).toBe(0);
  });

  it('loads stored incomes and sums total', async () => {
    await AsyncStorage.setItem(
      HOUSEHOLD_INCOME_STORAGE_KEY,
      JSON.stringify({ husbandIncome: '100000', wifeIncome: '50000' }),
    );

    const { result } = renderHook(() => useHouseholdIncomeSummary());

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(result.current.data).toEqual({
      husbandIncome: '100000',
      wifeIncome: '50000',
    });
    expect(result.current.totalMonthly).toBe(150000);
  });
});
