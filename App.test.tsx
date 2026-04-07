/**
 * Unit: App shell — root providers and PIN gate wrapper.
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from './App';

jest.mock('./src/auth/PinGate', () => ({
  PinGate: () => {
    const { Text } = require('react-native');
    return <Text testID="app-pin-gate-stub">PinGate</Text>;
  },
}));

describe('App', () => {
  it('renders PinGate inside safe area root', () => {
    render(<App />);
    expect(screen.getByTestId('app-pin-gate-stub')).toBeTruthy();
  });
});
