export type HouseholdGateTargetPhase = 'setup' | 'budget' | 'main';

export async function resolveHouseholdGatePhase(deps: {
  hasCompletedHouseholdIncomeSetup: () => Promise<boolean>;
  hasSeenHouseholdBudgetOnboarding: () => Promise<boolean>;
}): Promise<HouseholdGateTargetPhase> {
  const hasIncome = await deps.hasCompletedHouseholdIncomeSetup();
  if (!hasIncome) {
    return 'setup';
  }
  const seenBudget = await deps.hasSeenHouseholdBudgetOnboarding();
  if (!seenBudget) {
    return 'budget';
  }
  return 'main';
}
