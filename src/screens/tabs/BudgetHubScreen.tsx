import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { parseAmount, usedPercentLabel } from '../../houseExpense/expenseDashboardLogic';
import { formatInr } from '../../localization/indiaFormat';
import type { ProfileStackParamList } from '../../navigation/profileStackTypes';
import { useBudgetsOverview } from '../../budgets/useBudgetsOverview';
import type { BudgetPeriodType } from '../../budgets/budgetLogic';
import { financeColors, financeShadow } from '../../ui/financeTheme';

type BudgetNav = NativeStackNavigationProp<ProfileStackParamList, 'BudgetHub'>;

export function BudgetHubScreen() {
  const navigation = useNavigation<BudgetNav>();
  const { rows, isReady, isSaving, formError, saveBudget, reload, clearFormError } = useBudgetsOverview();
  const [editingPeriod, setEditingPeriod] = useState<BudgetPeriodType | null>(null);
  const [draftAmount, setDraftAmount] = useState('');

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const selectedRow = useMemo(
    () => rows.find((r) => r.periodType === editingPeriod) ?? null,
    [rows, editingPeriod],
  );
  const totalBudget = useMemo(
    () => rows.reduce((sum, row) => sum + parseAmount(row.amount), 0),
    [rows],
  );
  const totalSpent = useMemo(
    () => rows.reduce((sum, row) => sum + row.spent, 0),
    [rows],
  );
  const riskCount = useMemo(
    () => rows.filter((row) => row.statusLabel !== 'On track').length,
    [rows],
  );

  const openEditor = useCallback(
    (periodType: BudgetPeriodType, amount: string) => {
      clearFormError();
      setEditingPeriod(periodType);
      setDraftAmount(amount);
    },
    [clearFormError],
  );

  const closeEditor = useCallback(() => {
    clearFormError();
    setEditingPeriod(null);
    setDraftAmount('');
  }, [clearFormError]);

  const handleSave = useCallback(async () => {
    if (!editingPeriod) {
      return;
    }
    const ok = await saveBudget(editingPeriod, draftAmount);
    if (ok) {
      closeEditor();
    }
  }, [closeEditor, draftAmount, editingPeriod, saveBudget]);

  if (!isReady) {
    return (
      <View style={styles.centered} testID="screen-budget-hub">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.screen} testID="screen-budget-hub">
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Budgets</Text>
          <Text style={styles.heroTitle}>Set simple spending limits you can actually stick to.</Text>
          <Text style={styles.caption}>
            Keep weekly and monthly limits visible, then adjust them quickly as your spending changes during the month.
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Planned</Text>
              <Text style={styles.heroStatValue}>{formatInr(totalBudget)}</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Spent</Text>
              <Text style={styles.heroStatValue}>{formatInr(totalSpent)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.overviewRow}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Periods</Text>
            <Text style={styles.overviewValue}>{rows.length}</Text>
            <Text style={styles.overviewHint}>Budget views you can edit</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Needs attention</Text>
            <Text style={styles.overviewValue}>{riskCount}</Text>
            <Text style={styles.overviewHint}>Near limit or already over</Text>
          </View>
        </View>

        {rows.map((row) => {
          const budgetValue = parseAmount(row.amount);
          return (
            <Pressable
              key={row.periodType}
              testID={`budget-row-${row.periodType}`}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${row.periodLabel} budget`}
              onPress={() => openEditor(row.periodType, row.amount)}
              style={({ pressed }) => [styles.rowCard, pressed && styles.rowCardPressed]}
            >
              <View style={styles.rowTop}>
                <Text style={styles.rowTitle}>{row.periodLabel}</Text>
                <Ionicons name="create-outline" size={20} color="#2563eb" />
              </View>
              <Text style={styles.rowNumbers}>
                Spent {formatInr(row.spent)} / {row.amount ? formatInr(parseAmount(row.amount)) : '—'}
              </Text>
              <Text style={styles.rowMeta}>
                {row.rangeLabel} · {usedPercentLabel(budgetValue, row.spent)} used
              </Text>
              <Text
                style={[
                  styles.statusPill,
                  row.statusLabel === 'On track' && styles.statusOnTrack,
                  row.statusLabel === 'Near limit' && styles.statusNearLimit,
                  row.statusLabel === 'Over budget' && styles.statusOver,
                  row.statusLabel === 'Critical overspend' && styles.statusCritical,
                ]}
              >
                {row.statusLabel}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal
        visible={editingPeriod !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="budget-edit-modal">
            <Text style={styles.modalTitle}>Edit {selectedRow?.periodLabel} budget</Text>
            <Text style={styles.modalHint}>Amount applies to the current rolling period.</Text>
            <Text style={styles.modalLabel}>Budget amount</Text>
            <TextInput
              testID="budget-edit-amount-input"
              style={styles.modalInput}
              value={draftAmount}
              onChangeText={setDraftAmount}
              keyboardType="decimal-pad"
              placeholder="e.g. 10000"
              placeholderTextColor="#9ca3af"
            />
            {formError ? <Text style={styles.modalError}>{formError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                testID="budget-edit-cancel"
                onPress={closeEditor}
                style={({ pressed }) => [styles.modalBtn, styles.modalCancel, pressed && styles.modalBtnPressed]}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="budget-edit-save"
                onPress={() => void handleSave()}
                disabled={isSaving}
                style={({ pressed }) => [styles.modalBtn, styles.modalSave, (pressed || isSaving) && styles.modalBtnPressed]}
              >
                <Text style={styles.modalSaveText}>{isSaving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: financeColors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: financeColors.background },
  heroCard: {
    marginTop: 16,
    marginBottom: 10,
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
    color: financeColors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  heroStatCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: financeColors.surface,
  },
  heroStatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: financeColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroStatValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    color: financeColors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 12,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 10,
  },
  overviewCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 22,
    backgroundColor: financeColors.surfaceStrong,
    padding: 16,
  },
  overviewLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: financeColors.textMuted,
  },
  overviewValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '800',
    color: financeColors.text,
  },
  overviewHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: financeColors.textMuted,
  },
  rowCard: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 22,
    backgroundColor: financeColors.surfaceStrong,
    padding: 16,
  },
  rowCardPressed: { backgroundColor: financeColors.surface },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { fontSize: 18, fontWeight: '700', color: financeColors.text },
  rowNumbers: { marginTop: 10, fontSize: 15, color: financeColors.text, fontWeight: '600' },
  rowMeta: { marginTop: 4, fontSize: 13, color: financeColors.textMuted },
  statusPill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
    color: financeColors.textMuted,
    backgroundColor: financeColors.surfaceMuted,
  },
  statusOnTrack: { color: financeColors.green, backgroundColor: financeColors.greenSoft },
  statusNearLimit: { color: financeColors.accentStrong, backgroundColor: financeColors.goldSoft },
  statusOver: { color: financeColors.danger, backgroundColor: financeColors.dangerSoft },
  statusCritical: { color: financeColors.danger, backgroundColor: financeColors.dangerSoft },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(45,36,28,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: financeColors.surfaceStrong,
    borderRadius: 24,
    padding: 18,
  },
  modalTitle: { fontSize: 19, fontWeight: '700', color: financeColors.text },
  modalHint: { marginTop: 4, fontSize: 13, color: financeColors.textMuted },
  modalLabel: { marginTop: 12, marginBottom: 6, fontSize: 13, fontWeight: '600', color: financeColors.text },
  modalInput: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  modalError: { marginTop: 8, fontSize: 13, color: financeColors.danger, fontWeight: '600' },
  modalActions: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 14 },
  modalBtnPressed: { opacity: 0.7 },
  modalCancel: { backgroundColor: financeColors.surfaceMuted },
  modalSave: { backgroundColor: financeColors.accent },
  modalCancelText: { color: financeColors.text, fontWeight: '700' },
  modalSaveText: { color: '#fff', fontWeight: '700' },
});
