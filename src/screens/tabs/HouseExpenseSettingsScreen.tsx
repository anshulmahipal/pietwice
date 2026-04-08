import React from 'react';
import { ExpenseCategoriesScreen } from '../../expenseCategories/ExpenseCategoriesScreen';

/** More tab → Expense categories — same screen as household budget onboarding. */
export default function HouseExpenseSettingsScreen() {
  return <ExpenseCategoriesScreen mode="settings" />;
}
