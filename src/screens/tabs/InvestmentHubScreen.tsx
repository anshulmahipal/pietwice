import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FinanceHubLayout } from '../../financeHub/FinanceHubLayout';
import { financeEntityHubModalStyles as modalStyles } from '../../financeHub/financeEntityHubModalStyles';
import {
  buildMonthlyKeyedDatesByYmd,
  type MonthlyKeyedEntry,
} from '../../financeHub/monthlyDayCalendarLogic';
import { useInvestments } from '../../investments/useInvestments';
import { formatHoldingCountLabel } from '../../investments/investmentLogic';
import {
  formatExpenseDateDisplay,
  parseExpenseDateYmd,
  toExpenseDateYmd,
} from '../../houseExpense/expenseDate';
import type { ProfileStackParamList } from '../../navigation/profileStackTypes';

export function InvestmentHubScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'InvestmentHub'>>();
  const insets = useSafeAreaInsets();
  const { holdings, isReady, isSaving, formError, addHolding, clearFormError } = useInvestments();

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [holdingName, setHoldingName] = useState('');
  const [activityDay, setActivityDay] = useState('');
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [dayDetailYmd, setDayDetailYmd] = useState<string | null>(null);

  const holdingsSorted = useMemo(
    () => [...holdings].sort((a, b) => a.holdingName.localeCompare(b.holdingName)),
    [holdings],
  );

  const calendarEntries: MonthlyKeyedEntry[] = useMemo(
    () =>
      holdings.map((h) => ({
        id: h.id,
        name: h.holdingName,
        dayOfMonth: h.activityDay,
      })),
    [holdings],
  );

  const byYmd = useMemo(
    () =>
      buildMonthlyKeyedDatesByYmd(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth(),
        calendarEntries,
      ),
    [calendarMonth, calendarEntries],
  );

  const markedDates = useMemo(() => {
    const out: Record<string, { marked: boolean; dotColor: string }> = {};
    for (const ymd of Object.keys(byYmd)) {
      out[ymd] = { marked: true, dotColor: '#e36a43' };
    }
    return out;
  }, [byYmd]);

  const calendarCurrentYmd = useMemo(
    () =>
      toExpenseDateYmd(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)),
    [calendarMonth],
  );

  const onCalendarDayPress = useCallback(
    (ymd: string) => {
      const list = byYmd[ymd];
      if (list && list.length > 0) {
        setDayDetailYmd(ymd);
      }
    },
    [byYmd],
  );

  const closeAddSheet = useCallback(() => {
    setAddSheetVisible(false);
    clearFormError();
    setHoldingName('');
    setActivityDay('');
  }, [clearFormError]);

  const openAddSheet = useCallback(() => {
    clearFormError();
    setHoldingName('');
    setActivityDay('');
    setAddSheetVisible(true);
  }, [clearFormError]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Investments',
      headerTitleAlign: 'center',
      headerRight: isReady
        ? () => (
            <Pressable
              testID="investment-hub-header-add"
              accessibilityRole="button"
              accessibilityLabel="Add investment"
              onPress={openAddSheet}
              style={({ pressed }) => [modalStyles.headerAddButton, pressed && modalStyles.headerAddButtonPressed]}
            >
              <View style={modalStyles.headerAddInner}>
                <Ionicons name="add-circle-outline" size={22} color="#e36a43" />
                <Text style={modalStyles.headerAddLabel}>Add</Text>
              </View>
            </Pressable>
          )
        : () => null,
    });
  }, [navigation, isReady, openAddSheet]);

  async function handleAdd() {
    clearFormError();
    const ok = await addHolding(holdingName, activityDay);
    if (ok) {
      closeAddSheet();
    }
  }

  const dayDetailEntries: MonthlyKeyedEntry[] =
    dayDetailYmd !== null ? (byYmd[dayDetailYmd] ?? []) : [];

  if (!isReady) {
    return (
      <View style={modalStyles.centered} testID="screen-investment-hub">
        <ActivityIndicator size="large" color="#e36a43" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} testID="screen-investment-hub">
      <FinanceHubLayout
        screenTestId="screen-investment-hub-inner"
        caption="Track holdings and the day of the month you usually contribute or review (SIP, PPF, etc.). The calendar marks that day each month."
        trackedLabel="Holdings tracked"
        count={holdings.length}
        summaryHint={
          holdings.length === 0
            ? 'Tap for list — use Add to add a holding'
            : `${formatHoldingCountLabel(holdings.length)} · tap for full list`}
        summaryAccessibilityLabel={
          holdings.length === 0
            ? 'No holdings yet. Tap to view the full list.'
            : holdings.length === 1
              ? '1 holding tracked. Tap to view the full list.'
              : `${holdings.length} holdings tracked. Tap to view the full list.`
        }
        summaryCountTestId="investment-hub-count-value"
        calendarSectionTitle="Activity calendar"
        calendarSectionHint="Dots mark your chosen activity day for each holding in this month."
        calendarTestId="investment-hub-calendar-frame"
        currentMonthYmd={calendarCurrentYmd}
        onPressSummary={() => setListModalVisible(true)}
        markedDates={markedDates}
        onMonthChange={({ year, month }) => {
          setCalendarMonth(new Date(year, month - 1, 1));
        }}
        onCalendarDayPress={onCalendarDayPress}
      />

      <Modal
        visible={addSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAddSheet}
      >
        <View style={modalStyles.addSheetRoot}>
          <Pressable
            testID="investment-add-sheet-backdrop"
            accessibilityLabel="Dismiss add holding"
            style={modalStyles.addSheetBackdrop}
            onPress={closeAddSheet}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={modalStyles.addSheetKeyboard}
            pointerEvents="box-none"
          >
            <View
              style={[modalStyles.addSheetPanel, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
              testID="investment-add-sheet"
            >
              <View style={modalStyles.addSheetHandle} />
              <View style={modalStyles.addSheetTitleRow}>
                <Text style={modalStyles.addSheetTitle}>New holding</Text>
                <Pressable
                  testID="investment-add-sheet-close"
                  accessibilityRole="button"
                  accessibilityLabel="Close add holding"
                  onPress={closeAddSheet}
                  style={({ pressed }) => [modalStyles.addSheetCloseBtn, pressed && modalStyles.addSheetCloseBtnPressed]}
                >
                  <Text style={modalStyles.addSheetCloseLabel}>✕</Text>
                </Pressable>
              </View>
              <Text style={modalStyles.addSheetHint}>
                Name the holding and the day of the month you want to remember (1–31), e.g. SIP debit day.
              </Text>
              <Text style={modalStyles.label}>Holding name</Text>
              <TextInput
                testID="investment-holding-name-input"
                style={modalStyles.input}
                placeholder="e.g. Nifty index fund"
                placeholderTextColor="#9ca3af"
                value={holdingName}
                onChangeText={setHoldingName}
                autoCapitalize="words"
                returnKeyType="next"
              />
              <Text style={modalStyles.label}>Activity day of month</Text>
              <TextInput
                testID="investment-activity-day-input"
                style={modalStyles.inputDay}
                placeholder="1–31"
                placeholderTextColor="#9ca3af"
                value={activityDay}
                onChangeText={setActivityDay}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={() => void handleAdd()}
              />
              {formError ? (
                <Text testID="investment-form-error" style={modalStyles.error}>
                  {formError}
                </Text>
              ) : null}
              <Pressable
                testID="investment-add-button"
                disabled={isSaving}
                style={({ pressed }) => [
                  modalStyles.addButton,
                  (pressed || isSaving) && modalStyles.addButtonPressed,
                ]}
                onPress={() => void handleAdd()}
              >
                <Text style={modalStyles.addButtonLabel}>{isSaving ? 'Saving…' : 'Add holding'}</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={listModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setListModalVisible(false)}
      >
        <View style={modalStyles.modalBackdrop}>
          <View style={modalStyles.modalCard} testID="investment-all-list-modal">
            <Text style={modalStyles.modalTitle}>Your holdings</Text>
            <Text style={modalStyles.dayDetailSubtitle}>{formatHoldingCountLabel(holdings.length)}</Text>
            {holdingsSorted.length === 0 ? (
              <Text style={modalStyles.allListEmpty}>
                No holdings yet. Tap Add in the header to add one.
              </Text>
            ) : (
              <ScrollView style={modalStyles.dayDetailList} keyboardShouldPersistTaps="handled">
                {holdingsSorted.map((h) => (
                  <View key={h.id} style={modalStyles.dayDetailRow} testID={`investment-all-list-row-${h.id}`}>
                    <Text style={modalStyles.dayDetailName} numberOfLines={2}>
                      {h.holdingName}
                    </Text>
                    <Text style={modalStyles.dayDetailMeta}>Activity day: {h.activityDay}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <Pressable
              testID="investment-all-list-close"
              style={({ pressed }) => [modalStyles.modalBtn, modalStyles.modalCloseBtn, pressed && modalStyles.modalBtnPressed]}
              onPress={() => setListModalVisible(false)}
            >
              <Text style={modalStyles.modalCloseBtnText}>Close</Text>
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
        <View style={modalStyles.modalBackdrop}>
          <View style={modalStyles.modalCard} testID="investment-day-detail-modal">
            <Text style={modalStyles.modalTitle}>
              {dayDetailYmd
                ? formatExpenseDateDisplay(parseExpenseDateYmd(dayDetailYmd) ?? new Date())
                : ''}
            </Text>
            <Text style={modalStyles.dayDetailSubtitle}>Holdings on this activity day</Text>
            <ScrollView style={modalStyles.dayDetailList} keyboardShouldPersistTaps="handled">
              {dayDetailEntries.map((e) => (
                <View key={e.id} style={modalStyles.dayDetailRow} testID={`investment-day-detail-${e.id}`}>
                  <Text style={modalStyles.dayDetailName} numberOfLines={2}>
                    {e.name}
                  </Text>
                  <Text style={modalStyles.dayDetailMeta}>Activity day: {e.dayOfMonth}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable
              testID="investment-day-detail-close"
              style={({ pressed }) => [modalStyles.modalBtn, modalStyles.modalCloseBtn, pressed && modalStyles.modalBtnPressed]}
              onPress={() => setDayDetailYmd(null)}
            >
              <Text style={modalStyles.modalCloseBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
