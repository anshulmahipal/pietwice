/**
 * Unit: FinanceHubLayout — credit-card-style shell for investment/insurance entry points.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FinanceHubLayout } from './FinanceHubLayout';

let lastFinanceHubCalendarProps: Record<string, unknown> = {};

jest.mock('react-native-calendars', () => {
  const ReactNs = require('react');
  const { View: RNView } = require('react-native');
  return {
    Calendar: (props: Record<string, unknown>) => {
      lastFinanceHubCalendarProps = props;
      return ReactNs.createElement(RNView, { testID: 'mock-finance-hub-calendar-widget' });
    },
  };
});

describe('FinanceHubLayout', () => {
  beforeEach(() => {
    lastFinanceHubCalendarProps = {};
  });

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

  it('forwards markedDates and calendar callbacks to Calendar', () => {
    const onMonthChange = jest.fn();
    const onCalendarDayPress = jest.fn();
    const markedDates = { '2026-04-05': { marked: true, dotColor: '#e36a43' } };

    render(
      <FinanceHubLayout
        screenTestId="screen-test-hub"
        caption="Caption."
        trackedLabel="Items tracked"
        count={1}
        summaryHint="Hint."
        summaryAccessibilityLabel="1 item."
        calendarSectionTitle="Cal"
        calendarSectionHint="Cal hint."
        calendarTestId="test-hub-calendar"
        summaryCountTestId="test-hub-count-value"
        currentMonthYmd="2026-04-01"
        onPressSummary={jest.fn()}
        markedDates={markedDates}
        onMonthChange={onMonthChange}
        onCalendarDayPress={onCalendarDayPress}
      />,
    );

    expect(lastFinanceHubCalendarProps.markedDates).toEqual(markedDates);
    const onMonth = lastFinanceHubCalendarProps.onMonthChange as (m: {
      year: number;
      month: number;
    }) => void;
    const onDay = lastFinanceHubCalendarProps.onDayPress as (m: { dateString: string }) => void;
    onMonth({ year: 2026, month: 5 });
    expect(onMonthChange).toHaveBeenCalledWith({ year: 2026, month: 5 });
    onDay({ dateString: '2026-04-10' });
    expect(onCalendarDayPress).toHaveBeenCalledWith('2026-04-10');
  });
});
