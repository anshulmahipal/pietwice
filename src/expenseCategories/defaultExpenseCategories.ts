import type { ExpenseCategoryRow } from './expenseCategoryLogic';

/** Built-in categories until the user customizes the list in settings. */
export const DEFAULT_EXPENSE_CATEGORY_ROWS: ExpenseCategoryRow[] = [
  { title: 'Milk', amount: '' },
  { title: 'Maid', amount: '' },
  { title: 'Grocery', amount: '' },
  { title: 'Fruits', amount: '' },
  { title: 'Vegetable', amount: '' },
  { title: 'Laundry/Toiletry', amount: '' },
  { title: 'Rent', amount: '' },
  { title: 'Electricity', amount: '' },
  { title: 'LPG', amount: '' },
  { title: 'phone', amount: '' },
  { title: 'wifi', amount: '' },
];
