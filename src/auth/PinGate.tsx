import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MainTabs } from '../navigation/MainTabs';
import { SetLoginPinScreen } from '../screens/SetLoginPinScreen';
import { usePinGate } from './usePinGate';

export function PinGate() {
  const gate = usePinGate();

  if (gate.phase === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (gate.phase === 'authenticated') {
    return (
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    );
  }

  if (gate.phase === 'create_pin') {
    return (
      <SetLoginPinScreen
        onPinComplete={(pin) => {
          void gate.submitCreatedPin(pin);
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f8fa',
  },
});
