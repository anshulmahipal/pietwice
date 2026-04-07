/**
 * Unit: insurancePolicyLogic — labels and name normalization for insurance hub.
 */
import { formatPolicyCountLabel, normalizePolicyName } from './insurancePolicyLogic';

describe('insurancePolicyLogic', () => {
  it('normalizePolicyName trims', () => {
    expect(normalizePolicyName('  x  ')).toBe('x');
  });

  it('formatPolicyCountLabel pluralizes', () => {
    expect(formatPolicyCountLabel(0)).toBe('No policies');
    expect(formatPolicyCountLabel(1)).toBe('1 policy');
    expect(formatPolicyCountLabel(2)).toBe('2 policies');
  });
});
