/**
 * Unit: ExpenseCategoryLogic — rows with title/amount, storage migration, add/update.
 */
import { DEFAULT_EXPENSE_CATEGORY_ROWS } from './defaultExpenseCategories';
import {
  addCategoryRowIfNew,
  normalizeStoredCategoryRows,
  updateCategoryRow,
} from './expenseCategoryLogic';

describe('ExpenseCategoryLogic', () => {
  describe('normalizeStoredCategoryRows', () => {
    it('returns a deep copy of default rows when storage is null', () => {
      const result = normalizeStoredCategoryRows(null, DEFAULT_EXPENSE_CATEGORY_ROWS);
      expect(result).toEqual(DEFAULT_EXPENSE_CATEGORY_ROWS);
      expect(result).not.toBe(DEFAULT_EXPENSE_CATEGORY_ROWS);
    });

    it('returns defaults when JSON is invalid', () => {
      expect(normalizeStoredCategoryRows('not-json', DEFAULT_EXPENSE_CATEGORY_ROWS)).toEqual(
        DEFAULT_EXPENSE_CATEGORY_ROWS,
      );
    });

    it('migrates legacy string array to rows with empty amounts', () => {
      expect(
        normalizeStoredCategoryRows(
          JSON.stringify([' Fuel ', 'Water']),
          DEFAULT_EXPENSE_CATEGORY_ROWS,
        ),
      ).toEqual([
        { title: 'Fuel', amount: '' },
        { title: 'Water', amount: '' },
      ]);
    });

    it('parses row objects with title and amount', () => {
      const raw = JSON.stringify([
        { title: 'Milk', amount: '120' },
        { title: 'Rent', amount: '15000' },
      ]);
      expect(normalizeStoredCategoryRows(raw, DEFAULT_EXPENSE_CATEGORY_ROWS)).toEqual([
        { title: 'Milk', amount: '120' },
        { title: 'Rent', amount: '15000' },
      ]);
    });

    it('coerces numeric amount to string', () => {
      const raw = JSON.stringify([{ title: 'X', amount: 99 }]);
      expect(normalizeStoredCategoryRows(raw, DEFAULT_EXPENSE_CATEGORY_ROWS)).toEqual([
        { title: 'X', amount: '99' },
      ]);
    });
  });

  describe('addCategoryRowIfNew', () => {
    const base = [
      { title: 'Milk', amount: '' },
      { title: 'Rent', amount: '100' },
    ];

    it('appends title and amount when new', () => {
      expect(addCategoryRowIfNew(base, '  Gym  ', '50')).toEqual([
        ...base,
        { title: 'Gym', amount: '50' },
      ]);
    });

    it('ignores empty title', () => {
      expect(addCategoryRowIfNew(base, '   ', '1')).toEqual(base);
    });

    it('does not add duplicate title ignoring case', () => {
      expect(addCategoryRowIfNew(base, 'milk', '9')).toEqual(base);
    });
  });

  describe('updateCategoryRow', () => {
    const rows = [
      { title: 'Milk', amount: '10' },
      { title: 'Rent', amount: '' },
    ];

    it('updates title when non-empty and not duplicate', () => {
      expect(updateCategoryRow(rows, 0, 'title', 'Dairy')).toEqual([
        { title: 'Dairy', amount: '10' },
        { title: 'Rent', amount: '' },
      ]);
    });

    it('ignores empty trimmed title', () => {
      expect(updateCategoryRow(rows, 0, 'title', '   ')).toEqual(rows);
    });

    it('ignores duplicate title on another row', () => {
      expect(updateCategoryRow(rows, 0, 'title', 'rent')).toEqual(rows);
    });

    it('updates amount', () => {
      expect(updateCategoryRow(rows, 1, 'amount', '2500')).toEqual([
        { title: 'Milk', amount: '10' },
        { title: 'Rent', amount: '2500' },
      ]);
    });
  });
});
