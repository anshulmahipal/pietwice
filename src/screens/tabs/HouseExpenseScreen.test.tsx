/**
 * Unit: HouseExpenseScreen — combined summary, navigate to details, calendar.
 */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import React from 'react';
import HouseExpenseScreen from './HouseExpenseScreen';

const mockRefresh = jest.fn(() => Promise.resolve());
const mockReloadDayTotals = jest.fn(() => Promise.resolve());
const mockLoadLinesForDay = jest.fn((_ymd: string) =>
  Promise.resolve([] as { id: number; titleKey: string; amount: string; expenseDate: string }[]),
);
const mockNavigate = jest.fn();

jest.mock('../../houseExpense/useHouseExpenseDashboard', () => ({
  useHouseExpenseDashboard: () => ({
    rows: [
      { title: 'Milk', amount: '100', spent: '25' },
      { title: 'Water', amount: '', spent: '10' },
    ],
    isReady: true,
    refresh: mockRefresh,
    saveSpent: jest.fn(),
  }),
}));

jest.mock('../../houseExpense/useExpenseCalendarMonth', () => ({
  useExpenseCalendarMonth: () => ({
    dayTotals: { '2024-06-15': 35 },
    reloadDayTotals: mockReloadDayTotals,
    loadLinesForDay: mockLoadLinesForDay,
  }),
}));

jest.mock('react-native-calendars', () => {
  const React = require('react');
  const { View: RNView } = require('react-native');
  return {
    Calendar: ({
      dayComponent: Day,
    }: {
      dayComponent?: (p: { date?: { dateString: string; day: number }; state?: string }) => React.ReactElement | null;
    }) => {
      const dateData = {
        dateString: '2024-06-15',
        day: 15,
        month: 6,
        year: 2024,
        timestamp: 0,
      };
      return React.createElement(
        RNView,
        { testID: 'mock-house-expense-calendar-widget' },
        Day ? React.createElement(Day, { date: dateData, state: '' }) : null,
      );
    },
  };
});

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (cb: () => void) => {
      React.useEffect(() => {
        cb();
      }, [cb]);
    },
  };
});

const Stack = createNativeStackNavigator();

function HouseTabHost() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="HouseHome" component={HouseExpenseScreen} options={{ title: 'House' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('HouseExpenseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadLinesForDay.mockResolvedValue([
      { id: 1, titleKey: 'milk', amount: '25', expenseDate: '2024-06-15' },
      { id: 2, titleKey: 'water', amount: '10', expenseDate: '2024-06-15' },
    ]);
    jest.useFakeTimers({ now: new Date(2024, 5, 15, 12, 0, 0) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders combined summary and calendar only (no category rows on home)', () => {
    render(<HouseTabHost />);

    expect(screen.getByTestId('house-expense-dash-master')).toBeTruthy();
    expect(screen.getByTestId('house-expense-dash-master-progress')).toBeTruthy();
    expect(screen.getByText('Monthly spend plan')).toBeTruthy();
    const master = screen.getByTestId('house-expense-dash-master');
    expect(within(master).getByText('₹35.00 / ₹100.00')).toBeTruthy();
    expect(within(master).getByText('35% used · ₹65.00 left')).toBeTruthy();
    expect(screen.getAllByText('35%').length).toBeGreaterThanOrEqual(1);

    expect(screen.queryByTestId('house-expense-dash-row-0')).toBeNull();
    expect(screen.queryByText('Milk')).toBeNull();
  });

  it('navigates to expense details when combined card is pressed', () => {
    render(<HouseTabHost />);

    fireEvent.press(screen.getByTestId('house-expense-combined-nav'));

    expect(mockNavigate).toHaveBeenCalledWith('HouseExpenseDetail');
  });

  it('shows expense calendar and opens day list on date tap', async () => {
    render(<HouseTabHost />);

    const calendarBlock = screen.getByTestId('house-expense-calendar');
    expect(calendarBlock).toBeTruthy();
    expect(screen.getByText('Daily calendar')).toBeTruthy();
    expect(within(calendarBlock).getByText('35')).toBeTruthy();

    fireEvent.press(screen.getByTestId('house-expense-cal-day-2024-06-15'));

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-day-detail-modal')).toBeTruthy();
    });

    expect(mockLoadLinesForDay).toHaveBeenCalledWith('2024-06-15');
    const dayModal = screen.getByTestId('house-expense-day-detail-modal');
    expect(within(dayModal).getByTestId('house-expense-day-line-1')).toBeTruthy();
    expect(within(dayModal).getByText('Milk')).toBeTruthy();
    expect(within(dayModal).getByText('Water')).toBeTruthy();

    fireEvent.press(screen.getByTestId('house-expense-day-detail-close'));

    await waitFor(() => {
      expect(screen.queryByTestId('house-expense-day-detail-modal')).toBeNull();
    });
  });
});
