/**
 * Unit: householdIncomeGateLogic — which onboarding screen to show before main tabs.
 */
import { resolveHouseholdGatePhase } from './householdIncomeGateLogic';

describe('resolveHouseholdGatePhase', () => {
  it('returns setup when income not saved', async () => {
    const phase = await resolveHouseholdGatePhase({
      hasCompletedHouseholdIncomeSetup: async () => false,
      hasSeenHouseholdBudgetOnboarding: async () => false,
    });
    expect(phase).toBe('setup');
  });

  it('returns budget when income saved but budget intro not seen', async () => {
    const phase = await resolveHouseholdGatePhase({
      hasCompletedHouseholdIncomeSetup: async () => true,
      hasSeenHouseholdBudgetOnboarding: async () => false,
    });
    expect(phase).toBe('budget');
  });

  it('returns main when income and budget intro are done', async () => {
    const phase = await resolveHouseholdGatePhase({
      hasCompletedHouseholdIncomeSetup: async () => true,
      hasSeenHouseholdBudgetOnboarding: async () => true,
    });
    expect(phase).toBe('main');
  });
});
