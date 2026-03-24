# Feature registry

Use **canonical names** below when you ask for changes (“work on **House expense**”, “fix **Pin gate**”). Anyone assisting you can open this file to map your wording to code and tests.

Add a row when you ship a new feature; keep names stable so history stays searchable.

| Canonical name | Also called | What it is | Main code | Tests |
| --- | --- | --- | --- | --- |
| **App shell** | Root layout | Safe area, status bar, wraps app with `PinGate`. | `App.tsx` | — |
| **Pin gate** | App lock, PIN unlock | Blocks main UI until PIN is set/verified; secure storage. | `src/auth/PinGate.tsx`, `src/auth/usePinGate.ts`, `src/auth/pinGateLogic.ts`, `src/auth/pinSecureStorage.ts` | `pinGateLogic.test.ts`, `usePinGate.test.tsx` |
| **Set login PIN** | First-time PIN | Screen to create the login PIN. | `src/screens/SetLoginPinScreen.tsx` | `SetLoginPinScreen.test.tsx` |
| **PIN entry** | Keypad logic | Shared logic for entering/validating PIN digits. | `src/pin/pinEntryLogic.ts` | `pinEntryLogic.test.ts` |
| **Main tabs** | Bottom tabs | House expense stack, credit card list, profile tabs. | `src/navigation/MainTabs.tsx` | `MainTabs.test.tsx` |
| **House expense stack** | House expense nav | Stack: home, expense details, categories settings. | `src/navigation/HouseExpenseStack.tsx`, `src/navigation/houseExpenseStackTypes.ts` | `HouseExpenseStack.test.tsx` |
| **House expense** | Dashboard, home | Combined spend/budget card (opens details) + expense calendar; dashboard hook. | `src/screens/tabs/HouseExpenseScreen.tsx`, `src/houseExpense/useHouseExpenseDashboard.ts`, `src/houseExpense/expenseDashboardLogic.ts`, `src/houseExpense/expenseDate.ts` | `HouseExpenseScreen.test.tsx`, `useHouseExpenseDashboard.test.tsx`, `expenseDashboardLogic.test.ts`, `expenseDate.test.ts` |
| **House expense detail** | Category breakdown | Per-category bars and spent modal only (no combined total); same dashboard hook as home. | `src/screens/tabs/HouseExpenseDetailScreen.tsx` | `HouseExpenseDetailScreen.test.tsx` |
| **Expense calendar** | Calendar, spending by day | Month calendar in a bordered frame; per-day net amount (digits only); tap day for line items (`expense_line_items`). | `src/screens/tabs/HouseExpenseScreen.tsx`, `src/houseExpense/useExpenseCalendarMonth.ts`, `src/houseExpense/expenseCalendarLogic.ts`, `src/expenseCategories/expenseCategoryDb.ts` | `HouseExpenseScreen.test.tsx`, `useExpenseCalendarMonth.test.tsx`, `expenseCalendarLogic.test.ts` |
| **Expense categories** | Categories, settings | Default categories, CRUD-ish DB, list UI hook, settings screen. | `src/expenseCategories/*`, `src/screens/tabs/HouseExpenseSettingsScreen.tsx` | `expenseCategoryDb.test.ts`, `expenseCategoryLogic.test.ts`, `useExpenseCategories.test.tsx`, `HouseExpenseSettingsScreen.test.tsx` |
| **Credit card list** | Cards tab | Placeholder tab for future card list. | `src/screens/tabs/CreditCardListScreen.tsx` | — |
| **Profile** | Account tab | Placeholder profile / account screen. | `src/screens/tabs/ProfileScreen.tsx` | — |

## How to use with an assistant

- Name a feature from the **Canonical name** column (or a close **Also called** phrase).
- Say “read `FEATURES.md`” if the session is new so the registry stays in sync with your request.
