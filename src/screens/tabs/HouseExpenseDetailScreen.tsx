import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
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

export default function HouseExpenseDetailScreen() {
  const { rows, isReady, refresh, saveSpent } = useHouseExpenseDashboard();
  const [modalRow, setModalRow] = useState<HouseExpenseDashboardRow | null>(null);
  const [draftSpent, setDraftSpent] = useState('');
  const [draftExpenseDate, setDraftExpenseDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSavingModal, setIsSavingModal] = useState(false);

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

  if (!isReady) {
    return (
      <View style={styles.centered} testID="screen-house-expense-detail-loading">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.screen} testID="screen-house-expense-detail">
      <Text style={styles.screenCaption}>Tap a category to update amount spent.</Text>
      <Text style={styles.legendHint}>
        <Text style={styles.legendPending}>Green</Text> = pending ·{' '}
        <Text style={styles.legendUsed}>Red</Text> = used
      </Text>

      <ScrollView contentContainerStyle={styles.listContent}>
        {rows.map((row, index) => {
          const budget = parseAmount(row.amount);
          const spent = parseAmount(row.spent);
          const { usedFlex, pendingFlex } = progressSegmentLengths(budget, spent);
          const usedPendingText = formatUsedPendingLabel(spent, budget);
          const percentText = usedPercentLabel(budget, spent);

          return (
            <Pressable
              key={`${row.title}-${index}`}
              testID={`house-expense-dash-row-${index}`}
              accessibilityLabel={`${row.title}, ${usedPendingText} used of budget`}
              onPress={() => setModalRow(row)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {row.title}
                </Text>
                <Text style={styles.cardUsedPending}>{usedPendingText}</Text>
              </View>
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
                <Text style={styles.percentText}>{percentText}</Text>
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
                Budget (from settings): {modalRow?.amount || '—'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  screenCaption: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
    paddingHorizontal: 20,
  },
  legendHint: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
  },
  cardPressed: {
    backgroundColor: '#f9fafb',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  cardUsedPending: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  usedSegment: {
    backgroundColor: '#dc2626',
    minWidth: 0,
  },
  pendingSegment: {
    backgroundColor: '#16a34a',
    minWidth: 0,
  },
  noBudgetTrack: {
    flex: 1,
    backgroundColor: '#d1d5db',
  },
  percentText: {
    minWidth: 40,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },
  legendUsed: {
    color: '#dc2626',
    fontWeight: '600',
  },
  legendPending: {
    color: '#16a34a',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  modalBudget: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
    fontSize: 17,
    marginBottom: 16,
  },
  dateTrigger: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  dateTriggerPressed: {
    backgroundColor: '#f3f4f6',
  },
  dateTriggerText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  dateTriggerHint: {
    fontSize: 13,
    color: '#6b7280',
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
    fontWeight: '600',
    color: '#2563eb',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnPressed: {
    opacity: 0.85,
  },
  modalCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalSave: {
    backgroundColor: '#2563eb',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
