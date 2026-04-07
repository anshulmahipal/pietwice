/**
 * Unit: InsuranceHubScreen — add sheet, list modal, count from hook.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { InsuranceHubScreen } from './InsuranceHubScreen';

const addPolicy = jest.fn(() => Promise.resolve(true));
const clearFormError = jest.fn();

jest.mock('../../insurancePolicies/useInsurancePolicies', () => ({
  useInsurancePolicies: jest.fn(),
}));

jest.mock('react-native-calendars', () => {
  const ReactNs = require('react');
  const { View: RNView } = require('react-native');
  return {
    Calendar: () => ReactNs.createElement(RNView, { testID: 'mock-insurance-calendar' }),
  };
});

import { useInsurancePolicies } from '../../insurancePolicies/useInsurancePolicies';

const useMock = useInsurancePolicies as jest.MockedFunction<typeof useInsurancePolicies>;

const Stack = createNativeStackNavigator();

function Host() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="InsuranceHub" component={InsuranceHubScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('InsuranceHubScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    addPolicy.mockResolvedValue(true);
    useMock.mockReturnValue({
      policies: [],
      isReady: true,
      isSaving: false,
      formError: null,
      addPolicy,
      clearFormError,
    });
  });

  it('shows zero policies and opens add sheet from header', async () => {
    render(<Host />);

    await waitFor(() => {
      expect(screen.getByTestId('insurance-hub-header-add')).toBeTruthy();
    });

    expect(screen.getByTestId('insurance-hub-count-value')).toHaveTextContent('0');

    fireEvent.press(screen.getByTestId('insurance-hub-header-add'));
    expect(screen.getByTestId('insurance-add-sheet')).toBeTruthy();
  });

  it('opens list modal from summary and shows policy rows', async () => {
    useMock.mockReturnValue({
      policies: [{ id: 2, policyName: 'Health', renewalDay: 10 }],
      isReady: true,
      isSaving: false,
      formError: null,
      addPolicy,
      clearFormError,
    });

    render(<Host />);

    await waitFor(() => {
      expect(screen.getByLabelText('1 policy tracked. Tap to view the full list.')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('1 policy tracked. Tap to view the full list.'));
    expect(screen.getByTestId('insurance-all-list-modal')).toBeTruthy();
    expect(screen.getByTestId('insurance-all-list-row-2')).toBeTruthy();
  });
});
