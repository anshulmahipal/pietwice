import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PIN_LENGTH,
  appendDigit,
  deleteLastDigit,
} from '../pin/pinEntryLogic';
import { financeColors, financeShadow } from '../ui/financeTheme';

const DEFAULT_TITLE = 'Set login PIN';
const DEFAULT_SUBTITLE =
  'Enter 4 digits. Use the keypad below; your phone keyboard will stay closed.';

type SetLoginPinScreenProps = {
  title?: string;
  subtitle?: string;
  errorMessage?: string | null;
  /** When this value changes, the PIN buffer is cleared (e.g. after a failed unlock). */
  resetToken?: number;
  onPinComplete?: (pin: string) => void;
  /**
   * Limit safe-area padding (e.g. `['left','right']` when a parent modal already applies top/bottom insets).
   */
  safeAreaEdges?: readonly Edge[];
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
  safeAreaEdges,
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
    <SafeAreaView
      style={[styles.screen, safeAreaEdges ? styles.screenEmbedded : null]}
      testID="set-login-pin-screen"
      {...(safeAreaEdges ? { edges: safeAreaEdges } : {})}
    >
      <View style={styles.body} testID="set-login-pin-layout">
        <View style={styles.topBlock}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>Secure access</Text>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.introBlock}>
              <Text style={styles.subtitle}>{subtitle}</Text>
              {errorMessage ? (
                <View style={styles.errorPill}>
                  <Ionicons name="alert-circle-outline" size={16} color={financeColors.danger} />
                  <Text style={styles.error} accessibilityRole="alert">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.pinCard}>
            <Text style={styles.pinCardLabel}>4-digit PIN</Text>
            <Text style={styles.pinCardHint}>Enter one digit at a time using the keypad.</Text>

            <View style={styles.slotsRow} accessibilityRole="none">
              {Array.from({ length: PIN_LENGTH }, (_, index) => {
                const filled = index < pin.length;
                return (
                  <View
                    key={index}
                    testID={`pin-slot-${index}`}
                    style={[styles.slot, filled && styles.slotFilled]}
                    accessibilityLabel={`PIN digit ${index + 1} ${filled ? 'filled' : 'empty'}`}
                  >
                    {filled ? <View style={styles.slotInner} /> : null}
                  </View>
                );
              })}
            </View>

            <Text style={styles.progressText}>
              {pin.length === 0
                ? 'Waiting for input'
                : `${pin.length} of ${PIN_LENGTH} digits entered`}
            </Text>
          </View>
        </View>

        <View style={styles.keypadCard}>
          <Text style={styles.keypadLabel}>Numeric keypad</Text>
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
                          styles.keyUtility,
                          pressed && styles.keyPressed,
                        ]}
                        onPress={handleBackspacePress}
                      >
                        <Ionicons name="backspace-outline" size={24} color={financeColors.text} />
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
      </View>
    </SafeAreaView>
  );
}

const SLOT_SIZE = 20;
const KEY_SIZE = 74;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 24,
    paddingTop: 40,
    backgroundColor: financeColors.background,
  },
  /** Tighter top spacing when embedded in Profile change-PIN modal (parent already pads top). */
  screenEmbedded: {
    paddingTop: 12,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  topBlock: {
    flex: 1,
    minHeight: 0,
  },
  heroCard: {
    borderRadius: 30,
    paddingVertical: 24,
    paddingHorizontal: 22,
    backgroundColor: financeColors.surfaceStrong,
    borderWidth: 1,
    borderColor: financeColors.border,
    ...financeShadow,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: financeColors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 8,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: financeColors.text,
  },
  introBlock: {
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: financeColors.textMuted,
  },
  errorPill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: financeColors.dangerSoft,
  },
  error: {
    fontSize: 14,
    color: financeColors.danger,
    fontWeight: '700',
  },
  pinCard: {
    marginTop: 16,
    borderRadius: 26,
    paddingVertical: 22,
    paddingHorizontal: 20,
    backgroundColor: financeColors.surfaceStrong,
    borderWidth: 1,
    borderColor: financeColors.border,
  },
  pinCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: financeColors.text,
  },
  pinCardHint: {
    marginTop: 4,
    fontSize: 13,
    color: financeColors.textMuted,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 20,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: SLOT_SIZE / 2,
    borderWidth: 2,
    borderColor: financeColors.border,
    backgroundColor: financeColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: {
    borderColor: financeColors.accent,
    backgroundColor: financeColors.accentSoft,
  },
  slotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: financeColors.accent,
  },
  progressText: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 13,
    color: financeColors.textMuted,
  },
  keypadCard: {
    marginTop: 16,
    borderRadius: 26,
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: financeColors.surfaceStrong,
    borderWidth: 1,
    borderColor: financeColors.border,
    ...financeShadow,
  },
  keypadLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: financeColors.text,
    marginBottom: 14,
  },
  keypad: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 312,
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
    backgroundColor: financeColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: financeColors.border,
  },
  keyWide: {
    width: KEY_SIZE,
  },
  keyUtility: {
    backgroundColor: financeColors.surfaceMuted,
  },
  keySpacer: {
    width: KEY_SIZE,
    height: KEY_SIZE,
  },
  keyPressed: {
    backgroundColor: financeColors.surfaceMuted,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: financeColors.text,
  },
});
