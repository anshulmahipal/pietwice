import AsyncStorage from '@react-native-async-storage/async-storage';

export const HOUSEHOLD_INCOME_STORAGE_KEY = 'household_income_setup_v1';

export type HouseholdIncomeStored = {
  husbandIncome: string;
  wifeIncome: string;
};

export async function loadHouseholdIncome(): Promise<HouseholdIncomeStored | null> {
  const raw = await AsyncStorage.getItem(HOUSEHOLD_INCOME_STORAGE_KEY);
  if (raw === null) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<HouseholdIncomeStored>;
    if (
      typeof parsed.husbandIncome !== 'string' ||
      typeof parsed.wifeIncome !== 'string'
    ) {
      return null;
    }
    return {
      husbandIncome: parsed.husbandIncome,
      wifeIncome: parsed.wifeIncome,
    };
  } catch {
    return null;
  }
}

export async function saveHouseholdIncome(data: HouseholdIncomeStored): Promise<void> {
  await AsyncStorage.setItem(HOUSEHOLD_INCOME_STORAGE_KEY, JSON.stringify(data));
}

export async function hasCompletedHouseholdIncomeSetup(): Promise<boolean> {
  const v = await loadHouseholdIncome();
  return v !== null;
}

/** Test-only: clear stored household income. */
export async function clearHouseholdIncomeForTests(): Promise<void> {
  await AsyncStorage.removeItem(HOUSEHOLD_INCOME_STORAGE_KEY);
}
