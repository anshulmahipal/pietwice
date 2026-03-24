import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  PIN_LENGTH,
  appendDigit,
  deleteLastDigit,
} from '../pin/pinEntryLogic';

const DEFAULT_TITLE = 'Set login PIN';
const DEFAULT_SUBTITLE =
  'Enter 4 digits. Use the keypad below — your phone keyboard will not open.';

type SetLoginPinScreenProps = {
  title?: string;
  subtitle?: string;
  errorMessage?: string | null;
  /** When this value changes, the PIN buffer is cleared (e.g. after a failed unlock). */
  resetToken?: number;
  onPinComplete?: (pin: string) => void;
};

const KEYPAD_ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'backspace'],
];

export function SetLoginPinScreen({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  errorMessage = null,
  resetToken = 0,
  onPinComplete,
}: SetLoginPinScreenProps) {
  const [pin, setPin] = useState('');
  const onPinCompleteRef = useRef(onPinComplete);
  onPinCompleteRef.current = onPinComplete;

  useEffect(() => {
    setPin('');
  }, [resetToken]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      onPinCompleteRef.current?.(pin);
    }
  }, [pin]);

  function handleDigitPress(digit: string) {
    setPin((current) => appendDigit(current, digit));
  }

  function handleBackspacePress() {
    setPin((current) => deleteLastDigit(current));
  }

  return (
    <View style={styles.screen} testID="set-login-pin-screen">
      <Text style={styles.title}>{title}</Text>
      <View style={styles.introBlock}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {errorMessage ? (
          <Text style={styles.error} accessibilityRole="alert">
            {errorMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.slotsRow} accessibilityRole="none">
        {Array.from({ length: PIN_LENGTH }, (_, index) => {
          const filled = index < pin.length;
          return (
            <View
              key={index}
              testID={`pin-slot-${index}`}
              style={[styles.slot, filled && styles.slotFilled]}
              accessibilityLabel={`PIN digit ${index + 1} ${filled ? 'filled' : 'empty'}`}
            />
          );
        })}
      </View>

      <View style={styles.keypad} accessibilityRole="none" accessibilityLabel="Numeric keypad">
        {KEYPAD_ROWS.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === '') {
                return <View key="spacer" style={styles.keySpacer} />;
              }

              if (key === 'backspace') {
                return (
                  <Pressable
                    key="backspace"
                    testID="pin-key-backspace"
                    accessibilityLabel="Backspace"
                    style={({ pressed }) => [
                      styles.key,
                      styles.keyWide,
                      pressed && styles.keyPressed,
                    ]}
                    onPress={handleBackspacePress}
                  >
                    <Text style={styles.keyText}>⌫</Text>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={key}
                  testID={`pin-key-${key}`}
                  accessibilityLabel={`Digit ${key}`}
                  style={({ pressed }) => [
                    styles.key,
                    pressed && styles.keyPressed,
                  ]}
                  onPress={() => handleDigitPress(key)}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const SLOT_SIZE = 16;
const KEY_SIZE = 72;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    backgroundColor: '#f7f8fa',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  introBlock: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
  },
  error: {
    fontSize: 15,
    color: '#b91c1c',
    marginTop: 8,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: SLOT_SIZE / 2,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  slotFilled: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  keypad: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  keyWide: {
    width: KEY_SIZE,
  },
  keySpacer: {
    width: KEY_SIZE,
    height: KEY_SIZE,
  },
  keyPressed: {
    backgroundColor: '#e5e7eb',
  },
  keyText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#111827',
  },
});
