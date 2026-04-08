import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HouseholdIncomeGate } from '../householdIncome/HouseholdIncomeGate';
import { SetLoginPinScreen } from '../screens/SetLoginPinScreen';
import { financeColors, financeShadow } from '../ui/financeTheme';
import { PinSessionContext } from './PinSessionContext';
import { usePinGate } from './usePinGate';

export function PinGate() {
  const gate = usePinGate();

  if (gate.phase === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.loadingCard}>
            <Image
              testID="bondwallet-launch-logo"
              source={require('../../assets/bondwallet-logo.png')}
              style={styles.launchLogo}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="BondWallet"
            />
            <Text style={styles.loadingEyebrow}>Secure access</Text>
            <Text style={styles.loadingTitle}>Getting your lock screen ready</Text>
            <Text style={styles.loadingCaption}>
              Checking whether this device already has an app PIN saved.
            </Text>
            <ActivityIndicator size="large" color={financeColors.accent} style={styles.loadingSpinner} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (gate.phase === 'authenticated') {
    return (
      <PinSessionContext.Provider
        value={{ replaceStoredPin: gate.replaceStoredPin }}
      >
        <HouseholdIncomeGate />
      </PinSessionContext.Provider>
    );
  }

  if (gate.phase === 'create_pin') {
    return (
      <SetLoginPinScreen
        title="Create your PIN"
        subtitle="Choose 4 digits. On the next screen you will enter them again to confirm."
        resetToken={gate.createPinResetToken}
        onPinComplete={(pin) => {
          gate.submitFirstCreatePin(pin);
        }}
      />
    );
  }

  if (gate.phase === 'create_pin_confirm') {
    return (
      <SetLoginPinScreen
        title="Confirm your PIN"
        subtitle="Enter the same 4 digits again to finish setup."
        errorMessage={gate.createPinError}
        resetToken={gate.createPinResetToken}
        onPinComplete={(pin) => {
          void gate.submitConfirmCreatePin(pin);
        }}
      />
    );
  }

  return (
    <SetLoginPinScreen
      title="Enter PIN"
      subtitle="Use the keypad below to unlock the app."
      errorMessage={gate.unlockError}
      resetToken={gate.unlockResetToken}
      onPinComplete={(pin) => {
        void gate.submitUnlockPin(pin);
      }}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: financeColors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: financeColors.background,
  },
  launchLogo: {
    width: 260,
    aspectRatio: 1024 / 682,
    alignSelf: 'center',
    marginBottom: 4,
  },
  loadingCard: {
    width: '100%',
    borderRadius: 30,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: financeColors.surfaceStrong,
    borderWidth: 1,
    borderColor: financeColors.border,
    ...financeShadow,
  },
  loadingEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: financeColors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loadingTitle: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: financeColors.text,
  },
  loadingCaption: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: financeColors.textMuted,
  },
  loadingSpinner: {
    marginTop: 20,
  },
});
