import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useHouseholdIncomeSummary } from '../../householdIncome/useHouseholdIncome';
import { useHouseExpenseDashboard } from '../../houseExpense/useHouseExpenseDashboard';
import { formatInr } from '../../localization/indiaFormat';
import { financeCalendarTheme, financeColors, financeShadow } from '../../ui/financeTheme';

export default function HouseExpenseScreen() {
  const navigation = useNavigation<any>();
  const { rows, isReady, refresh } = useHouseExpenseDashboard();
  const { data: householdIncome, ready: incomeReady, totalMonthly: householdIncomeTotal } =
    useHouseholdIncomeSummary();
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

  /** Calendar totals: mount + focus (dashboard initial load lives in `useHouseExpenseDashboard`). */
  useEffect(() => {
    void reloadDayTotals();
  }, [reloadDayTotals]);

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
  const trackedCategoriesCount = rows.length;
  const overLimitCount = useMemo(
    () => rows.filter((row) => parseAmount(row.amount) > 0 && parseAmount(row.spent) > parseAmount(row.amount)).length,
    [rows],
  );
  const uncappedCount = useMemo(
    () => rows.filter((row) => parseAmount(row.amount) <= 0).length,
    [rows],
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
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Monthly snapshot</Text>
          <Text style={styles.screenTitle}>Keep this month simple and under control.</Text>
          <Text style={styles.screenCaption}>
            Start here to review spending, jump into the next task, and check daily entries without digging through menus.
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Spent</Text>
              <Text style={styles.heroStatValue}>{formatInr(totals.totalSpent)}</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Left</Text>
              <Text style={styles.heroStatValue}>{formatInr(totals.totalPending)}</Text>
            </View>
          </View>
          {incomeReady && householdIncome ? (
            <View style={styles.heroIncomeRow} testID="house-expense-hero-household-income">
              <Text style={styles.heroIncomeLabel}>Household income (monthly)</Text>
              <Text style={styles.heroIncomeValue}>{formatInr(householdIncomeTotal)}</Text>
              <Text style={styles.heroIncomeHint}>
                Husband {formatInr(parseAmount(householdIncome.husbandIncome))} · Wife{' '}
                {formatInr(parseAmount(householdIncome.wifeIncome))}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.quickActionGrid}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open expense breakdown by category"
              onPress={() => navigation.navigate('HouseExpenseDetail')}
              style={({ pressed }) => [styles.quickActionCard, pressed && styles.quickActionPressed]}
            >
              <View style={[styles.quickActionIconWrap, styles.quickActionAccent]}>
                <Ionicons name="list-outline" size={18} color={financeColors.accentStrong} />
              </View>
              <Text style={styles.quickActionTitle}>Categories</Text>
              <Text style={styles.quickActionHint}>Review spending by category</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Bills tab"
              onPress={() => navigation.navigate('Bills')}
              style={({ pressed }) => [styles.quickActionCard, pressed && styles.quickActionPressed]}
            >
              <View style={[styles.quickActionIconWrap, styles.quickActionBlue]}>
                <Ionicons name="receipt-outline" size={18} color={financeColors.blue} />
              </View>
              <Text style={styles.quickActionTitle}>Bills</Text>
              <Text style={styles.quickActionHint}>See what is due next</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Budget tab"
              onPress={() => navigation.navigate('Budget')}
              style={({ pressed }) => [styles.quickActionCard, pressed && styles.quickActionPressed]}
            >
              <View style={[styles.quickActionIconWrap, styles.quickActionGold]}>
                <Ionicons name="pie-chart-outline" size={18} color={financeColors.accentStrong} />
              </View>
              <Text style={styles.quickActionTitle}>Budget</Text>
              <Text style={styles.quickActionHint}>Adjust limits quickly</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Cards tab"
              onPress={() => navigation.navigate('Cards')}
              style={({ pressed }) => [styles.quickActionCard, pressed && styles.quickActionPressed]}
            >
              <View style={[styles.quickActionIconWrap, styles.quickActionGreen]}>
                <Ionicons name="card-outline" size={18} color={financeColors.green} />
              </View>
              <Text style={styles.quickActionTitle}>Cards</Text>
              <Text style={styles.quickActionHint}>Track card bill days</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Tracked categories</Text>
              <Text style={styles.overviewValue}>{trackedCategoriesCount}</Text>
              <Text style={styles.overviewHint}>
                {uncappedCount === 0 ? 'Every category has a budget.' : `${uncappedCount} without a budget`}
              </Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Attention needed</Text>
              <Text style={styles.overviewValue}>{overLimitCount}</Text>
              <Text style={styles.overviewHint}>
                {overLimitCount === 0 ? 'No categories over budget.' : 'Categories already above limit'}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          testID="house-expense-combined-nav"
          accessibilityRole="button"
          accessibilityLabel="Open expense breakdown by category"
          onPress={() => navigation.navigate('HouseExpenseDetail')}
          style={({ pressed }) => [styles.combinedPressable, pressed && styles.combinedPressablePressed]}
        >
          <View style={styles.masterCard} testID="house-expense-dash-master">
            <View style={styles.cardTop}>
              <Text style={styles.masterTitle}>Monthly spend plan</Text>
              <Text style={styles.cardUsedPending}>
                {formatInr(totals.totalSpent)} / {totals.totalBudget > 0 ? formatInr(totals.totalBudget) : '—'}
              </Text>
            </View>
            <Text style={styles.masterPendingLine}>
              {totals.totalBudget > 0
                ? `${usedPercentLabel(totals.totalBudget, totals.totalSpent)} used · ${formatInr(totals.totalPending)} left`
                : `No total budget set yet · Spent ${formatInr(totals.totalSpent)}`}
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
            <Text style={styles.combinedHint}>Open category detail to update and review spending</Text>
          </View>
        </Pressable>

        <View style={styles.calendarWrap}>
          <View style={styles.calendarFrame} testID="house-expense-calendar">
            <Text style={styles.calendarSectionTitle}>Daily calendar</Text>
            <Text style={styles.calendarSectionHint}>Tap a date to see the entries saved for that day.</Text>
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
    marginBottom: 14,
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
  screenTitle: {
    marginTop: 8,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: financeColors.text,
  },
  screenCaption: {
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
    fontSize: 13,
    fontWeight: '700',
    color: financeColors.textMuted,
  },
  heroStatValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
    color: financeColors.text,
  },
  heroIncomeRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: financeColors.border,
  },
  heroIncomeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: financeColors.textMuted,
  },
  heroIncomeValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    color: financeColors.text,
  },
  heroIncomeHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: financeColors.textMuted,
  },
  sectionWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 17,
    fontWeight: '700',
    color: financeColors.text,
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionCard: {
    width: '48.5%',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: financeColors.border,
    backgroundColor: financeColors.surfaceStrong,
  },
  quickActionPressed: {
    backgroundColor: financeColors.surface,
  },
  quickActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionAccent: {
    backgroundColor: financeColors.accentSoft,
  },
  quickActionBlue: {
    backgroundColor: financeColors.blueSoft,
  },
  quickActionGold: {
    backgroundColor: financeColors.goldSoft,
  },
  quickActionGreen: {
    backgroundColor: financeColors.greenSoft,
  },
  quickActionTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: financeColors.text,
  },
  quickActionHint: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: financeColors.textMuted,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 10,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: financeColors.surfaceStrong,
    borderWidth: 1,
    borderColor: financeColors.border,
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
  combinedPressable: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  combinedPressablePressed: {
    opacity: 0.92,
  },
  combinedHint: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#fff4ee',
  },
  calendarWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
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
    fontWeight: '600',
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
    backgroundColor: financeColors.goldSoft,
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
  calDayAmount: {
    fontSize: 10,
    fontWeight: '700',
    color: financeColors.green,
    marginTop: 2,
    textAlign: 'center',
    maxWidth: '100%',
  },
  masterCard: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 24,
    padding: 18,
    backgroundColor: financeColors.accent,
  },
  masterTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  masterPendingLine: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff0e8',
    marginBottom: 10,
  },
  masterTrack: {
    flex: 1,
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#f3b49f',
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
    color: '#fff4ee',
  },
  usedSegment: {
    backgroundColor: '#7f2317',
    minWidth: 0,
  },
  pendingSegment: {
    backgroundColor: '#ffd4bf',
    minWidth: 0,
  },
  noBudgetTrack: {
    flex: 1,
    backgroundColor: '#f3b49f',
  },
  percentText: {
    minWidth: 40,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'right',
  },
  dayDetailSubtitle: {
    fontSize: 14,
    color: financeColors.textMuted,
    marginBottom: 12,
  },
  dayDetailSpinner: {
    marginVertical: 16,
  },
  dayDetailEmpty: {
    fontSize: 15,
    color: financeColors.textMuted,
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
    borderBottomColor: financeColors.border,
    gap: 12,
  },
  dayDetailCategory: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: financeColors.text,
  },
  dayDetailAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: financeColors.text,
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#fff',
  },
});
