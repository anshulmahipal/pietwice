/**
 * Unit: CreditCardListScreen — header Add, bottom sheet, due calendar.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { CreditCardListScreen } from './CreditCardListScreen';

const addCard = jest.fn(() => Promise.resolve(true));
const clearFormError = jest.fn();

jest.mock('../../creditCards/useCreditCards', () => ({
  useCreditCards: jest.fn(),
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
        dateString: '2025-04-15',
        day: 15,
        month: 4,
        year: 2025,
        timestamp: 0,
      };
      return ReactNs.createElement(
        RNView,
        { testID: 'mock-credit-card-calendar-widget' },
        Day ? ReactNs.createElement(Day, { date: dateData, state: '' }) : null,
      );
    },
  };
});

import { useCreditCards } from '../../creditCards/useCreditCards';

const useMock = useCreditCards as jest.MockedFunction<typeof useCreditCards>;

const Tab = createBottomTabNavigator();

function CreditCardTabHost() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="CreditCardList"
          component={CreditCardListScreen}
          options={{ title: 'Credit card list' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

async function renderCreditCardTabReady() {
  render(<CreditCardTabHost />);
  await waitFor(() => {
    const s = screen.getByTestId('credit-card-reminders-switch');
    expect(s.props.disabled).not.toBe(true);
  });
}

describe('CreditCardListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    addCard.mockResolvedValue(true);
    jest.useFakeTimers({ now: new Date(2025, 3, 10, 12, 0, 0) });
    useMock.mockReturnValue({
      cards: [],
      isReady: true,
      isSaving: false,
      formError: null,
      addCard,
      clearFormError,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('hides add form until header Add opens the bottom sheet', async () => {
    await renderCreditCardTabReady();

    expect(screen.queryByTestId('credit-card-add-sheet')).toBeNull();

    fireEvent.press(screen.getByTestId('credit-card-header-add'));

    await waitFor(() => {
      expect(screen.getByTestId('credit-card-add-sheet')).toBeTruthy();
    });

    expect(screen.getByText('New card')).toBeTruthy();
  });

  it('submits card name and bill payment day from the bottom sheet', async () => {
    await renderCreditCardTabReady();

    fireEvent.press(screen.getByTestId('credit-card-header-add'));

    await waitFor(() => {
      expect(screen.getByTestId('credit-card-name-input')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('credit-card-name-input'), '  Chase Sapphire  ');
    fireEvent.changeText(screen.getByTestId('credit-card-bill-day-input'), '21');
    fireEvent.press(screen.getByTestId('credit-card-add-button'));

    await waitFor(() => {
      expect(addCard).toHaveBeenCalledWith('  Chase Sapphire  ', '21');
    });
  });

  it('closes add sheet via close control', async () => {
    await renderCreditCardTabReady();

    fireEvent.press(screen.getByTestId('credit-card-header-add'));

    await waitFor(() => {
      expect(screen.getByTestId('credit-card-add-sheet')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('credit-card-add-sheet-close'));

    await waitFor(() => {
      expect(screen.queryByTestId('credit-card-add-sheet')).toBeNull();
    });
  });

  it('shows card count above calendar and opens full list modal on tap', async () => {
    useMock.mockReturnValue({
      cards: [{ id: 1, cardName: 'Visa', billPaymentDay: 8 }],
      isReady: true,
      isSaving: false,
      formError: null,
      addCard,
      clearFormError,
    });

    await renderCreditCardTabReady();

    expect(screen.getByTestId('credit-card-count-summary-value')).toHaveTextContent('1');

    fireEvent.press(screen.getByTestId('credit-card-count-summary'));

    await waitFor(() => {
      expect(screen.getByTestId('credit-card-all-list-modal')).toBeTruthy();
    });

    const modal = screen.getByTestId('credit-card-all-list-modal');
    expect(within(modal).getByTestId('credit-card-all-list-row-1')).toBeTruthy();
    expect(within(modal).getByText('Visa')).toBeTruthy();
    expect(within(modal).getByText(/Company bill day:\s*8/)).toBeTruthy();

    fireEvent.press(screen.getByTestId('credit-card-all-list-close'));

    await waitFor(() => {
      expect(screen.queryByTestId('credit-card-all-list-modal')).toBeNull();
    });
  });

  it('shows zero registered cards on the summary when the list is empty', async () => {
    await renderCreditCardTabReady();

    expect(screen.getByTestId('credit-card-count-summary-value')).toHaveTextContent('0');
  });

  it('shows bill day reminders toggle', async () => {
    await renderCreditCardTabReady();

    expect(screen.getByText('Bill day reminders')).toBeTruthy();
    expect(screen.getByTestId('credit-card-reminders-switch')).toBeTruthy();
  });

  it('shows due calendar with card name and bill day on the due date', async () => {
    useMock.mockReturnValue({
      cards: [{ id: 1, cardName: 'Visa', billPaymentDay: 15 }],
      isReady: true,
      isSaving: false,
      formError: null,
      addCard,
      clearFormError,
    });

    await renderCreditCardTabReady();

    const cal = screen.getByTestId('credit-card-due-calendar');
    expect(within(cal).getByText('Due date calendar')).toBeTruthy();
    expect(screen.getByTestId('credit-card-cal-day-2025-04-15')).toBeTruthy();
    expect(within(screen.getByTestId('credit-card-cal-day-2025-04-15')).getByText(/Visa/)).toBeTruthy();
    expect(within(screen.getByTestId('credit-card-cal-day-2025-04-15')).getByText(/day 15/)).toBeTruthy();
  });

  it('opens day detail modal when a due date is tapped', async () => {
    useMock.mockReturnValue({
      cards: [{ id: 1, cardName: 'Visa', billPaymentDay: 15 }],
      isReady: true,
      isSaving: false,
      formError: null,
      addCard,
      clearFormError,
    });

    await renderCreditCardTabReady();

    fireEvent.press(screen.getByTestId('credit-card-cal-day-2025-04-15'));

    await waitFor(() => {
      expect(screen.getByTestId('credit-card-day-detail-modal')).toBeTruthy();
    });

    const modal = screen.getByTestId('credit-card-day-detail-modal');
    expect(within(modal).getByTestId('credit-card-day-detail-1')).toBeTruthy();
    expect(within(modal).getByText('Visa')).toBeTruthy();
    expect(within(modal).getByText(/Company bill day:\s*15/)).toBeTruthy();

    fireEvent.press(screen.getByTestId('credit-card-day-detail-close'));

    await waitFor(() => {
      expect(screen.queryByTestId('credit-card-day-detail-modal')).toBeNull();
    });
  });
});
