/**
 * Unit: investmentLogic — labels and name normalization for investments hub.
 */
import { formatHoldingCountLabel, normalizeHoldingName } from './investmentLogic';

describe('investmentLogic', () => {
  it('normalizeHoldingName trims', () => {
    expect(normalizeHoldingName('  x  ')).toBe('x');
  });

  it('formatHoldingCountLabel pluralizes', () => {
    expect(formatHoldingCountLabel(0)).toBe('No holdings');
    expect(formatHoldingCountLabel(1)).toBe('1 holding');
    expect(formatHoldingCountLabel(3)).toBe('3 holdings');
  });
});
