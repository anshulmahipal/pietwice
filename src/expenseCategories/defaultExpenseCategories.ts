import type { ExpenseCategoryRow } from './expenseCategoryLogic';

/** Built-in categories until the user customizes the list in settings (amounts = monthly budget hints). */
export const DEFAULT_EXPENSE_CATEGORY_ROWS: ExpenseCategoryRow[] = [
  { title: 'Milk', amount: '1800' },
  { title: 'Maid', amount: '6000' },
  { title: 'Grocery', amount: '3000' },
  { title: 'Fruits', amount: '4500' },
  { title: 'Vegetable', amount: '3000' },
  { title: 'Laundry/Toiletry', amount: '500' },
  { title: 'Office Expense', amount: '4000' },
  { title: 'Rent', amount: '23000' },
  { title: 'Electricity', amount: '1200' },
  { title: 'LPG', amount: '650' },
  { title: 'Phone', amount: '400' },
  { title: 'WiFi', amount: '200' },
];
