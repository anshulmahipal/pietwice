import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateHouseholdIncomes } from '../householdIncome/householdIncomeLogic';
import { saveHouseholdIncome } from '../householdIncome/householdIncomeStorage';
import { parseAmount } from '../houseExpense/expenseDashboardLogic';
import { formatInr } from '../localization/indiaFormat';
import { financeColors, financeShadow } from '../ui/financeTheme';

type HouseholdIncomeSetupScreenProps = {
  onComplete: () => void;
};

export function HouseholdIncomeSetupScreen({ onComplete }: HouseholdIncomeSetupScreenProps) {
  const [husband, setHusband] = useState('');
  const [wife, setWife] = useState('');
  const [error, setError] = useState<string | null>(null);

  const valid = validateHouseholdIncomes(husband, wife);
  const displayTotal = valid.ok ? parseAmount(valid.husband) + parseAmount(valid.wife) : null;

  async function handleContinue() {
    setError(null);
    const result = validateHouseholdIncomes(husband, wife);
    if (!result.ok) {
      setError('Enter a valid amount for both incomes (use 0 if none).');
      return;
    }
    await saveHouseholdIncome({
      husbandIncome: result.husband,
      wifeIncome: result.wife,
    });
    onComplete();
  }

  return (
    <SafeAreaView style={styles.screen} testID="household-income-setup-screen">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          testID="household-income-setup-scroll"
        >
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>Welcome</Text>
            <Text style={styles.title}>Household income</Text>
            <Text style={styles.subtitle}>
              Enter monthly take-home for both partners. You can use this as context next to your
              household expense plan.
            </Text>
            {error ? (
              <View style={styles.errorPill}>
                <Ionicons name="alert-circle-outline" size={16} color={financeColors.danger} />
                <Text style={styles.error} accessibilityRole="alert">
                  {error}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.label}>Husband income (monthly)</Text>
            <TextInput
              testID="household-income-husband"
              accessibilityLabel="Husband income monthly"
              value={husband}
              onChangeText={setHusband}
              keyboardType="decimal-pad"
              placeholder="e.g. 120000"
              placeholderTextColor={financeColors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.label}>Wife income (monthly)</Text>
            <TextInput
              testID="household-income-wife"
              accessibilityLabel="Wife income monthly"
              value={wife}
              onChangeText={setWife}
              keyboardType="decimal-pad"
              placeholder="e.g. 95000"
              placeholderTextColor={financeColors.textMuted}
              style={styles.input}
            />
          </View>

          {displayTotal !== null ? (
            <View style={styles.totalCard} testID="household-income-total-preview">
              <Text style={styles.totalLabel}>Combined monthly income</Text>
              <Text style={styles.totalValue}>{formatInr(displayTotal)}</Text>
            </View>
          ) : null}

          <Pressable
            testID="household-income-continue"
            accessibilityRole="button"
            accessibilityLabel="Continue to household expenses"
            onPress={() => void handleContinue()}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
          >
            <Text style={styles.primaryBtnText}>Continue to expenses</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: financeColors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  heroCard: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: financeColors.text,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: financeColors.textMuted,
  },
  errorPill: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: financeColors.dangerSoft,
  },
  error: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: financeColors.danger,
  },
  fieldCard: {
    marginBottom: 14,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: financeColors.surfaceStrong,
    borderWidth: 1,
    borderColor: financeColors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: financeColors.textMuted,
    marginBottom: 8,
  },
  input: {
    fontSize: 20,
    fontWeight: '700',
    color: financeColors.text,
    paddingVertical: 4,
  },
  totalCard: {
    marginBottom: 18,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: financeColors.accentSoft,
    borderWidth: 1,
    borderColor: financeColors.border,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: financeColors.textMuted,
  },
  totalValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '800',
    color: financeColors.text,
  },
  primaryBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: financeColors.accent,
  },
  primaryBtnPressed: {
    opacity: 0.92,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
});
