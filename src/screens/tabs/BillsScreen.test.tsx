import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { BillsScreen } from './BillsScreen';

const addBill = jest.fn(() => Promise.resolve(true));
const clearFormError = jest.fn();

jest.mock('../../bills/useBills', () => ({
  useBills: jest.fn(),
}));

jest.mock('../../bills/useBillReminders', () => ({
  useBillReminders: () => ({
    remindersEnabled: false,
    remindersPrefLoaded: true,
    tryEnableReminders: jest.fn(async () => true),
    disableReminders: jest.fn(async () => {}),
  }),
}));

jest.mock('react-native-calendars', () => {
  const ReactNs = require('react');
  const { View: RNView } = require('react-native');
  return {
    Calendar: ({
      dayComponent: Day,
    }: {
      dayComponent?: (p: { date?: { dateString: string; day: number }; state?: string }) => React.ReactElement | null;
    }) => {
      const dateData = {
        dateString: '2026-04-10',
        day: 10,
        month: 4,
        year: 2026,
        timestamp: 0,
      };
      return ReactNs.createElement(
        RNView,
        { testID: 'mock-bills-calendar-widget' },
        Day ? ReactNs.createElement(Day, { date: dateData, state: '' }) : null,
      );
    },
  };
});

import { useBills } from '../../bills/useBills';

const useMock = useBills as jest.MockedFunction<typeof useBills>;
const Tab = createBottomTabNavigator();

function BillsTabHost() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Bills" component={BillsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

describe('BillsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: new Date(2026, 3, 1, 12, 0, 0) });
    useMock.mockReturnValue({
      bills: [{ id: 1, billName: 'Electricity', providerName: 'BESCOM', amount: '1500', recurrenceType: 'monthly', dueDay: 10, dueDateYmd: null, reminderDaysBefore: 2, paymentUrl: '', isActive: true }],
      isReady: true,
      isSaving: false,
      formError: null,
      addBill,
      clearFormError,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens add sheet from header Add', async () => {
    render(<BillsTabHost />);
    fireEvent.press(screen.getByTestId('bills-header-add'));
    await waitFor(() => {
      expect(screen.getByTestId('bills-add-sheet')).toBeTruthy();
    });
  });

  it('submits bill form', async () => {
    render(<BillsTabHost />);
    fireEvent.press(screen.getByTestId('bills-header-add'));
    await waitFor(() => expect(screen.getByTestId('bills-name-input')).toBeTruthy());

    fireEvent.changeText(screen.getByTestId('bills-name-input'), 'Water');
    fireEvent.changeText(screen.getByTestId('bills-provider-input'), 'BWSSB');
    fireEvent.changeText(screen.getByTestId('bills-amount-input'), '900');
    fireEvent.changeText(screen.getByTestId('bills-due-day-input'), '12');
    fireEvent.changeText(screen.getByTestId('bills-reminder-days-input'), '2');
    fireEvent.changeText(screen.getByTestId('bills-payment-url-input'), 'https://example.com');
    fireEvent.press(screen.getByTestId('bills-add-button'));

    await waitFor(() => {
      expect(addBill).toHaveBeenCalledWith(
        'Water',
        'BWSSB',
        '900',
        'monthly',
        '12',
        '',
        '2',
        'https://example.com',
      );
    });
  });

  it('opens due-day detail modal on calendar tap', async () => {
    render(<BillsTabHost />);
    fireEvent.press(screen.getByTestId('bills-cal-day-2026-04-10'));
    await waitFor(() => expect(screen.getByTestId('bills-day-detail-modal')).toBeTruthy());
    const modal = screen.getByTestId('bills-day-detail-modal');
    expect(within(modal).getByText('Electricity')).toBeTruthy();
  });
});
