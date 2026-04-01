import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useInsightsOverview } from '../../insights/useInsightsOverview';
import { formatInr } from '../../localization/indiaFormat';
import type { ProfileStackParamList } from '../../navigation/profileStackTypes';
import { financeColors, financeShadow } from '../../ui/financeTheme';

type InsightsNav = NativeStackNavigationProp<ProfileStackParamList, 'InsightsHub'>;

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
}

export function InsightsHubScreen() {
  const navigation = useNavigation<InsightsNav>();
  const insight = useInsightsOverview();

  useFocusEffect(
    useCallback(() => {
      void insight.reload();
    }, [insight]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Insights',
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  if (!insight.isReady) {
    return (
      <View style={styles.centered} testID="screen-insights-hub">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.screen} testID="screen-insights-hub">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Financial snapshot</Text>
          <Text style={styles.heroTitle}>See cash flow, budget pressure, and upcoming commitments in one place.</Text>
          <Text style={styles.caption}>
            India-first overview of spend, cashflow, due obligations, and budget pressure.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>This month</Text>
        <View style={styles.grid}>
          <MetricCard label="Expense" value={formatInr(insight.thisMonthExpense)} />
          <MetricCard label="Income" value={formatInr(insight.thisMonthIncome)} />
          <MetricCard label="Net cashflow" value={formatInr(insight.thisMonthNet)} />
          <MetricCard label="Net worth (tracked)" value={formatInr(insight.totalBalance)} />
        </View>

        <Text style={styles.sectionTitle}>{insight.fyLabel} to date</Text>
        <View style={styles.grid}>
          <MetricCard label="Expense" value={formatInr(insight.fyExpenseToDate)} />
          <MetricCard label="Income" value={formatInr(insight.fyIncomeToDate)} />
        </View>

        <Text style={styles.sectionTitle}>Upcoming 30 days</Text>
        <View style={styles.grid}>
          <MetricCard
            label="Bills due"
            value={String(insight.upcomingBillsCount)}
            hint={formatInr(insight.upcomingBillsTotal)}
          />
        </View>

        <Text style={styles.sectionTitle}>Budget risk</Text>
        {insight.budgetRisks.length === 0 ? (
          <Text style={styles.emptyText}>No budgets configured yet. Add budgets to see risk insights.</Text>
        ) : (
          <View style={styles.riskList}>
            {insight.budgetRisks.map((risk) => (
              <View key={risk.periodType} style={styles.riskCard} testID={`insight-risk-${risk.periodType}`}>
                <Text style={styles.riskTitle}>{risk.periodLabel}</Text>
                <Text style={styles.riskMeta}>
                  {formatInr(risk.spentAmount)} / {formatInr(risk.budgetAmount)}
                </Text>
                <Text style={styles.riskPercent}>{risk.usagePercent}% used</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: financeColors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: financeColors.background },
  scrollContent: { paddingBottom: 120 },
  heroCard: {
    marginTop: 16,
    marginHorizontal: 16,
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
  heroTitle: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: financeColors.text,
  },
  caption: {
    marginTop: 10,
    fontSize: 15,
    color: financeColors.textMuted,
    lineHeight: 22,
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 8,
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    color: financeColors.text,
  },
  grid: {
    marginHorizontal: 16,
    gap: 10,
  },
  metricCard: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 22,
    backgroundColor: financeColors.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  metricLabel: { fontSize: 13, fontWeight: '700', color: financeColors.textMuted },
  metricValue: { marginTop: 6, fontSize: 24, fontWeight: '800', color: financeColors.text },
  metricHint: { marginTop: 5, fontSize: 12, color: financeColors.accentStrong },
  emptyText: { marginTop: 4, marginHorizontal: 16, color: financeColors.textMuted, fontSize: 14 },
  riskList: { marginHorizontal: 16, gap: 10 },
  riskCard: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: financeColors.surfaceStrong,
  },
  riskTitle: { fontSize: 15, fontWeight: '700', color: financeColors.text },
  riskMeta: { marginTop: 4, fontSize: 13, color: financeColors.textMuted },
  riskPercent: { marginTop: 4, fontSize: 13, color: financeColors.accentStrong, fontWeight: '700' },
});
