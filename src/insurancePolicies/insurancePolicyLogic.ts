export function normalizePolicyName(raw: string): string {
  return raw.trim();
}

export function formatPolicyCountLabel(count: number): string {
  if (count === 0) {
    return 'No policies';
  }
  if (count === 1) {
    return '1 policy';
  }
  return `${count} policies`;
}
