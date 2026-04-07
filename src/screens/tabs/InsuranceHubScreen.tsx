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
import { useInsurancePolicies } from '../../insurancePolicies/useInsurancePolicies';
import { formatPolicyCountLabel } from '../../insurancePolicies/insurancePolicyLogic';
import {
  formatExpenseDateDisplay,
  parseExpenseDateYmd,
  toExpenseDateYmd,
} from '../../houseExpense/expenseDate';
import type { ProfileStackParamList } from '../../navigation/profileStackTypes';

export function InsuranceHubScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'InsuranceHub'>>();
  const insets = useSafeAreaInsets();
  const { policies, isReady, isSaving, formError, addPolicy, clearFormError } = useInsurancePolicies();

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [policyName, setPolicyName] = useState('');
  const [renewalDay, setRenewalDay] = useState('');
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [dayDetailYmd, setDayDetailYmd] = useState<string | null>(null);

  const policiesSorted = useMemo(
    () => [...policies].sort((a, b) => a.policyName.localeCompare(b.policyName)),
    [policies],
  );

  const calendarEntries: MonthlyKeyedEntry[] = useMemo(
    () =>
      policies.map((p) => ({
        id: p.id,
        name: p.policyName,
        dayOfMonth: p.renewalDay,
      })),
    [policies],
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
    setPolicyName('');
    setRenewalDay('');
  }, [clearFormError]);

  const openAddSheet = useCallback(() => {
    clearFormError();
    setPolicyName('');
    setRenewalDay('');
    setAddSheetVisible(true);
  }, [clearFormError]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Insurance',
      headerTitleAlign: 'center',
      headerRight: isReady
        ? () => (
            <Pressable
              testID="insurance-hub-header-add"
              accessibilityRole="button"
              accessibilityLabel="Add insurance policy"
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
    const ok = await addPolicy(policyName, renewalDay);
    if (ok) {
      closeAddSheet();
    }
  }

  const dayDetailEntries: MonthlyKeyedEntry[] =
    dayDetailYmd !== null ? (byYmd[dayDetailYmd] ?? []) : [];

  if (!isReady) {
    return (
      <View style={modalStyles.centered} testID="screen-insurance-hub">
        <ActivityIndicator size="large" color="#e36a43" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} testID="screen-insurance-hub">
      <FinanceHubLayout
        screenTestId="screen-insurance-hub-inner"
        caption="Save each policy once and pick a monthly reminder day (premium due, renewal review, etc.). Dots show that day on the calendar."
        trackedLabel="Policies tracked"
        count={policies.length}
        summaryHint={
          policies.length === 0
            ? 'Tap for list — use Add to add a policy'
            : `${formatPolicyCountLabel(policies.length)} · tap for full list`}
        summaryAccessibilityLabel={
          policies.length === 0
            ? 'No policies yet. Tap to view the full list.'
            : policies.length === 1
              ? '1 policy tracked. Tap to view the full list.'
              : `${policies.length} policies tracked. Tap to view the full list.`
        }
        summaryCountTestId="insurance-hub-count-value"
        calendarSectionTitle="Due date calendar"
        calendarSectionHint="Highlighted days match the renewal or reminder day you set for each policy."
        calendarTestId="insurance-hub-calendar-frame"
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
            testID="insurance-add-sheet-backdrop"
            accessibilityLabel="Dismiss add policy"
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
              testID="insurance-add-sheet"
            >
              <View style={modalStyles.addSheetHandle} />
              <View style={modalStyles.addSheetTitleRow}>
                <Text style={modalStyles.addSheetTitle}>New policy</Text>
                <Pressable
                  testID="insurance-add-sheet-close"
                  accessibilityRole="button"
                  accessibilityLabel="Close add policy"
                  onPress={closeAddSheet}
                  style={({ pressed }) => [modalStyles.addSheetCloseBtn, pressed && modalStyles.addSheetCloseBtnPressed]}
                >
                  <Text style={modalStyles.addSheetCloseLabel}>✕</Text>
                </Pressable>
              </View>
              <Text style={modalStyles.addSheetHint}>
                Policy name and the day of the month you want to remember for premium or renewal (1–31).
              </Text>
              <Text style={modalStyles.label}>Policy name</Text>
              <TextInput
                testID="insurance-policy-name-input"
                style={modalStyles.input}
                placeholder="e.g. Family health"
                placeholderTextColor="#9ca3af"
                value={policyName}
                onChangeText={setPolicyName}
                autoCapitalize="words"
                returnKeyType="next"
              />
              <Text style={modalStyles.label}>Reminder day of month</Text>
              <TextInput
                testID="insurance-renewal-day-input"
                style={modalStyles.inputDay}
                placeholder="1–31"
                placeholderTextColor="#9ca3af"
                value={renewalDay}
                onChangeText={setRenewalDay}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={() => void handleAdd()}
              />
              {formError ? (
                <Text testID="insurance-form-error" style={modalStyles.error}>
                  {formError}
                </Text>
              ) : null}
              <Pressable
                testID="insurance-add-button"
                disabled={isSaving}
                style={({ pressed }) => [
                  modalStyles.addButton,
                  (pressed || isSaving) && modalStyles.addButtonPressed,
                ]}
                onPress={() => void handleAdd()}
              >
                <Text style={modalStyles.addButtonLabel}>{isSaving ? 'Saving…' : 'Add policy'}</Text>
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
          <View style={modalStyles.modalCard} testID="insurance-all-list-modal">
            <Text style={modalStyles.modalTitle}>Your policies</Text>
            <Text style={modalStyles.dayDetailSubtitle}>{formatPolicyCountLabel(policies.length)}</Text>
            {policiesSorted.length === 0 ? (
              <Text style={modalStyles.allListEmpty}>
                No policies yet. Tap Add in the header to add one.
              </Text>
            ) : (
              <ScrollView style={modalStyles.dayDetailList} keyboardShouldPersistTaps="handled">
                {policiesSorted.map((p) => (
                  <View key={p.id} style={modalStyles.dayDetailRow} testID={`insurance-all-list-row-${p.id}`}>
                    <Text style={modalStyles.dayDetailName} numberOfLines={2}>
                      {p.policyName}
                    </Text>
                    <Text style={modalStyles.dayDetailMeta}>Reminder day: {p.renewalDay}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <Pressable
              testID="insurance-all-list-close"
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
          <View style={modalStyles.modalCard} testID="insurance-day-detail-modal">
            <Text style={modalStyles.modalTitle}>
              {dayDetailYmd
                ? formatExpenseDateDisplay(parseExpenseDateYmd(dayDetailYmd) ?? new Date())
                : ''}
            </Text>
            <Text style={modalStyles.dayDetailSubtitle}>Policies on this reminder day</Text>
            <ScrollView style={modalStyles.dayDetailList} keyboardShouldPersistTaps="handled">
              {dayDetailEntries.map((e) => (
                <View key={e.id} style={modalStyles.dayDetailRow} testID={`insurance-day-detail-${e.id}`}>
                  <Text style={modalStyles.dayDetailName} numberOfLines={2}>
                    {e.name}
                  </Text>
                  <Text style={modalStyles.dayDetailMeta}>Reminder day: {e.dayOfMonth}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable
              testID="insurance-day-detail-close"
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
