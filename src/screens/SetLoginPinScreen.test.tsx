/**
 * Unit: SetLoginPinScreen — first-run four-digit PIN entry via on-screen keypad only.
 */
import React from 'react';
import { TextInput } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SetLoginPinScreen } from './SetLoginPinScreen';

describe('SetLoginPinScreen', () => {
  it('renders title and helper copy for a four-digit numeric PIN', () => {
    render(<SetLoginPinScreen />);

    expect(screen.getByText('Set login PIN')).toBeTruthy();
    expect(
      screen.getByText('Enter 4 digits. Use the keypad below; your phone keyboard will stay closed.'),
    ).toBeTruthy();
  });

  it('renders four PIN indicators and the 0–9 keypad plus backspace', () => {
    render(<SetLoginPinScreen />);

    for (let i = 0; i < 4; i += 1) {
      expect(screen.getByTestId(`pin-slot-${i}`)).toBeTruthy();
    }

    for (let d = 0; d <= 9; d += 1) {
      expect(screen.getByTestId(`pin-key-${d}`)).toBeTruthy();
    }

    expect(screen.getByTestId('pin-key-backspace')).toBeTruthy();
  });

  it('does not use a TextInput so the system keyboard stays closed', () => {
    const { UNSAFE_root } = render(<SetLoginPinScreen />);

    expect(UNSAFE_root.findAllByType(TextInput)).toHaveLength(0);
  });

  it('fills indicators in order when digits are pressed and ignores input beyond four digits', () => {
    render(<SetLoginPinScreen />);

    fireEvent.press(screen.getByTestId('pin-key-9'));
    fireEvent.press(screen.getByTestId('pin-key-8'));
    fireEvent.press(screen.getByTestId('pin-key-7'));

    expect(screen.getByLabelText('PIN digit 1 filled')).toBeTruthy();
    expect(screen.getByLabelText('PIN digit 2 filled')).toBeTruthy();
    expect(screen.getByLabelText('PIN digit 3 filled')).toBeTruthy();
    expect(screen.getByLabelText('PIN digit 4 empty')).toBeTruthy();

    fireEvent.press(screen.getByTestId('pin-key-6'));
    fireEvent.press(screen.getByTestId('pin-key-5'));

    expect(screen.getByLabelText('PIN digit 4 filled')).toBeTruthy();
  });

  it('removes the last digit when backspace is pressed', () => {
    render(<SetLoginPinScreen />);

    fireEvent.press(screen.getByTestId('pin-key-1'));
    fireEvent.press(screen.getByTestId('pin-key-2'));
    fireEvent.press(screen.getByTestId('pin-key-backspace'));

    expect(screen.getByLabelText('PIN digit 1 filled')).toBeTruthy();
    expect(screen.getByLabelText('PIN digit 2 empty')).toBeTruthy();
  });

  it('calls onPinComplete when four digits are entered', () => {
    const onPinComplete = jest.fn();
    render(<SetLoginPinScreen onPinComplete={onPinComplete} />);

    fireEvent.press(screen.getByTestId('pin-key-3'));
    fireEvent.press(screen.getByTestId('pin-key-0'));
    fireEvent.press(screen.getByTestId('pin-key-4'));
    fireEvent.press(screen.getByTestId('pin-key-1'));

    expect(onPinComplete).toHaveBeenCalledTimes(1);
    expect(onPinComplete).toHaveBeenCalledWith('3041');
  });

  it('shows custom title and subtitle when provided', () => {
    render(
      <SetLoginPinScreen
        title="Enter PIN"
        subtitle="Unlock with your 4-digit PIN."
      />,
    );

    expect(screen.getByText('Enter PIN')).toBeTruthy();
    expect(screen.getByText('Unlock with your 4-digit PIN.')).toBeTruthy();
  });

  it('shows an error message when errorMessage is set', () => {
    render(<SetLoginPinScreen errorMessage="Incorrect PIN" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Incorrect PIN');
  });

  it('clears entered digits when resetToken changes', () => {
    const { rerender } = render(
      <SetLoginPinScreen resetToken={0} onPinComplete={jest.fn()} />,
    );

    fireEvent.press(screen.getByTestId('pin-key-1'));
    fireEvent.press(screen.getByTestId('pin-key-2'));
    expect(screen.getByLabelText('PIN digit 2 filled')).toBeTruthy();

    rerender(<SetLoginPinScreen resetToken={1} onPinComplete={jest.fn()} />);

    expect(screen.getByLabelText('PIN digit 1 empty')).toBeTruthy();
  });
});
