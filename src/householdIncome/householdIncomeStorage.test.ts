/**
 * Unit: householdIncomeStorage — AsyncStorage load/save for household income setup.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearHouseholdIncomeForTests,
  hasCompletedHouseholdIncomeSetup,
  HOUSEHOLD_INCOME_STORAGE_KEY,
  loadHouseholdIncome,
  saveHouseholdIncome,
} from './householdIncomeStorage';

describe('householdIncomeStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('loadHouseholdIncome returns null when missing', async () => {
    expect(await loadHouseholdIncome()).toBeNull();
    expect(await hasCompletedHouseholdIncomeSetup()).toBe(false);
  });

  it('saveHouseholdIncome persists and loadHouseholdIncome reads back', async () => {
    await saveHouseholdIncome({ husbandIncome: '100000', wifeIncome: '80000' });
    expect(await AsyncStorage.getItem(HOUSEHOLD_INCOME_STORAGE_KEY)).toContain('100000');
    expect(await loadHouseholdIncome()).toEqual({
      husbandIncome: '100000',
      wifeIncome: '80000',
    });
    expect(await hasCompletedHouseholdIncomeSetup()).toBe(true);
  });

  it('loadHouseholdIncome returns null for invalid JSON shape', async () => {
    await AsyncStorage.setItem(HOUSEHOLD_INCOME_STORAGE_KEY, JSON.stringify({ foo: 1 }));
    expect(await loadHouseholdIncome()).toBeNull();
  });

  it('clearHouseholdIncomeForTests removes key', async () => {
    await saveHouseholdIncome({ husbandIncome: '1', wifeIncome: '2' });
    await clearHouseholdIncomeForTests();
    expect(await loadHouseholdIncome()).toBeNull();
  });
});
