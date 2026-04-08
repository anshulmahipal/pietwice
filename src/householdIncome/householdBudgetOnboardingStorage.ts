import AsyncStorage from '@react-native-async-storage/async-storage';

export const HOUSEHOLD_BUDGET_ONBOARDING_SEEN_KEY = 'household_budget_onboarding_seen_v1';

export async function hasSeenHouseholdBudgetOnboarding(): Promise<boolean> {
  const v = await AsyncStorage.getItem(HOUSEHOLD_BUDGET_ONBOARDING_SEEN_KEY);
  return v === 'true';
}

export async function markHouseholdBudgetOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(HOUSEHOLD_BUDGET_ONBOARDING_SEEN_KEY, 'true');
}

/** Test-only */
export async function clearHouseholdBudgetOnboardingForTests(): Promise<void> {
  await AsyncStorage.removeItem(HOUSEHOLD_BUDGET_ONBOARDING_SEEN_KEY);
}
