import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseAmount } from '../houseExpense/expenseDashboardLogic';
import { formatInr } from '../localization/indiaFormat';
import { financeColors, financeShadow } from '../ui/financeTheme';
import { useExpenseCategories } from './useExpenseCategories';

export type ExpenseCategoriesScreenProps =
  | { mode: 'onboarding'; onOnboardingComplete: () => void }
  | { mode: 'settings' };

type BudgetCategoryTitleFieldProps = {
  index: number;
  committedTitle: string;
  onCommit: (index: number, value: string) => boolean;
  inputStyle?: StyleProp<TextStyle>;
};

function BudgetCategoryTitleField({
  index,
  committedTitle,
  onCommit,
  inputStyle,
}: BudgetCategoryTitleFieldProps) {
  const [value, setValue] = useState(committedTitle);

  useEffect(() => {
    setValue(committedTitle);
  }, [committedTitle]);

  return (
    <TextInput
      testID={`household-budget-category-title-${index}`}
      style={[styles.linearTextInput, inputStyle]}
      placeholder="Category"
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={setValue}
      onEndEditing={() => {
        const ok = onCommit(index, value);
        if (!ok) {
          setValue(committedTitle);
        }
      }}
      returnKeyType="next"
    />
  );
}

const ONBOARDING_SUBTITLE =
  'One line per category: name and monthly budget. Tap + to add a category. Use the trash to ' +
  'remove a row (at least one category must remain). Press Continue to save. You can edit again ' +
  'anytime from More → Expense categories.';

const SETTINGS_SUBTITLE =
  'One line per category: name and monthly budget. Tap + to add a category. Use the trash to ' +
  'remove a row (at least one category must remain). Press Save to update your list.';

