import React from 'react';
import { ExpenseCategoriesScreen } from '../expenseCategories/ExpenseCategoriesScreen';

type HouseholdBudgetOverviewScreenProps = {
  onComplete: () => void;
};

/** Household onboarding step — same UI as More → Expense categories (`ExpenseCategoriesScreen`). */
export function HouseholdBudgetOverviewScreen({ onComplete }: HouseholdBudgetOverviewScreenProps) {
  return <ExpenseCategoriesScreen mode="onboarding" onOnboardingComplete={onComplete} />;
}
