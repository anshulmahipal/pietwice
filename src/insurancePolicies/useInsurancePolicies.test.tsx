/**
 * Unit: useInsurancePolicies — load policies and add with validation.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { insertInsurancePolicy, loadInsurancePoliciesFromDb } from './insurancePolicyDb';
import { useInsurancePolicies } from './useInsurancePolicies';

jest.mock('./insurancePolicyDb', () => ({
  loadInsurancePoliciesFromDb: jest.fn(),
  insertInsurancePolicy: jest.fn(() => Promise.resolve()),
  resetInsurancePolicyDbConnectionForTests: jest.fn(),
}));

const loadMock = loadInsurancePoliciesFromDb as jest.MockedFunction<
  typeof loadInsurancePoliciesFromDb
>;
const insertMock = insertInsurancePolicy as jest.MockedFunction<typeof insertInsurancePolicy>;

describe('useInsurancePolicies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadMock.mockResolvedValue([]);
  });

  it('loads policies when ready', async () => {
    loadMock.mockResolvedValue([{ id: 1, policyName: 'Health', renewalDay: 5 }]);

    const { result } = renderHook(() => useInsurancePolicies());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.policies).toEqual([{ id: 1, policyName: 'Health', renewalDay: 5 }]);
  });

  it('addPolicy validates name and day before insert', async () => {
    const { result } = renderHook(() => useInsurancePolicies());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    await act(async () => {
      await result.current.addPolicy('', '5');
    });
    expect(insertMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.addPolicy('Term', '40');
    });
    expect(insertMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.addPolicy('Term', '7');
    });
    expect(insertMock).toHaveBeenCalledWith('Term', 7);
    expect(loadMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
