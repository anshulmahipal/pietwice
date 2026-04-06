import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  formatUsedPendingLabel,
  parseAmount,
  progressSegmentLengths,
  usedPercentLabel,
} from '../../houseExpense/expenseDashboardLogic';
import { formatExpenseDateDisplay, toExpenseDateYmd } from '../../houseExpense/expenseDate';
import type { HouseExpenseDashboardRow } from '../../houseExpense/useHouseExpenseDashboard';
import { useHouseExpenseDashboard } from '../../houseExpense/useHouseExpenseDashboard';
import { formatInr } from '../../localization/indiaFormat';
import { financeColors, financeShadow } from '../../ui/financeTheme';

const SHOPPING_SPLIT_KEYS = ['milk', 'fruits', 'vegetable', 'laundry/toiletry'] as const;

export default function HouseExpenseDetailScreen() {
  const { rows, isReady, refresh, saveSpent, addExpenseEntries } = useHouseExpenseDashboard();
  const [modalRow, setModalRow] = useState<HouseExpenseDashboardRow | null>(null);
  const [draftSpent, setDraftSpent] = useState('');
  const [draftExpenseDate, setDraftExpenseDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [shoppingModalVisible, setShoppingModalVisible] = useState(false);
  const [shoppingTotal, setShoppingTotal] = useState('');
  const [shoppingExpenseDate, setShoppingExpenseDate] = useState(() => new Date());
  const [showShoppingDatePicker, setShowShoppingDatePicker] = useState(false);
  const [shoppingDrafts, setShoppingDrafts] = useState<Record<string, string>>({});
  const [shoppingError, setShoppingError] = useState<string | null>(null);
  const [isSavingShopping, setIsSavingShopping] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (modalRow) {
      setDraftSpent(modalRow.spent);
      setDraftExpenseDate(new Date());
      setShowDatePicker(false);
    }
  }, [modalRow]);

  const totalBudget = useMemo(
    () => rows.reduce((sum, row) => sum + parseAmount(row.amount), 0),
    [rows],
  );
  const totalSpent = useMemo(
    () => rows.reduce((sum, row) => sum + parseAmount(row.spent), 0),
    [rows],
  );
  const categoryTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.title.trim().toLowerCase()] = row.title;
    }
    return map;
  }, [rows]);
  const shoppingSplitTitles = useMemo(
    () =>
      SHOPPING_SPLIT_KEYS
        .map((key) => categoryTitleMap[key])
        .filter((value): value is string => Boolean(value)),
    [categoryTitleMap],
  );
  const groceryFallbackTitle = useMemo(
    () => categoryTitleMap.grocery ?? categoryTitleMap.groceries ?? rows[0]?.title ?? 'Grocery',
    [categoryTitleMap, rows],
  );
  const shoppingAssignedAmount = useMemo(
    () =>
      shoppingSplitTitles.reduce(
        (sum, title) => sum + parseAmount(shoppingDrafts[title] ?? '0'),
        0,
      ),
    [shoppingDrafts, shoppingSplitTitles],
  );
  const shoppingTotalAmount = parseAmount(shoppingTotal);
  const shoppingRemainderAmount = Math.max(0, shoppingTotalAmount - shoppingAssignedAmount);
  const shoppingIsOverAllocated = shoppingAssignedAmount > shoppingTotalAmount;

  function resetShoppingForm() {
    setShoppingModalVisible(false);
    setShoppingTotal('');
    setShoppingDrafts({});
    setShoppingExpenseDate(new Date());
    setShowShoppingDatePicker(false);
    setShoppingError(null);
    setIsSavingShopping(false);
  }

  async function handleModalSave() {
    if (!modalRow) {
      return;
    }
    setIsSavingModal(true);
    try {
      await saveSpent(modalRow.title, draftSpent, toExpenseDateYmd(draftExpenseDate));
      setModalRow(null);
    } finally {
      setIsSavingModal(false);
    }
  }

  async function handleShoppingSave() {
    if (shoppingTotalAmount <= 0) {
      setShoppingError('Enter the bill total first.');
      return;
    }
    if (shoppingIsOverAllocated) {
      setShoppingError('Split amounts are higher than the total bill.');
      return;
    }

    const entries = shoppingSplitTitles
      .map((title) => ({
        title,
        amount: shoppingDrafts[title] ?? '',
      }))
      .filter((entry) => parseAmount(entry.amount) > 0);

    if (shoppingRemainderAmount > 0 || entries.length === 0) {
      entries.push({
        title: groceryFallbackTitle,
        amount: String(entries.length === 0 ? shoppingTotalAmount : shoppingRemainderAmount),
      });
    }

    setIsSavingShopping(true);
    try {
      await addExpenseEntries(entries, toExpenseDateYmd(shoppingExpenseDate));
      resetShoppingForm();
    } finally {
      setIsSavingShopping(false);
    }
  }

  if (!isReady) {
    return (
      <View style={styles.centered} testID="screen-house-expense-detail-loading">
        <ActivityIndicator size="large" color={financeColors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.screen} testID="screen-house-expense-detail">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Category spending</Text>
          <Text style={styles.heroTitle}>Review each category and update spending without guesswork.</Text>
          <Text style={styles.heroCaption}>
            Tap any category card to enter the latest spent amount and the date it happened.
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Spent</Text>
              <Text style={styles.heroStatValue}>{formatInr(totalSpent)}</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Budget</Text>
              <Text style={styles.heroStatValue}>{formatInr(totalBudget)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.sectionHint}>Cards show spent, budget, and the percent already used.</Text>
        </View>

        <Pressable
          testID="house-expense-shopping-bill-trigger"
          accessibilityRole="button"
          accessibilityLabel="Add a mixed shopping bill"
          onPress={() => {
            setShoppingModalVisible(true);
            setShoppingError(null);
          }}
          style={({ pressed }) => [styles.shoppingCard, pressed && styles.shoppingCardPressed]}
        >
          <Text style={styles.shoppingEyebrow}>Fast entry</Text>
          <Text style={styles.shoppingTitle}>Add one supermarket bill</Text>
          <Text style={styles.shoppingCaption}>
            Enter the total once, optionally split milk, fruits, vegetables, or toiletries, and we will put the rest in {groceryFallbackTitle}.
          </Text>
        </Pressable>

        {rows.map((row, index) => {
          const budget = parseAmount(row.amount);
          const spent = parseAmount(row.spent);
          const { usedFlex, pendingFlex } = progressSegmentLengths(budget, spent);
          const usedPendingText = formatUsedPendingLabel(spent, budget);
          const percentText = usedPercentLabel(budget, spent);
          const remainingText = budget > 0 ? formatInr(Math.max(0, budget - spent)) : 'No budget set';

          return (
            <Pressable
              key={`${row.title}-${index}`}
              testID={`house-expense-dash-row-${index}`}
              accessibilityLabel={`${row.title}, ${usedPendingText} used of budget`}
              onPress={() => setModalRow(row)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {row.title}
                  </Text>
                  <Text style={styles.cardHint}>{remainingText}</Text>
                </View>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentBadgeText}>{percentText}</Text>
                </View>
              </View>

              <Text style={styles.cardUsedPending}>{usedPendingText}</Text>

              <View style={styles.cardBottom}>
                <View style={styles.track} testID={`house-expense-dash-progress-${index}`}>
                  {budget > 0 ? (
                    <>
                      <View style={[styles.usedSegment, { flex: Math.max(usedFlex, 0.001) }]} />
                      <View style={[styles.pendingSegment, { flex: Math.max(pendingFlex, 0.001) }]} />
                    </>
                  ) : (
                    <View style={styles.noBudgetTrack} />
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal
        visible={modalRow !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalRow(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="house-expense-spent-modal">
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{modalRow?.title}</Text>
              <Text style={styles.modalBudget}>
                Monthly budget: {modalRow?.amount ? formatInr(parseAmount(modalRow.amount)) : 'Not set'}
              </Text>
              <Text style={styles.modalLabel}>Amount spent</Text>
              <TextInput
                testID="house-expense-modal-amount-input"
                style={styles.modalInput}
                value={draftSpent}
                onChangeText={setDraftSpent}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.modalLabel}>Date</Text>
              <Pressable
                testID="house-expense-modal-date-trigger"
                onPress={() => setShowDatePicker(true)}
                style={({ pressed }) => [styles.dateTrigger, pressed && styles.dateTriggerPressed]}
              >
                <Text style={styles.dateTriggerText}>{formatExpenseDateDisplay(draftExpenseDate)}</Text>
                <Text style={styles.dateTriggerHint}>Tap to change</Text>
              </Pressable>
              {showDatePicker ? (
                <>
                  <DateTimePicker
                    testID="house-expense-modal-date-picker"
                    value={draftExpenseDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      if (event.type === 'dismissed') {
                        setShowDatePicker(false);
                        return;
                      }
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                      if (date) {
                        setDraftExpenseDate(date);
                      }
                    }}
                  />
                  {Platform.OS === 'ios' ? (
                    <Pressable
                      testID="house-expense-modal-date-done"
                      style={({ pressed }) => [styles.dateDoneBtn, pressed && styles.modalBtnPressed]}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.dateDoneBtnText}>Done</Text>
                    </Pressable>
                  ) : null}
                </>
              ) : null}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                testID="house-expense-modal-cancel"
                style={({ pressed }) => [styles.modalBtn, styles.modalCancel, pressed && styles.modalBtnPressed]}
                onPress={() => setModalRow(null)}
                disabled={isSavingModal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="house-expense-modal-save"
                style={({ pressed }) => [styles.modalBtn, styles.modalSave, pressed && styles.modalBtnPressed]}
                onPress={() => void handleModalSave()}
                disabled={isSavingModal}
              >
                <Text style={styles.modalSaveText}>{isSavingModal ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={shoppingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={resetShoppingForm}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="house-expense-shopping-bill-modal">
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Supermarket bill</Text>
              <Text style={styles.modalBudget}>
                Add the total once. Any amount you do not split goes straight to {groceryFallbackTitle}.
              </Text>

              <Text style={styles.modalLabel}>Total bill amount</Text>
              <TextInput
                testID="house-expense-shopping-total-input"
                style={styles.modalInput}
                value={shoppingTotal}
                onChangeText={(value) => {
                  setShoppingTotal(value);
                  if (shoppingError) {
                    setShoppingError(null);
                  }
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.modalLabel}>Date</Text>
              <Pressable
                testID="house-expense-shopping-date-trigger"
                onPress={() => setShowShoppingDatePicker(true)}
                style={({ pressed }) => [styles.dateTrigger, pressed && styles.dateTriggerPressed]}
              >
                <Text style={styles.dateTriggerText}>{formatExpenseDateDisplay(shoppingExpenseDate)}</Text>
                <Text style={styles.dateTriggerHint}>Tap to change</Text>
              </Pressable>
              {showShoppingDatePicker ? (
                <>
                  <DateTimePicker
                    testID="house-expense-shopping-date-picker"
                    value={shoppingExpenseDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      if (event.type === 'dismissed') {
                        setShowShoppingDatePicker(false);
                        return;
                      }
                      if (Platform.OS === 'android') {
                        setShowShoppingDatePicker(false);
                      }
                      if (date) {
                        setShoppingExpenseDate(date);
                      }
                    }}
                  />
                  {Platform.OS === 'ios' ? (
                    <Pressable
                      testID="house-expense-shopping-date-done"
                      style={({ pressed }) => [styles.dateDoneBtn, pressed && styles.modalBtnPressed]}
                      onPress={() => setShowShoppingDatePicker(false)}
                    >
                      <Text style={styles.dateDoneBtnText}>Done</Text>
                    </Pressable>
                  ) : null}
                </>
              ) : null}

              <Text style={styles.modalLabel}>Quick split</Text>
              <Text style={styles.shoppingSplitHint}>
                Leave these blank if you just want to save the whole bill under {groceryFallbackTitle}.
              </Text>
              {shoppingSplitTitles.map((title) => (
                <View key={title} style={styles.shoppingSplitRow}>
                  <Text style={styles.shoppingSplitLabel}>{title}</Text>
                  <TextInput
                    testID={`house-expense-shopping-split-${title}`}
                    style={styles.shoppingSplitInput}
                    value={shoppingDrafts[title] ?? ''}
                    onChangeText={(value) => {
                      setShoppingDrafts((current) => ({ ...current, [title]: value }));
                      if (shoppingError) {
                        setShoppingError(null);
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              ))}

              <View style={styles.shoppingSummaryCard}>
                <Text style={styles.shoppingSummaryTitle}>Bill summary</Text>
                <Text style={styles.shoppingSummaryLine}>
                  Split assigned: {formatInr(shoppingAssignedAmount)}
                </Text>
                <Text style={styles.shoppingSummaryLine}>
                  Remaining to {groceryFallbackTitle}: {formatInr(shoppingRemainderAmount)}
                </Text>
                {shoppingIsOverAllocated ? (
                  <Text style={styles.shoppingSummaryError}>
                    Split amounts cannot be higher than the total bill.
                  </Text>
                ) : null}
                {shoppingError ? <Text style={styles.shoppingSummaryError}>{shoppingError}</Text> : null}
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                testID="house-expense-shopping-cancel"
                style={({ pressed }) => [styles.modalBtn, styles.modalCancel, pressed && styles.modalBtnPressed]}
                onPress={resetShoppingForm}
                disabled={isSavingShopping}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="house-expense-shopping-save"
                style={({ pressed }) => [styles.modalBtn, styles.modalSave, pressed && styles.modalBtnPressed]}
                onPress={() => void handleShoppingSave()}
                disabled={isSavingShopping}
              >
                <Text style={styles.modalSaveText}>{isSavingShopping ? 'Saving…' : 'Save bill'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: financeColors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 12,
  },
  heroCard: {
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
  heroCaption: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: financeColors.textMuted,
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
  sectionHeader: {
    marginTop: 2,
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
  shoppingCard: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 24,
    padding: 16,
    backgroundColor: financeColors.surfaceStrong,
    ...financeShadow,
  },
  shoppingCardPressed: {
    backgroundColor: financeColors.surface,
  },
  shoppingEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: financeColors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  shoppingTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
    color: financeColors.text,
  },
  shoppingCaption: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: financeColors.textMuted,
  },
  card: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 24,
    padding: 16,
    backgroundColor: financeColors.surfaceStrong,
  },
  cardPressed: {
    backgroundColor: financeColors.surface,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: financeColors.text,
  },
  cardHint: {
    marginTop: 4,
    fontSize: 13,
    color: financeColors.textMuted,
  },
  percentBadge: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: financeColors.goldSoft,
  },
  percentBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: financeColors.accentStrong,
  },
  cardUsedPending: {
    fontSize: 15,
    fontWeight: '600',
    color: financeColors.text,
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: financeColors.surfaceMuted,
  },
  usedSegment: {
    backgroundColor: financeColors.accentStrong,
    minWidth: 0,
  },
  pendingSegment: {
    backgroundColor: financeColors.green,
    minWidth: 0,
  },
  noBudgetTrack: {
    flex: 1,
    backgroundColor: financeColors.surfaceMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(45,36,28,0.3)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: financeColors.surfaceStrong,
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: financeColors.text,
    marginBottom: 8,
  },
  modalBudget: {
    fontSize: 15,
    color: financeColors.textMuted,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: financeColors.text,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 48,
    fontSize: 17,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
    marginBottom: 16,
  },
  shoppingSplitHint: {
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
    color: financeColors.textMuted,
  },
  shoppingSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  shoppingSplitLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: financeColors.text,
  },
  shoppingSplitInput: {
    width: 110,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 46,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  shoppingSummaryCard: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 18,
    padding: 14,
    backgroundColor: financeColors.surface,
    borderWidth: 1,
    borderColor: financeColors.border,
  },
  shoppingSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: financeColors.text,
  },
  shoppingSummaryLine: {
    marginTop: 6,
    fontSize: 14,
    color: financeColors.textMuted,
  },
  shoppingSummaryError: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: financeColors.danger,
  },
  dateTrigger: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: financeColors.surface,
  },
  dateTriggerPressed: {
    backgroundColor: financeColors.surfaceMuted,
  },
  dateTriggerText: {
    fontSize: 17,
    fontWeight: '700',
    color: financeColors.text,
  },
  dateTriggerHint: {
    fontSize: 13,
    color: financeColors.textMuted,
    marginTop: 4,
  },
  dateDoneBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  dateDoneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: financeColors.accent,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnPressed: {
    opacity: 0.85,
  },
  modalCancel: {
    backgroundColor: financeColors.surfaceMuted,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: financeColors.text,
  },
  modalSave: {
    backgroundColor: financeColors.accent,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