export function ExpenseCategoriesScreen(props: ExpenseCategoriesScreenProps) {
  const mode = props.mode;
  const onOnboardingComplete = props.mode === 'onboarding' ? props.onOnboardingComplete : undefined;

  const {
    categories,
    isReady,
    isSaving,
    addCategory,
    updateCategoryTitle,
    updateCategoryAmount,
    removeCategoryAt,
    saveCategories,
  } = useExpenseCategories();
  const [draftTitle, setDraftTitle] = useState('');
  const [draftAmount, setDraftAmount] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const totalBudget = useMemo(
    () => categories.reduce((sum, r) => sum + parseAmount(r.amount), 0),
    [categories],
  );

  const closeAddModal = useCallback(() => {
    setAddModalVisible(false);
    setDraftTitle('');
    setDraftAmount('');
  }, []);

  const handleAdd = useCallback(() => {
    addCategory(draftTitle, draftAmount);
    closeAddModal();
  }, [addCategory, draftTitle, draftAmount, closeAddModal]);

  const handlePrimary = useCallback(async () => {
    setSaveError(false);
    try {
      await saveCategories();
      if (mode === 'onboarding' && onOnboardingComplete) {
        onOnboardingComplete();
      }
    } catch {
      setSaveError(true);
    }
  }, [mode, onOnboardingComplete, saveCategories]);

  const safeEdges =
    mode === 'onboarding'
      ? (['top', 'bottom', 'left', 'right'] as const)
      : (['bottom', 'left', 'right'] as const);

  const primaryLabel = mode === 'onboarding' ? 'Continue' : 'Save';
  const primaryA11yLabel =
    mode === 'onboarding' ? 'Save and continue to app' : 'Save category budgets';

  if (!isReady) {
    return (
      <SafeAreaView
        style={styles.screen}
        edges={safeEdges}
        testID="household-budget-overview-loading"
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={financeColors.accent} />
          <Text style={styles.loadingCaption}>Loading your category budgets…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={safeEdges}
      testID="household-budget-overview-screen"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        testID="household-budget-overview-scroll"
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Monthly plan</Text>
          <Text style={styles.title}>Your category budgets</Text>
          <Text style={styles.subtitle}>
            {mode === 'onboarding' ? ONBOARDING_SUBTITLE : SETTINGS_SUBTITLE}
          </Text>
          {saveError ? (
            <View style={styles.warnPill}>
              <Ionicons name="alert-circle-outline" size={16} color={financeColors.danger} />
              <Text style={styles.warnText} accessibilityRole="alert">
                Could not save categories. Check storage and try again.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderTitles}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sectionHint}>Each row: name · budget · remove (₹).</Text>
          </View>
          <Pressable
            testID="household-budget-add-open"
            accessibilityRole="button"
            accessibilityLabel="Add category"
            hitSlop={10}
            onPress={() => setAddModalVisible(true)}
            style={({ pressed }) => [styles.plusBtn, pressed && styles.plusBtnPressed]}
          >
            <Ionicons name="add" size={30} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.listCard}>
          {categories.map((row, index) => {
            const canDelete = categories.length > 1;
            return (
              <View
                key={`${row.title}-${index}`}
                style={[styles.linearRow, index > 0 && styles.linearRowBorder]}
                testID={`household-budget-row-${index}`}
              >
                <Text style={styles.rowIndex} accessibilityLabel={`Row ${index + 1}`}>
                  {index + 1}.
                </Text>
                <BudgetCategoryTitleField
                  index={index}
                  committedTitle={row.title}
                  onCommit={updateCategoryTitle}
                  inputStyle={styles.linearTitleFlex}
                />
                <TextInput
                  testID={`household-budget-category-amount-${index}`}
                  style={[styles.linearTextInput, styles.linearAmountFixed]}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  value={row.amount}
                  onChangeText={(text) => updateCategoryAmount(index, text)}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                <Pressable
                  testID={`household-budget-delete-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove category ${row.title}`}
                  accessibilityState={{ disabled: !canDelete }}
                  disabled={!canDelete}
                  hitSlop={8}
                  onPress={() => removeCategoryAt(index)}
                  style={({ pressed }) => [
                    styles.deleteBtn,
                    !canDelete && styles.deleteBtnDisabled,
                    pressed && canDelete && styles.deleteBtnPressed,
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={canDelete ? financeColors.danger : financeColors.textMuted}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.totalCard} testID="household-budget-total">
          <Text style={styles.totalLabel}>Total budget</Text>
          <Text style={styles.totalValue}>{formatInr(totalBudget)}</Text>
        </View>

        <Pressable
          testID="household-budget-continue"
          accessibilityRole="button"
          accessibilityLabel={primaryA11yLabel}
          disabled={isSaving}
          onPress={() => void handlePrimary()}
          style={({ pressed }) => [
            styles.primaryBtn,
            (pressed || isSaving) && styles.primaryBtnPressed,
            isSaving && styles.primaryBtnDisabled,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalRoot} testID="household-budget-add-modal-root">
          <Pressable
            style={styles.modalBackdrop}
            accessibilityLabel="Close add category"
            onPress={closeAddModal}
          />
          <View style={styles.modalCard} testID="household-budget-add-modal">
            <Text style={styles.modalTitle}>Add category</Text>
            <Text style={styles.modalCaption}>Enter a name and optional monthly budget (₹).</Text>
            <TextInput
              testID="household-budget-new-title"
              style={styles.modalInput}
              placeholder="Category name"
              placeholderTextColor="#9ca3af"
              value={draftTitle}
              onChangeText={setDraftTitle}
              returnKeyType="next"
            />
            <TextInput
              testID="household-budget-new-amount"
              style={styles.modalInput}
              placeholder="Monthly budget"
              placeholderTextColor="#9ca3af"
              value={draftAmount}
              onChangeText={setDraftAmount}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <View style={styles.modalActions}>
              <Pressable
                testID="household-budget-add-cancel"
                accessibilityRole="button"
                accessibilityLabel="Cancel add category"
                onPress={closeAddModal}
                style={({ pressed }) => [styles.modalBtnSecondary, pressed && styles.modalBtnPressed]}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="household-budget-add"
                accessibilityRole="button"
                accessibilityLabel="Confirm add category"
                onPress={handleAdd}
                style={({ pressed }) => [styles.modalBtnPrimary, pressed && styles.modalBtnPressed]}
              >
                <Text style={styles.modalBtnPrimaryText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: financeColors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingCaption: {
    marginTop: 12,
    fontSize: 15,
    color: financeColors.textMuted,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
    gap: 12,
  },
  heroCard: {
    marginTop: 8,
    marginBottom: 4,
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
  warnPill: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: financeColors.dangerSoft,
  },
  warnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: financeColors.danger,
  },
  sectionHeaderRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionHeaderTitles: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: financeColors.text,
  },
  sectionHint: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: financeColors.textMuted,
  },
  plusBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: financeColors.accent,
    ...financeShadow,
  },
  plusBtnPressed: {
    opacity: 0.9,
  },
  listCard: {
    borderRadius: 22,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: financeColors.border,
    backgroundColor: financeColors.surfaceStrong,
  },
  linearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    minHeight: 52,
  },
  linearRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: financeColors.border,
  },
  rowIndex: {
    width: 28,
    fontSize: 14,
    fontWeight: '700',
    color: financeColors.textMuted,
    textAlign: 'right',
  },
  linearTextInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  linearTitleFlex: {
    flex: 1,
    minWidth: 0,
  },
  linearAmountFixed: {
    width: 96,
    textAlign: 'right',
  },
  deleteBtn: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: financeColors.surface,
    borderWidth: 1,
    borderColor: financeColors.border,
  },
  deleteBtnDisabled: {
    opacity: 0.45,
  },
  deleteBtnPressed: {
    opacity: 0.85,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 36, 28, 0.45)',
  },
  modalCard: {
    zIndex: 1,
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 20,
    backgroundColor: financeColors.surfaceStrong,
    borderWidth: 1,
    borderColor: financeColors.border,
    ...financeShadow,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: financeColors.text,
  },
  modalCaption: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: financeColors.textMuted,
    marginBottom: 4,
  },
  modalInput: {
    marginTop: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  modalActions: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: financeColors.border,
    backgroundColor: financeColors.surface,
  },
  modalBtnPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: financeColors.accent,
  },
  modalBtnPressed: {
    opacity: 0.88,
  },
  modalBtnSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: financeColors.text,
  },
  modalBtnPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  totalCard: {
    marginTop: 4,
    marginBottom: 6,
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
    justifyContent: 'center',
    minHeight: 52,
    backgroundColor: financeColors.accent,
  },
  primaryBtnPressed: {
    opacity: 0.92,
  },
  primaryBtnDisabled: {
    opacity: 0.75,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
});
