import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, type DateData } from 'react-native-calendars';
import { buildBillsDueByYmdForMonth, formatRegisteredBillCountLabel, type BillRecurrenceType } from '../../bills/billsLogic';
import { useBillReminders } from '../../bills/useBillReminders';
import { useBills } from '../../bills/useBills';
import { formatExpenseDateDisplay, parseExpenseDateYmd, toExpenseDateYmd } from '../../houseExpense/expenseDate';
import { formatInr } from '../../localization/indiaFormat';
import { financeCalendarTheme, financeColors, financeShadow } from '../../ui/financeTheme';

export function BillsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { bills, isReady, isSaving, formError, addBill, clearFormError } = useBills();
  const {
    remindersEnabled,
    remindersPrefLoaded,
    tryEnableReminders,
    disableReminders,
  } = useBillReminders(bills, isReady);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [billName, setBillName] = useState('');
  const [providerName, setProviderName] = useState('');
  const [amount, setAmount] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<BillRecurrenceType>('monthly');
  const [dueDay, setDueDay] = useState('');
  const [oneTimeDueDate, setOneTimeDueDate] = useState('');
  const [reminderDays, setReminderDays] = useState('1');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dayDetailYmd, setDayDetailYmd] = useState<string | null>(null);
  const [allBillsVisible, setAllBillsVisible] = useState(false);

  const dueByYmd = useMemo(
    () => buildBillsDueByYmdForMonth(calendarMonth.getFullYear(), calendarMonth.getMonth(), bills),
    [calendarMonth, bills],
  );

  const calendarCurrentYmd = useMemo(
    () => toExpenseDateYmd(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)),
    [calendarMonth],
  );

  const closeAddSheet = useCallback(() => {
    setAddSheetVisible(false);
    clearFormError();
    setBillName('');
    setProviderName('');
    setAmount('');
    setRecurrenceType('monthly');
    setDueDay('');
    setOneTimeDueDate('');
    setReminderDays('1');
    setPaymentUrl('');
  }, [clearFormError]);

  const openAddSheet = useCallback(() => {
    clearFormError();
    setAddSheetVisible(true);
  }, [clearFormError]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: isReady
        ? () => (
            <Pressable
              testID="bills-header-add"
              accessibilityRole="button"
              accessibilityLabel="Add bill"
              onPress={openAddSheet}
              style={({ pressed }) => [styles.headerAddButton, pressed && styles.headerAddButtonPressed]}
            >
              <View style={styles.headerAddInner}>
                <Ionicons name="add-circle-outline" size={22} color={financeColors.accent} />
                <Text style={styles.headerAddLabel}>Add</Text>
              </View>
            </Pressable>
          )
        : () => null,
    });
  }, [navigation, isReady, openAddSheet]);

  const renderCalendarDay = useCallback(
    (props: { date?: DateData; state?: string }) => {
      const { date, state } = props;
      if (!date) {
        return <View style={styles.calDayEmpty} />;
      }
      const isDisabled = state === 'disabled';
      const entries = dueByYmd[date.dateString];
      const hasDue = !isDisabled && (entries?.length ?? 0) > 0;
      const dueText = hasDue ? entries?.map((e) => e.billName).join(', ') : null;
      return (
        <Pressable
          testID={`bills-cal-day-${date.dateString}`}
          accessibilityState={{ disabled: isDisabled || !hasDue }}
          disabled={isDisabled || !hasDue}
          onPress={() => setDayDetailYmd(date.dateString)}
          style={({ pressed }) => [
            styles.calDayCell,
            hasDue && styles.calDayCellDue,
            isDisabled && styles.calDayCellDisabled,
            pressed && hasDue && styles.calDayCellDuePressed,
          ]}
        >
          <Text
            style={[
              styles.calDayNum,
              state === 'today' && styles.calDayToday,
              isDisabled && styles.calDayNumDisabled,
            ]}
          >
            {date.day}
          </Text>
          {dueText ? (
            <Text style={styles.calDueText} numberOfLines={2}>
              {dueText}
            </Text>
          ) : null}
        </Pressable>
      );
    },
    [dueByYmd],
  );

  async function handleAdd() {
    clearFormError();
    const ok = await addBill(
      billName,
      providerName,
      amount,
      recurrenceType,
      dueDay,
      oneTimeDueDate,
      reminderDays,
      paymentUrl,
    );
    if (ok) {
      closeAddSheet();
    }
  }

  if (!isReady) {
    return (
      <View style={styles.centered} testID="screen-bills">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const dayEntries = dayDetailYmd ? dueByYmd[dayDetailYmd] ?? [] : [];

  return (
    <View style={styles.screen} testID="screen-bills">
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Bills planner</Text>
          <Text style={styles.heroTitle}>Track every due date before it becomes a late fee.</Text>
          <Text style={styles.screenCaption}>
            Organize one-time and monthly bills. Use reminders to stay ahead of due dates.
          </Text>
        </View>

        <View style={styles.reminderRow}>
          <View style={styles.reminderRowText}>
            <Text style={styles.reminderTitle}>Bill reminders</Text>
            <Text style={styles.reminderSub}>
              {Platform.OS === 'web'
                ? 'Reminders are available in the iOS or Android app.'
                : 'Get local reminders before each due date.'}
            </Text>
          </View>
          <Switch
            testID="bills-reminders-switch"
            disabled={Platform.OS === 'web' || !remindersPrefLoaded}
            value={remindersEnabled && Platform.OS !== 'web'}
            onValueChange={(next) => {
              void (async () => {
                if (next) {
                  const ok = await tryEnableReminders();
                  if (!ok) {
                    Alert.alert(
                      'Notifications off',
                      'Allow notifications for this app in system settings to get bill reminders.',
                    );
                  }
                } else {
                  await disableReminders();
                }
              })();
            }}
          />
        </View>

        <View style={styles.calendarWrap}>
          <Pressable
            testID="bills-count-summary"
            accessibilityRole="button"
            accessibilityLabel={`${formatRegisteredBillCountLabel(bills.length)}. Tap to view the full list.`}
            onPress={() => setAllBillsVisible(true)}
            style={({ pressed }) => [styles.countSummary, pressed && styles.countSummaryPressed]}
          >
            <Text style={styles.countSummaryLabel}>Bills registered</Text>
            <Text testID="bills-count-summary-value" style={styles.countSummaryNumber}>
              {bills.length}
            </Text>
            <Text style={styles.countSummaryHint}>
              {bills.length === 0
                ? 'Tap to open list. Use Add to register a bill.'
                : `${formatRegisteredBillCountLabel(bills.length)} · tap for full list`}
            </Text>
          </Pressable>

          <View style={styles.calendarFrame} testID="bills-due-calendar">
            <Text style={styles.calendarSectionTitle}>Bill calendar</Text>
            <Text style={styles.calendarSectionHint}>Highlighted days have one or more bills due.</Text>
            <Calendar
              current={calendarCurrentYmd}
              onMonthChange={(m: DateData) => setCalendarMonth(new Date(m.year, m.month - 1, 1))}
              hideExtraDays
              enableSwipeMonths
              theme={financeCalendarTheme}
              dayComponent={renderCalendarDay}
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={addSheetVisible} transparent animationType="slide" onRequestClose={closeAddSheet}>
        <View style={styles.addSheetRoot}>
          <Pressable
            testID="bills-add-sheet-backdrop"
            accessibilityLabel="Dismiss add bill"
            style={styles.addSheetBackdrop}
            onPress={closeAddSheet}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.addSheetKeyboard}
            pointerEvents="box-none"
          >
            <View style={[styles.addSheetPanel, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]} testID="bills-add-sheet">
              <View style={styles.addSheetHandle} />
              <View style={styles.addSheetTitleRow}>
                <Text style={styles.addSheetTitle}>New bill</Text>
                <Pressable
                  testID="bills-add-sheet-close"
                  accessibilityRole="button"
                  accessibilityLabel="Close add bill"
                  onPress={closeAddSheet}
                  style={({ pressed }) => [styles.addSheetCloseBtn, pressed && styles.addSheetCloseBtnPressed]}
                >
                  <Text style={styles.addSheetCloseLabel}>✕</Text>
                </Pressable>
              </View>
              <Text style={styles.addSheetHint}>Add a monthly recurring bill or a one-time due bill.</Text>

              <Text style={styles.label}>Bill name</Text>
              <TextInput
                testID="bills-name-input"
                style={styles.input}
                placeholder="e.g. Electricity"
                placeholderTextColor="#9ca3af"
                value={billName}
                onChangeText={setBillName}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Provider (optional)</Text>
              <TextInput
                testID="bills-provider-input"
                style={styles.input}
                placeholder="e.g. BESCOM"
                placeholderTextColor="#9ca3af"
                value={providerName}
                onChangeText={setProviderName}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Amount</Text>
              <TextInput
                testID="bills-amount-input"
                style={styles.input}
                placeholder="e.g. 1500"
                placeholderTextColor="#9ca3af"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Recurrence</Text>
              <View style={styles.recurrenceRow}>
                <Pressable
                  testID="bills-recurrence-monthly"
                  onPress={() => setRecurrenceType('monthly')}
                  style={({ pressed }) => [
                    styles.recurrenceChip,
                    recurrenceType === 'monthly' && styles.recurrenceChipActive,
                    pressed && styles.recurrenceChipPressed,
                  ]}
                >
                  <Text style={[styles.recurrenceChipText, recurrenceType === 'monthly' && styles.recurrenceChipTextActive]}>
                    Monthly
                  </Text>
                </Pressable>
                <Pressable
                  testID="bills-recurrence-onetime"
                  onPress={() => setRecurrenceType('one_time')}
                  style={({ pressed }) => [
                    styles.recurrenceChip,
                    recurrenceType === 'one_time' && styles.recurrenceChipActive,
                    pressed && styles.recurrenceChipPressed,
                  ]}
                >
                  <Text style={[styles.recurrenceChipText, recurrenceType === 'one_time' && styles.recurrenceChipTextActive]}>
                    One-time
                  </Text>
                </Pressable>
              </View>

              {recurrenceType === 'monthly' ? (
                <>
                  <Text style={styles.label}>Due day (1–31)</Text>
                  <TextInput
                    testID="bills-due-day-input"
                    style={styles.input}
                    placeholder="e.g. 10"
                    placeholderTextColor="#9ca3af"
                    value={dueDay}
                    onChangeText={setDueDay}
                    keyboardType="number-pad"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
                  <TextInput
                    testID="bills-due-date-input"
                    style={styles.input}
                    placeholder="e.g. 2026-04-15"
                    placeholderTextColor="#9ca3af"
                    value={oneTimeDueDate}
                    onChangeText={setOneTimeDueDate}
                  />
                </>
              )}

              <Text style={styles.label}>Reminder days before due date</Text>
              <TextInput
                testID="bills-reminder-days-input"
                style={styles.input}
                placeholder="1"
                placeholderTextColor="#9ca3af"
                value={reminderDays}
                onChangeText={setReminderDays}
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Payment URL (optional)</Text>
              <TextInput
                testID="bills-payment-url-input"
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#9ca3af"
                value={paymentUrl}
                onChangeText={setPaymentUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

              <Pressable
                testID="bills-add-button"
                accessibilityRole="button"
                accessibilityLabel="Save bill"
                disabled={isSaving}
                onPress={() => void handleAdd()}
                style={({ pressed }) => [styles.addBtn, (pressed || isSaving) && styles.addBtnPressed]}
              >
                <Text style={styles.addBtnText}>{isSaving ? 'Saving…' : 'Save bill'}</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={dayDetailYmd !== null} transparent animationType="fade" onRequestClose={() => setDayDetailYmd(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="bills-day-detail-modal">
            <Text style={styles.modalTitle}>
              {dayDetailYmd ? formatExpenseDateDisplay(parseExpenseDateYmd(dayDetailYmd) ?? new Date()) : ''}
            </Text>
            <Text style={styles.dayDetailSubtitle}>Bills due on this day</Text>
            {dayEntries.length === 0 ? (
              <Text style={styles.dayDetailEmpty}>No bills due for this day.</Text>
            ) : (
              <ScrollView style={styles.dayDetailList}>
                {dayEntries.map((entry) => (
                    <View key={entry.id} style={styles.dayDetailRow} testID={`bills-day-detail-${entry.id}`}>
                    <View style={styles.dayDetailCol}>
                      <Text style={styles.dayDetailName}>{entry.billName}</Text>
                      {entry.providerName ? <Text style={styles.dayDetailProvider}>{entry.providerName}</Text> : null}
                    </View>
                    <Text style={styles.dayDetailAmount}>{formatInr(Number(entry.amount) || 0)}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <Pressable
              testID="bills-day-detail-close"
              onPress={() => setDayDetailYmd(null)}
              style={({ pressed }) => [styles.modalBtn, styles.modalCloseBtn, pressed && styles.modalBtnPressed]}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={allBillsVisible} transparent animationType="fade" onRequestClose={() => setAllBillsVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="bills-all-list-modal">
            <Text style={styles.modalTitle}>All bills</Text>
            {bills.length === 0 ? (
              <Text style={styles.dayDetailEmpty}>No bills yet.</Text>
            ) : (
              <ScrollView style={styles.dayDetailList}>
                {bills.map((bill) => (
                    <View key={bill.id} style={styles.dayDetailRow} testID={`bills-all-list-row-${bill.id}`}>
                    <View style={styles.dayDetailCol}>
                      <Text style={styles.dayDetailName}>{bill.billName}</Text>
                      <Text style={styles.dayDetailProvider}>
                        {bill.recurrenceType === 'monthly'
                          ? `Monthly · day ${bill.dueDay ?? '—'}`
                          : `One-time · ${bill.dueDateYmd ?? '—'}`}
                      </Text>
                    </View>
                    <Text style={styles.dayDetailAmount}>{formatInr(Number(bill.amount) || 0)}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <Pressable
              testID="bills-all-list-close"
              onPress={() => setAllBillsVisible(false)}
              style={({ pressed }) => [styles.modalBtn, styles.modalCloseBtn, pressed && styles.modalBtnPressed]}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
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
  screenCaption: {
    marginTop: 10,
    fontSize: 15,
    color: financeColors.textMuted,
    lineHeight: 22,
  },
  reminderRow: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: financeColors.surface,
  },
  reminderRowText: { flex: 1 },
  reminderTitle: { fontSize: 15, fontWeight: '700', color: financeColors.text },
  reminderSub: { marginTop: 4, fontSize: 13, color: financeColors.textMuted },
  calendarWrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, gap: 12 },
  countSummary: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: financeColors.accent,
  },
  countSummaryPressed: { opacity: 0.92 },
  countSummaryLabel: { fontSize: 14, fontWeight: '700', color: '#fff4ee', marginBottom: 4 },
  countSummaryNumber: { fontSize: 36, fontWeight: '800', color: '#ffffff', marginBottom: 6 },
  countSummaryHint: { fontSize: 13, color: '#fff0e8', lineHeight: 18 },
  calendarFrame: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: financeColors.surfaceStrong,
    overflow: 'hidden',
  },
  calendarSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: financeColors.text,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  calendarSectionHint: {
    fontSize: 13,
    color: financeColors.textMuted,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  calDayEmpty: { height: 44 },
  calDayCell: {
    minHeight: 54,
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingTop: 4,
    paddingBottom: 3,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  calDayCellDue: { backgroundColor: financeColors.accentSoft },
  calDayCellDisabled: { opacity: 0.35 },
  calDayCellDuePressed: { opacity: 0.7 },
  calDayNum: { fontSize: 13, color: financeColors.text, fontWeight: '600' },
  calDayNumDisabled: { color: '#b8ad9f' },
  calDayToday: { color: financeColors.accent, fontWeight: '700' },
  calDueText: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 12,
    color: financeColors.accentStrong,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  headerAddButton: { paddingHorizontal: 10, paddingVertical: 6, marginRight: 6 },
  headerAddButtonPressed: { opacity: 0.7 },
  headerAddInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerAddLabel: { color: financeColors.accent, fontSize: 16, fontWeight: '700' },
  addSheetRoot: { flex: 1, justifyContent: 'flex-end' },
  addSheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(45,36,28,0.3)' },
  addSheetKeyboard: { justifyContent: 'flex-end' },
  addSheetPanel: {
    backgroundColor: financeColors.surfaceStrong,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    maxHeight: '88%',
  },
  addSheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: financeColors.border,
    marginBottom: 10,
  },
  addSheetTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addSheetTitle: { fontSize: 20, fontWeight: '700', color: financeColors.text },
  addSheetCloseBtn: { padding: 6, borderRadius: 10 },
  addSheetCloseBtnPressed: { backgroundColor: financeColors.surfaceMuted },
  addSheetCloseLabel: { fontSize: 20, color: financeColors.textMuted },
  addSheetHint: { marginTop: 6, marginBottom: 12, fontSize: 13, color: financeColors.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: financeColors.text, marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  recurrenceRow: { flexDirection: 'row', gap: 8 },
  recurrenceChip: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: financeColors.surface,
  },
  recurrenceChipActive: { borderColor: financeColors.accent, backgroundColor: financeColors.accentSoft },
  recurrenceChipPressed: { opacity: 0.8 },
  recurrenceChipText: { fontSize: 13, fontWeight: '600', color: financeColors.textMuted },
  recurrenceChipTextActive: { color: financeColors.accentStrong },
  errorText: { marginTop: 10, color: financeColors.danger, fontSize: 13, fontWeight: '500' },
  addBtn: {
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 14,
    backgroundColor: financeColors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnPressed: { opacity: 0.7 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(45,36,28,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: financeColors.surfaceStrong,
    borderRadius: 24,
    padding: 16,
  },
  modalTitle: { fontSize: 19, fontWeight: '700', color: financeColors.text },
  dayDetailSubtitle: { marginTop: 4, fontSize: 13, color: financeColors.textMuted },
  dayDetailEmpty: { marginTop: 16, fontSize: 14, color: financeColors.textMuted },
  dayDetailList: { marginTop: 12 },
  dayDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: financeColors.border,
    gap: 10,
  },
  dayDetailCol: { flex: 1 },
  dayDetailName: { fontSize: 15, fontWeight: '600', color: financeColors.text },
  dayDetailProvider: { marginTop: 2, fontSize: 12, color: financeColors.textMuted },
  dayDetailAmount: { fontSize: 14, fontWeight: '700', color: financeColors.text },
  modalBtn: { marginTop: 14, paddingVertical: 11, borderRadius: 14, alignItems: 'center' },
  modalCloseBtn: { backgroundColor: financeColors.accent },
  modalBtnPressed: { opacity: 0.7 },
  modalCloseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
