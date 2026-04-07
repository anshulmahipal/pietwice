/**
 * Unit: InvestmentHubScreen — add sheet, list modal, count from hook.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { InvestmentHubScreen } from './InvestmentHubScreen';

const addHolding = jest.fn(() => Promise.resolve(true));
const clearFormError = jest.fn();

jest.mock('../../investments/useInvestments', () => ({
  useInvestments: jest.fn(),
}));

jest.mock('react-native-calendars', () => {
  const ReactNs = require('react');
  const { View: RNView } = require('react-native');
  return {
    Calendar: () => ReactNs.createElement(RNView, { testID: 'mock-investment-calendar' }),
  };
});

import { useInvestments } from '../../investments/useInvestments';

const useMock = useInvestments as jest.MockedFunction<typeof useInvestments>;

const Stack = createNativeStackNavigator();

function Host() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="InvestmentHub" component={InvestmentHubScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('InvestmentHubScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    addHolding.mockResolvedValue(true);
    useMock.mockReturnValue({
      holdings: [],
      isReady: true,
      isSaving: false,
      formError: null,
      addHolding,
      clearFormError,
    });
  });

  it('shows zero holdings and opens add sheet from header', async () => {
    render(<Host />);

    await waitFor(() => {
      expect(screen.getByTestId('investment-hub-header-add')).toBeTruthy();
    });

    expect(screen.getByTestId('investment-hub-count-value')).toHaveTextContent('0');

    fireEvent.press(screen.getByTestId('investment-hub-header-add'));
    expect(screen.getByTestId('investment-add-sheet')).toBeTruthy();
  });

  it('opens list modal from summary and shows holding rows', async () => {
    useMock.mockReturnValue({
      holdings: [{ id: 1, holdingName: 'PPF', activityDay: 1 }],
      isReady: true,
      isSaving: false,
      formError: null,
      addHolding,
      clearFormError,
    });

    render(<Host />);

    await waitFor(() => {
      expect(screen.getByLabelText('1 holding tracked. Tap to view the full list.')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('1 holding tracked. Tap to view the full list.'));
    expect(screen.getByTestId('investment-all-list-modal')).toBeTruthy();
    expect(screen.getByTestId('investment-all-list-row-1')).toBeTruthy();
  });
});
