/**
 * Unit: InsurancePolicyDb — SQLite load and insert for insurance policies.
 */
import {
  insertInsurancePolicy,
  loadInsurancePoliciesFromDb,
  resetInsurancePolicyDbConnectionForTests,
} from './insurancePolicyDb';

const mockExecAsync = jest.fn(() => Promise.resolve());
const mockGetAllAsync = jest.fn();
const mockRunAsync = jest.fn(() => Promise.resolve());

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: mockExecAsync,
      getAllAsync: mockGetAllAsync,
      runAsync: mockRunAsync,
    }),
  ),
}));

describe('InsurancePolicyDb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetInsurancePolicyDbConnectionForTests();
    mockGetAllAsync.mockReset();
  });

  it('loadInsurancePoliciesFromDb maps DB columns to InsurancePolicyRow', async () => {
    mockGetAllAsync.mockResolvedValueOnce([
      { id: 1, policy_name: 'Health', renewal_day: 12 },
    ]);

    const rows = await loadInsurancePoliciesFromDb();

    expect(mockExecAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS insurance_policies'),
    );
    expect(rows).toEqual([{ id: 1, policyName: 'Health', renewalDay: 12 }]);
  });

  it('insertInsurancePolicy runs INSERT with name and day', async () => {
    mockGetAllAsync.mockResolvedValueOnce([]);

    await insertInsurancePolicy('Term life', 3);

    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO insurance_policies'),
      'Term life',
      3,
    );
  });
});
