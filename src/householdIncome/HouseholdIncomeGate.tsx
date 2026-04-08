import { NavigationContainer } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MainTabs } from '../navigation/MainTabs';
import { HouseholdBudgetOverviewScreen } from '../screens/HouseholdBudgetOverviewScreen';
import { HouseholdIncomeSetupScreen } from '../screens/HouseholdIncomeSetupScreen';
import { financeColors, financeShadow } from '../ui/financeTheme';
import {
  hasSeenHouseholdBudgetOnboarding,
  markHouseholdBudgetOnboardingSeen,
} from './householdBudgetOnboardingStorage';
import { resolveHouseholdGatePhase } from './householdIncomeGateLogic';
import { hasCompletedHouseholdIncomeSetup } from './householdIncomeStorage';

type GatePhase = 'loading' | 'setup' | 'budget' | 'main';

export function HouseholdIncomeGate() {
  const [phase, setPhase] = useState<GatePhase>('loading');

  const refreshPhase = useCallback(async () => {
    const next = await resolveHouseholdGatePhase({
      hasCompletedHouseholdIncomeSetup,
      hasSeenHouseholdBudgetOnboarding,
    });
    setPhase(next);
  }, []);

  useEffect(() => {
    void refreshPhase();
  }, [refreshPhase]);

  if (phase === 'loading') {
    return (
      <View style={styles.centered} testID="household-income-gate-loading">
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEyebrow}>Household</Text>
          <Text style={styles.loadingTitle}>Preparing your home view</Text>
          <ActivityIndicator size="large" color={financeColors.accent} style={styles.loadingSpinner} />
        </View>
      </View>
    );
  }

  if (phase === 'setup') {
    return (
      <HouseholdIncomeSetupScreen
        onComplete={() => {
          setPhase('budget');
        }}
      />
    );
  }

  if (phase === 'budget') {
    return (
      <HouseholdBudgetOverviewScreen
        onComplete={() => {
          void (async () => {
            await markHouseholdBudgetOnboardingSeen();
            setPhase('main');
          })();
        }}
      />
    );
  }

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: financeColors.background,
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
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: financeColors.text,
  },
  loadingSpinner: {
    marginTop: 20,
  },
});
