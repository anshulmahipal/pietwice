/**
 * Unit: PinGate — first launch shows set-PIN before main app; returning user unlocks.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { PinGate } from './PinGate';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('../householdIncome/HouseholdIncomeGate', () => ({
  HouseholdIncomeGate: () => {
    const { View } = require('react-native');
    return <View testID="main-tabs-stub" />;
  },
}));

const getItemAsync = SecureStore.getItemAsync as jest.Mock;

describe('PinGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows set-PIN screen on first launch when no PIN is stored', async () => {
    getItemAsync.mockResolvedValue(null);

    render(<PinGate />);

    await waitFor(() => {
      expect(screen.getByTestId('set-login-pin-screen')).toBeTruthy();
    });

    expect(screen.getByText('Create your PIN')).toBeTruthy();
    expect(screen.getByText(/Choose 4 digits/)).toBeTruthy();
    expect(screen.queryByTestId('main-tabs-stub')).toBeNull();
  });

  it('shows unlock screen when a PIN is already stored', async () => {
    getItemAsync.mockResolvedValue('4242');

    render(<PinGate />);

    await waitFor(() => {
      expect(screen.getByTestId('set-login-pin-screen')).toBeTruthy();
    });

    expect(screen.getByText('Enter PIN')).toBeTruthy();
    expect(screen.queryByText('Set up your PIN')).toBeNull();
  });
});
