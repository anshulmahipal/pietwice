/**
 * Unit: householdBudgetOnboardingStorage — one-time flag after budget overview.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearHouseholdBudgetOnboardingForTests,
  hasSeenHouseholdBudgetOnboarding,
  HOUSEHOLD_BUDGET_ONBOARDING_SEEN_KEY,
  markHouseholdBudgetOnboardingSeen,
} from './householdBudgetOnboardingStorage';

describe('householdBudgetOnboardingStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('hasSeenHouseholdBudgetOnboarding is false when missing', async () => {
    expect(await hasSeenHouseholdBudgetOnboarding()).toBe(false);
  });

  it('markHouseholdBudgetOnboardingSeen persists true', async () => {
    await markHouseholdBudgetOnboardingSeen();
    expect(await AsyncStorage.getItem(HOUSEHOLD_BUDGET_ONBOARDING_SEEN_KEY)).toBe('true');
    expect(await hasSeenHouseholdBudgetOnboarding()).toBe(true);
  });

  it('clearHouseholdBudgetOnboardingForTests removes flag', async () => {
    await markHouseholdBudgetOnboardingSeen();
    await clearHouseholdBudgetOnboardingForTests();
    expect(await hasSeenHouseholdBudgetOnboarding()).toBe(false);
  });
});
