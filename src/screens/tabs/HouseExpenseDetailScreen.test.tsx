/**
 * Unit: HouseExpenseDetailScreen — category breakdown and spent modal.
 */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import HouseExpenseDetailScreen from './HouseExpenseDetailScreen';

const mockRefresh = jest.fn(() => Promise.resolve());
const mockSaveSpent = jest.fn(() => Promise.resolve());

jest.mock('../../houseExpense/useHouseExpenseDashboard', () => ({
  useHouseExpenseDashboard: () => ({
    rows: [
      { title: 'Milk', amount: '100', spent: '25' },
      { title: 'Water', amount: '', spent: '10' },
    ],
    isReady: true,
    refresh: mockRefresh,
    saveSpent: mockSaveSpent,
  }),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useFocusEffect: (cb: () => void) => {
      React.useEffect(() => {
        cb();
      }, [cb]);
    },
  };
});

const Stack = createNativeStackNavigator();

function DetailHost() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Detail" component={HouseExpenseDetailScreen} options={{ title: 'Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('HouseExpenseDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: new Date(2024, 5, 15, 12, 0, 0) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders category rows with used/pending and progress track', () => {
    render(<DetailHost />);

    expect(screen.queryByTestId('house-expense-detail-dash-master')).toBeNull();

    expect(screen.getByTestId('house-expense-dash-row-0')).toBeTruthy();
    expect(screen.getByTestId('house-expense-dash-progress-0')).toBeTruthy();
    expect(screen.getByText('Milk')).toBeTruthy();
    expect(screen.getByText('25 / 100')).toBeTruthy();
    expect(screen.getByText('25%')).toBeTruthy();
  });

  it('opens modal with amount and saves on Save', async () => {
    render(<DetailHost />);

    fireEvent.press(screen.getByTestId('house-expense-dash-row-0'));

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-spent-modal')).toBeTruthy();
    });

    expect(screen.getByTestId('house-expense-modal-amount-input')).toHaveProp('value', '25');

    fireEvent.changeText(screen.getByTestId('house-expense-modal-amount-input'), '40');
    fireEvent.press(screen.getByTestId('house-expense-modal-save'));

    await waitFor(() => {
      expect(mockSaveSpent).toHaveBeenCalledWith('Milk', '40', '2024-06-15');
    });
  });

  it('closes modal on Cancel without saving', async () => {
    render(<DetailHost />);

    fireEvent.press(screen.getByTestId('house-expense-dash-row-0'));

    await waitFor(() => {
      expect(screen.getByTestId('house-expense-spent-modal')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('house-expense-modal-amount-input'), '99');
    fireEvent.press(screen.getByTestId('house-expense-modal-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('house-expense-spent-modal')).toBeNull();
    });

    expect(mockSaveSpent).not.toHaveBeenCalled();
  });
});
