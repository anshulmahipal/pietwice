/**
 * Unit: MainTabs — bottom tabs for House expense, Credit card list, Profile.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PinSessionContext } from '../auth/PinSessionContext';
import { MainTabs } from './MainTabs';

jest.mock('../houseExpense/useHouseExpenseDashboard', () => ({
  useHouseExpenseDashboard: () => ({
    rows: [],
    isReady: true,
    refresh: jest.fn(() => Promise.resolve()),
    saveSpent: jest.fn(() => Promise.resolve()),
  }),
}));

jest.mock('../houseExpense/useExpenseCalendarMonth', () => ({
  useExpenseCalendarMonth: () => ({
    dayTotals: {},
    reloadDayTotals: jest.fn(() => Promise.resolve()),
    loadLinesForDay: jest.fn(() => Promise.resolve([])),
  }),
}));

jest.mock('../creditCards/useCreditCards', () => ({
  useCreditCards: () => ({
    cards: [],
    isReady: true,
    isSaving: false,
    formError: null,
    addCard: jest.fn(() => Promise.resolve(false)),
    clearFormError: jest.fn(),
  }),
}));

jest.mock('../creditCards/useCreditCardReminders', () => ({
  useCreditCardReminders: () => ({
    remindersEnabled: false,
    remindersPrefLoaded: true,
    tryEnableReminders: jest.fn(async () => true),
    disableReminders: jest.fn(async () => {}),
  }),
}));

jest.mock('../bills/useBills', () => ({
  useBills: () => ({
    bills: [],
    isReady: true,
    isSaving: false,
    formError: null,
    addBill: jest.fn(() => Promise.resolve(false)),
    clearFormError: jest.fn(),
  }),
}));

jest.mock('../bills/useBillReminders', () => ({
  useBillReminders: () => ({
    remindersEnabled: false,
    remindersPrefLoaded: true,
    tryEnableReminders: jest.fn(async () => true),
    disableReminders: jest.fn(async () => {}),
  }),
}));

jest.mock('react-native-calendars', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Calendar: () => React.createElement(View, { testID: 'mock-calendars-calendar-widget' }),
  };
});

function renderWithNav() {
  return render(
    <PinSessionContext.Provider value={{ replaceStoredPin: jest.fn() }}>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </PinSessionContext.Provider>,
  );
}

describe('MainTabs', () => {
  it('shows House expense on the first tab', () => {
    renderWithNav();
    expect(screen.getByTestId('screen-house-expense')).toBeTruthy();
  });

  it('shows Credit card list tab content after selecting that tab', () => {
    renderWithNav();
    fireEvent.press(screen.getByLabelText('Credit card list tab'));
    expect(screen.getByTestId('screen-credit-card-list')).toBeTruthy();
  });

  it('shows Bills tab content after selecting that tab', () => {
    renderWithNav();
    fireEvent.press(screen.getByLabelText('Bills tab'));
    expect(screen.getByTestId('screen-bills')).toBeTruthy();
  });

  it('shows Profile tab content after selecting that tab', () => {
    renderWithNav();
    fireEvent.press(screen.getByLabelText('Profile tab'));
    expect(screen.getByTestId('screen-profile')).toBeTruthy();
  });
});
