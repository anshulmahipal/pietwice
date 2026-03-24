import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { formatCalendarDayAmountOnly } from '../../houseExpense/expenseCalendarLogic';
import {
  aggregateDashboardTotals,
  categoryTitleKey,
  formatUsedPendingLabel,
  parseAmount,
  progressSegmentLengths,
  usedPercentLabel,
} from '../../houseExpense/expenseDashboardLogic';
import type { ExpenseLineItemRow } from '../../expenseCategories/expenseCategoryDb';
import {
  formatExpenseDateDisplay,
  parseExpenseDateYmd,
  toExpenseDateYmd,
} from '../../houseExpense/expenseDate';
import { useExpenseCalendarMonth } from '../../houseExpense/useExpenseCalendarMonth';
import { useHouseExpenseDashboard } from '../../houseExpense/useHouseExpenseDashboard';
import type { HouseExpenseStackParamList } from '../../navigation/houseExpenseStackTypes';

type HouseHomeNav = NativeStackNavigationProp<HouseExpenseStackParamList, 'HouseExpenseHome'>;

export default function HouseExpenseScreen() {
  const navigation = useNavigation<HouseHomeNav>();
  const { rows, isReady, refresh } = useHouseExpenseDashboard();
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const { dayTotals, reloadDayTotals, loadLinesForDay } = useExpenseCalendarMonth(calendarMonth);
  const [dayDetailYmd, setDayDetailYmd] = useState<string | null>(null);
  const [dayDetailLines, setDayDetailLines] = useState<ExpenseLineItemRow[]>([]);
  const [dayDetailLoading, setDayDetailLoading] = useState(false);

  const titleByKey = useMemo(() => {
    const m: Record<string, string> = {};
    for (const r of rows) {
      m[categoryTitleKey(r.title)] = r.title;
    }
    return m;
  }, [rows]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void reloadDayTotals();
    }, [refresh, reloadDayTotals]),
  );

  const totals = useMemo(() => aggregateDashboardTotals(rows), [rows]);
  const { usedFlex: masterUsedFlex, pendingFlex: masterPendingFlex } = progressSegmentLengths(
    totals.totalBudget,
    totals.totalSpent,
  );

  const openDayExpenseDetail = useCallback(
    async (ymd: string) => {
      setDayDetailYmd(ymd);
      setDayDetailLoading(true);
      setDayDetailLines([]);
      try {
        const lines = await loadLinesForDay(ymd);
        setDayDetailLines(lines);
      } finally {
        setDayDetailLoading(false);
      }
    },
    [loadLinesForDay],
  );

  const calendarCurrentYmd = useMemo(
    () => toExpenseDateYmd(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)),
    [calendarMonth],
  );

  const renderCalendarDay = useCallback(
    (props: { date?: DateData; state?: string }) => {
      const { date, state } = props;
      if (!date) {
        return <View style={styles.calDayEmpty} />;
      }
      const isDisabled = state === 'disabled';
      const total = dayTotals[date.dateString] ?? 0;
      const amountText = isDisabled ? null : formatCalendarDayAmountOnly(total);
      const a11y =
        amountText !== null
          ? `${date.dateString}, day ${date.day}, ${amountText}`
          : `${date.dateString}, day ${date.day}`;
      return (
        <Pressable
          testID={`house-expense-cal-day-${date.dateString}`}
          accessibilityLabel={a11y}
          disabled={isDisabled}
          onPress={() => void openDayExpenseDetail(date.dateString)}
          style={({ pressed }) => [
            styles.calDayCell,
            isDisabled && styles.calDayCellDisabled,
            pressed && !isDisabled && styles.calDayCellPressed,
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
          {amountText !== null ? (
            <Text style={styles.calDayAmount} numberOfLines={1}>
              {amountText}
            </Text>
          ) : null}
        </Pressable>
      );
    },
    [dayTotals, openDayExpenseDetail],
  );

  if (!isReady) {
    return (
      <View style={styles.centered} testID="screen-house-expense-loading">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.screen} testID="screen-house-expense">
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>House expense</Text>
        <Text style={styles.screenCaption}>
          Tap the combined total for categories. Tap a calendar day for entries that day.
        </Text>

        <Pressable
          testID="house-expense-combined-nav"
          accessibilityRole="button"
          accessibilityLabel="Open expense breakdown by category"
          onPress={() => navigation.navigate('HouseExpenseDetail')}
          style={({ pressed }) => [styles.combinedPressable, pressed && styles.combinedPressablePressed]}
        >
          <View style={styles.masterCard} testID="house-expense-dash-master">
            <View style={styles.cardTop}>
              <Text style={styles.masterTitle}>Combined</Text>
              <Text style={styles.cardUsedPending}>
                {formatUsedPendingLabel(totals.totalSpent, totals.totalBudget)}
              </Text>
            </View>
            <Text style={styles.masterPendingLine}>
              Pending: {totals.totalBudget > 0 ? totals.totalPending : '—'}
            </Text>
            <View style={styles.cardBottom}>
              <View style={styles.masterTrack} testID="house-expense-dash-master-progress">
                {totals.totalBudget > 0 ? (
                  <>
                    <View style={[styles.usedSegment, { flex: Math.max(masterUsedFlex, 0.001) }]} />
                    <View style={[styles.pendingSegment, { flex: Math.max(masterPendingFlex, 0.001) }]} />
                  </>
                ) : (
                  <View style={styles.noBudgetTrack} />
                )}
              </View>
              <Text style={styles.percentText}>
                {usedPercentLabel(totals.totalBudget, totals.totalSpent)}
              </Text>
            </View>
            <Text style={styles.combinedHint}>Tap for category details →</Text>
          </View>
        </Pressable>

        <View style={styles.calendarWrap}>
          <View style={styles.calendarFrame} testID="house-expense-calendar">
            <Text style={styles.calendarSectionTitle}>Expense calendar</Text>
            <Text style={styles.calendarSectionHint}>Tap a date to see entries for that day.</Text>
            <Calendar
              current={calendarCurrentYmd}
              onMonthChange={(m: DateData) => {
                setCalendarMonth(new Date(m.year, m.month - 1, 1));
              }}
              hideExtraDays
              enableSwipeMonths
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: '#6b7280',
                monthTextColor: '#111827',
                textMonthFontWeight: '600',
                arrowColor: '#2563eb',
                todayTextColor: '#2563eb',
              }}
              dayComponent={renderCalendarDay}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={dayDetailYmd !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDayDetailYmd(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="house-expense-day-detail-modal">
            <Text style={styles.modalTitle}>
              {dayDetailYmd
                ? formatExpenseDateDisplay(parseExpenseDateYmd(dayDetailYmd) ?? new Date())
                : ''}
            </Text>
            <Text style={styles.dayDetailSubtitle}>Expenses logged for this day</Text>
            {dayDetailLoading ? (
              <ActivityIndicator style={styles.dayDetailSpinner} color="#2563eb" />
            ) : dayDetailLines.length === 0 ? (
              <Text style={styles.dayDetailEmpty}>No expense entries for this day.</Text>
            ) : (
              <ScrollView style={styles.dayDetailList} keyboardShouldPersistTaps="handled">
                {dayDetailLines.map((line) => {
                  const label = titleByKey[line.titleKey] ?? line.titleKey;
                  const amt = parseAmount(line.amount);
                  const amtLabel = Number.isInteger(amt) ? String(amt) : amt.toFixed(2);
                  return (
                    <View key={line.id} style={styles.dayDetailRow} testID={`house-expense-day-line-${line.id}`}>
                      <Text style={styles.dayDetailCategory} numberOfLines={1}>
                        {label}
                      </Text>
                      <Text style={styles.dayDetailAmount}>{amtLabel}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <Pressable
              testID="house-expense-day-detail-close"
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
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  screenCaption: {
    marginTop: 6,
    fontSize: 15,
    color: '#6b7280',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  combinedPressable: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  combinedPressablePressed: {
    opacity: 0.92,
  },
  combinedHint: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'center',
  },
  calendarWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  calendarFrame: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  calendarSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  calendarSectionHint: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  calDayEmpty: {
    flex: 1,
    minHeight: 52,
  },
  calDayCell: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingHorizontal: 1,
    marginVertical: 2,
    borderRadius: 6,
  },
  calDayCellDisabled: {
    opacity: 0.4,
  },
  calDayCellPressed: {
    backgroundColor: '#f3f4f6',
  },
  calDayNum: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  calDayNumDisabled: {
    color: '#9ca3af',
  },
  calDayToday: {
    color: '#2563eb',
  },
  calDayAmount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
    marginTop: 2,
    textAlign: 'center',
    maxWidth: '100%',
  },
  masterCard: {
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#eff6ff',
  },
  masterTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  masterPendingLine: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 10,
  },
  masterTrack: {
    flex: 1,
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardUsedPending: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
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
  dayDetailSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  dayDetailSpinner: {
    marginVertical: 16,
  },
  dayDetailEmpty: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 16,
  },
  dayDetailList: {
    maxHeight: 280,
    marginBottom: 12,
  },
  dayDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  dayDetailCategory: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  dayDetailAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  modalBtnPressed: {
    opacity: 0.85,
  },
  modalCloseBtn: {
    backgroundColor: '#2563eb',
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
