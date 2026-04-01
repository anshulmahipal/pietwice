/**
 * Unit: FinanceHubLayout — credit-card-style shell for investment/insurance entry points.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FinanceHubLayout } from './FinanceHubLayout';

jest.mock('react-native-calendars', () => {
  const ReactNs = require('react');
  const { View: RNView } = require('react-native');
  return {
    Calendar: () =>
      ReactNs.createElement(RNView, { testID: 'mock-finance-hub-calendar-widget' }),
  };
});

describe('FinanceHubLayout', () => {
  it('renders caption, summary count, and calendar frame', () => {
    const onSummaryPress = jest.fn();

    render(
      <FinanceHubLayout
        screenTestId="screen-test-hub"
        caption="Test caption for the hub."
        trackedLabel="Items tracked"
        count={3}
        summaryHint="Tap for full list when available."
        summaryAccessibilityLabel="3 items tracked. Tap for list."
        calendarSectionTitle="Activity calendar"
        calendarSectionHint="Important dates will show here."
        calendarTestId="test-hub-calendar"
        summaryCountTestId="test-hub-count-value"
        currentMonthYmd="2026-03-01"
        onPressSummary={onSummaryPress}
      />,
    );

    expect(screen.getByTestId('screen-test-hub')).toBeTruthy();
    expect(screen.getByText('Test caption for the hub.')).toBeTruthy();
    expect(screen.getByText('Items tracked')).toBeTruthy();
    expect(screen.getByTestId('test-hub-count-value')).toHaveTextContent('3');
    expect(screen.getByText('Activity calendar')).toBeTruthy();
    expect(screen.getByTestId('test-hub-calendar')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('3 items tracked. Tap for list.'));
    expect(onSummaryPress).toHaveBeenCalledTimes(1);
  });
});
