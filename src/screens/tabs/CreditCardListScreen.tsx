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
import {
  buildCreditCardDueDatesByYmd,
  formatDueEntriesForCalendarCell,
  type CreditCardDueEntry,
} from '../../creditCards/creditCardCalendarLogic';
import { formatRegisteredCardCountLabel } from '../../creditCards/creditCardLogic';
import { useCreditCards } from '../../creditCards/useCreditCards';
import { useCreditCardReminders } from '../../creditCards/useCreditCardReminders';
import {
  formatExpenseDateDisplay,
  parseExpenseDateYmd,
  toExpenseDateYmd,
} from '../../houseExpense/expenseDate';
import { financeCalendarTheme, financeColors, financeShadow } from '../../ui/financeTheme';

export function CreditCardListScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { cards, isReady, isSaving, formError, addCard, clearFormError } = useCreditCards();
  const {
    remindersEnabled,
    remindersPrefLoaded,
    tryEnableReminders,
    disableReminders,
  } = useCreditCardReminders(cards, isReady);
  const [cardName, setCardName] = useState('');
  const [billDay, setBillDay] = useState('');
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dayDetailYmd, setDayDetailYmd] = useState<string | null>(null);
  const [allCardsListVisible, setAllCardsListVisible] = useState(false);

  const cardsSortedByName = useMemo(
    () => [...cards].sort((a, b) => a.cardName.localeCompare(b.cardName)),
    [cards],
  );

  const dueByYmd = useMemo(() => {
    const entries: CreditCardDueEntry[] = cards.map((c) => ({
      id: c.id,
      cardName: c.cardName,
      billPaymentDay: c.billPaymentDay,
    }));
    return buildCreditCardDueDatesByYmd(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      entries,
    );
  }, [calendarMonth, cards]);

  const calendarCurrentYmd = useMemo(
    () => toExpenseDateYmd(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)),
    [calendarMonth],
  );

  const openDayDetail = useCallback((ymd: string) => {
    const list = dueByYmd[ymd];
    if (list && list.length > 0) {
      setDayDetailYmd(ymd);
    }
  }, [dueByYmd]);

  const closeAddSheet = useCallback(() => {
    setAddSheetVisible(false);
    clearFormError();
    setCardName('');
    setBillDay('');
  }, [clearFormError]);

  const openAddSheet = useCallback(() => {
    clearFormError();
    setCardName('');
    setBillDay('');
    setAddSheetVisible(true);
  }, [clearFormError]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: isReady
        ? () => (
            <Pressable
              testID="credit-card-header-add"
              accessibilityRole="button"
              accessibilityLabel="Add credit card"
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
      const dueList = entries ?? [];
      const hasDue = !isDisabled && dueList.length > 0;
      const dueText = hasDue ? formatDueEntriesForCalendarCell(dueList) : null;
      const a11y =
        dueText !== null
          ? `${date.dateString}, day ${date.day}, payment due, ${dueText.replace(/\n/g, ', ')}`
          : `${date.dateString}, day ${date.day}`;
      return (
        <Pressable
          testID={`credit-card-cal-day-${date.dateString}`}
          accessibilityLabel={a11y}
          accessibilityState={{ disabled: isDisabled || !hasDue }}
          disabled={isDisabled || !hasDue}
          onPress={() => openDayDetail(date.dateString)}
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
          {dueText !== null ? (
            <Text style={styles.calDueText} numberOfLines={3}>
              {dueText}
            </Text>
          ) : null}
        </Pressable>
      );
    },
    [dueByYmd, openDayDetail],
  );

  async function handleAdd() {
    clearFormError();
    const ok = await addCard(cardName, billDay);
    if (ok) {
      closeAddSheet();
    }
  }

  if (!isReady) {
    return (
      <View style={styles.centered} testID="screen-credit-card-list">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const dayDetailEntries = dayDetailYmd ? dueByYmd[dayDetailYmd] ?? [] : [];

  return (
    <View style={styles.screen} testID="screen-credit-card-list">
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Cards tracker</Text>
          <Text style={styles.heroTitle}>Know every card billing day before your statement cycle catches you.</Text>
          <Text style={styles.screenCaption}>
            Card summary above the calendar lists every card. Highlighted days are bill dates this month.
            Tap Add above to register a new card.
          </Text>
        </View>

        <View style={styles.reminderRow}>
          <View style={styles.reminderRowText}>
            <Text style={styles.reminderTitle}>Bill day reminders</Text>
            <Text style={styles.reminderSub}>
              {Platform.OS === 'web'
                ? 'Reminders are available in the iOS or Android app.'
                : 'Each month at 9:00 on a card’s company bill day.'}
            </Text>
          </View>
          <Switch
            testID="credit-card-reminders-switch"
            disabled={Platform.OS === 'web' || !remindersPrefLoaded}
            value={remindersEnabled && Platform.OS !== 'web'}
            onValueChange={(next) => {
              void (async () => {
                if (next) {
                  const ok = await tryEnableReminders();
                  if (!ok) {
                    Alert.alert(
                      'Notifications off',
                      'Allow notifications for this app in system settings to get bill day reminders.',
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
            testID="credit-card-count-summary"
            accessibilityRole="button"
            accessibilityLabel={`${formatRegisteredCardCountLabel(cards.length)}. Tap to view the full list.`}
            onPress={() => setAllCardsListVisible(true)}
            style={({ pressed }) => [styles.cardCountSummary, pressed && styles.cardCountSummaryPressed]}
          >
            <Text style={styles.cardCountSummaryLabel}>Cards registered</Text>
            <Text testID="credit-card-count-summary-value" style={styles.cardCountSummaryNumber}>
              {cards.length}
            </Text>
            <Text style={styles.cardCountSummaryHint}>
              {cards.length === 0
                ? 'Tap to open list — use Add to add a card'
                : `${formatRegisteredCardCountLabel(cards.length)} · tap for full list`}
            </Text>
          </Pressable>

          <View style={styles.calendarFrame} testID="credit-card-due-calendar">
            <Text style={styles.calendarSectionTitle}>Due date calendar</Text>
            <Text style={styles.calendarSectionHint}>
              Due dates use a blue highlight; card name and billing day are shown on the day.
            </Text>
            <Calendar
              current={calendarCurrentYmd}
              onMonthChange={(m: DateData) => {
                setCalendarMonth(new Date(m.year, m.month - 1, 1));
              }}
              hideExtraDays
              enableSwipeMonths
              theme={financeCalendarTheme}
              dayComponent={renderCalendarDay}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={addSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAddSheet}
      >
        <View style={styles.addSheetRoot}>
          <Pressable
            testID="credit-card-add-sheet-backdrop"
            accessibilityLabel="Dismiss add card"
            style={styles.addSheetBackdrop}
            onPress={closeAddSheet}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.addSheetKeyboard}
            pointerEvents="box-none"
          >
            <View
              style={[styles.addSheetPanel, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
              testID="credit-card-add-sheet"
            >
              <View style={styles.addSheetHandle} />
              <View style={styles.addSheetTitleRow}>
                <Text style={styles.addSheetTitle}>New card</Text>
                <Pressable
                  testID="credit-card-add-sheet-close"
                  accessibilityRole="button"
                  accessibilityLabel="Close add card"
                  onPress={closeAddSheet}
                  style={({ pressed }) => [styles.addSheetCloseBtn, pressed && styles.addSheetCloseBtnPressed]}
                >
                  <Text style={styles.addSheetCloseLabel}>✕</Text>
                </Pressable>
              </View>
              <Text style={styles.addSheetHint}>
                Card name and the day of the month your company bills you (1–31).
              </Text>
              <Text style={styles.label}>Card name</Text>
              <TextInput
                testID="credit-card-name-input"
                style={styles.input}
                placeholder="e.g. Corporate Visa"
                placeholderTextColor="#9ca3af"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
                returnKeyType="next"
              />
              <Text style={styles.label}>Company bill payment day</Text>
              <TextInput
                testID="credit-card-bill-day-input"
                style={styles.inputDay}
                placeholder="1–31"
                placeholderTextColor="#9ca3af"
                value={billDay}
                onChangeText={setBillDay}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={() => void handleAdd()}
              />
              {formError ? (
                <Text testID="credit-card-form-error" style={styles.error}>
                  {formError}
                </Text>
              ) : null}
              <Pressable
                testID="credit-card-add-button"
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.addButton,
                  styles.addButtonSheet,
                  (pressed || isSaving) && styles.addButtonPressed,
                ]}
                onPress={() => void handleAdd()}
              >
                <Text style={styles.addButtonLabel}>{isSaving ? 'Saving…' : 'Add card'}</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={allCardsListVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAllCardsListVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="credit-card-all-list-modal">
            <Text style={styles.modalTitle}>Your cards</Text>
            <Text style={styles.dayDetailSubtitle}>
              {formatRegisteredCardCountLabel(cards.length)}
            </Text>
            {cardsSortedByName.length === 0 ? (
              <Text style={styles.allListEmpty}>No cards yet. Tap Add in the header to add one.</Text>
            ) : (
              <ScrollView style={styles.dayDetailList} keyboardShouldPersistTaps="handled">
                {cardsSortedByName.map((c) => (
                  <View key={c.id} style={styles.dayDetailRow} testID={`credit-card-all-list-row-${c.id}`}>
                    <Text style={styles.dayDetailName} numberOfLines={2}>
                      {c.cardName}
                    </Text>
                    <Text style={styles.dayDetailMeta}>Company bill day: {c.billPaymentDay}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <Pressable
              testID="credit-card-all-list-close"
              style={({ pressed }) => [styles.modalBtn, styles.modalCloseBtn, pressed && styles.modalBtnPressed]}
              onPress={() => setAllCardsListVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={dayDetailYmd !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDayDetailYmd(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="credit-card-day-detail-modal">
            <Text style={styles.modalTitle}>
              {dayDetailYmd
                ? formatExpenseDateDisplay(parseExpenseDateYmd(dayDetailYmd) ?? new Date())
                : ''}
            </Text>
            <Text style={styles.dayDetailSubtitle}>Cards with a bill date on this day</Text>
            <ScrollView style={styles.dayDetailList} keyboardShouldPersistTaps="handled">
              {dayDetailEntries.map((e) => (
                <View key={e.id} style={styles.dayDetailRow} testID={`credit-card-day-detail-${e.id}`}>
                  <Text style={styles.dayDetailName} numberOfLines={2}>
                    {e.cardName}
                  </Text>
                  <Text style={styles.dayDetailMeta}>Company bill day: {e.billPaymentDay}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable
              testID="credit-card-day-detail-close"
              style={({ pressed }) => [styles.modalBtn, styles.modalCloseBtn, pressed && styles.modalBtnPressed]}
              onPress={() => setDayDetailYmd(null)}
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
    paddingBottom: 120,
  },
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
  headerAddButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
  },
  headerAddButtonPressed: {
    opacity: 0.6,
  },
  headerAddInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerAddLabel: {
    fontSize: 17,
    color: financeColors.accent,
    fontWeight: '700',
  },
  screenCaption: {
    marginTop: 10,
    fontSize: 15,
    color: financeColors.textMuted,
    lineHeight: 22,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: financeColors.border,
    backgroundColor: financeColors.surface,
  },
  reminderRowText: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: financeColors.text,
    marginBottom: 4,
  },
  reminderSub: {
    fontSize: 13,
    color: financeColors.textMuted,
    lineHeight: 18,
  },
  addSheetRoot: {
    flex: 1,
  },
  addSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45,36,28,0.3)',
  },
  addSheetKeyboard: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  addSheetPanel: {
    backgroundColor: financeColors.surfaceStrong,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '88%',
  },
  addSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: financeColors.border,
    marginBottom: 12,
  },
  addSheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: financeColors.text,
  },
  addSheetCloseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  addSheetCloseBtnPressed: {
    opacity: 0.5,
  },
  addSheetCloseLabel: {
    fontSize: 18,
    color: financeColors.textMuted,
    fontWeight: '600',
  },
  addSheetHint: {
    fontSize: 14,
    color: financeColors.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  calendarWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 12,
  },
  cardCountSummary: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: financeColors.accent,
  },
  cardCountSummaryPressed: {
    opacity: 0.92,
  },
  cardCountSummaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff4ee',
    marginBottom: 4,
  },
  cardCountSummaryNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  cardCountSummaryHint: {
    fontSize: 13,
    color: '#fff0e8',
    lineHeight: 18,
  },
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
  calDayEmpty: {
    flex: 1,
    minHeight: 58,
  },
  calDayCell: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingHorizontal: 1,
    marginVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  calDayCellDue: {
    backgroundColor: financeColors.accentSoft,
    borderColor: financeColors.accent,
  },
  calDayCellDisabled: {
    opacity: 0.4,
  },
  calDayCellDuePressed: {
    opacity: 0.82,
  },
  calDayNum: {
    fontSize: 15,
    fontWeight: '600',
    color: financeColors.text,
  },
  calDayNumDisabled: {
    color: '#b8ad9f',
  },
  calDayToday: {
    color: financeColors.accent,
  },
  calDueText: {
    fontSize: 9,
    fontWeight: '700',
    color: financeColors.accentStrong,
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 11,
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: financeColors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  inputDay: {
    minHeight: 44,
    alignSelf: 'flex-start',
    minWidth: 120,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  error: {
    marginTop: 10,
    fontSize: 14,
    color: financeColors.danger,
  },
  addButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: financeColors.accent,
  },
  addButtonSheet: {
    alignSelf: 'stretch',
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  allListEmpty: {
    fontSize: 15,
    color: financeColors.textMuted,
    marginBottom: 16,
    lineHeight: 22,
  },
  dayDetailSubtitle: {
    fontSize: 14,
    color: financeColors.textMuted,
    marginBottom: 12,
  },
  dayDetailList: {
    maxHeight: 280,
    marginBottom: 12,
  },
  dayDetailRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: financeColors.border,
  },
  dayDetailName: {
    fontSize: 16,
    fontWeight: '700',
    color: financeColors.text,
  },
  dayDetailMeta: {
    marginTop: 4,
    fontSize: 14,
    color: financeColors.textMuted,
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
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    minWidth: 100,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  modalBtnPressed: {
    opacity: 0.85,
  },
  modalCloseBtn: {
    backgroundColor: financeColors.accent,
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
