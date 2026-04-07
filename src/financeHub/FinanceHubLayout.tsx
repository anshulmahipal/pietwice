import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { financeCalendarTheme } from '../ui/financeTheme';

export type FinanceHubMarkedDate = {
  marked?: boolean;
  dotColor?: string;
};

export type FinanceHubLayoutProps = {
  screenTestId: string;
  caption: string;
  trackedLabel: string;
  count: number;
  summaryHint: string;
  summaryAccessibilityLabel: string;
  summaryCountTestId: string;
  calendarSectionTitle: string;
  calendarSectionHint: string;
  calendarTestId: string;
  currentMonthYmd: string;
  onPressSummary: () => void;
  /** When set, calendar highlights days (e.g. recurring activity / renewal days). */
  markedDates?: Record<string, FinanceHubMarkedDate>;
  /** Fires when the user swipes to another month (month is 1–12). */
  onMonthChange?: (next: { year: number; month: number }) => void;
  /** Fires when a day cell is pressed (parent decides whether to show detail). */
  onCalendarDayPress?: (dateString: string) => void;
};

export function FinanceHubLayout({
  screenTestId,
  caption,
  trackedLabel,
  count,
  summaryHint,
  summaryAccessibilityLabel,
  summaryCountTestId,
  calendarSectionTitle,
  calendarSectionHint,
  calendarTestId,
  currentMonthYmd,
  onPressSummary,
  markedDates,
  onMonthChange,
  onCalendarDayPress,
}: FinanceHubLayoutProps) {
  return (
    <View style={styles.screen} testID={screenTestId}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenCaption}>{caption}</Text>

        <View style={styles.calendarWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={summaryAccessibilityLabel}
            onPress={onPressSummary}
            style={({ pressed }) => [styles.cardCountSummary, pressed && styles.cardCountSummaryPressed]}
          >
            <Text style={styles.cardCountSummaryLabel}>{trackedLabel}</Text>
            <Text testID={summaryCountTestId} style={styles.cardCountSummaryNumber}>
              {count}
            </Text>
            <Text style={styles.cardCountSummaryHint}>{summaryHint}</Text>
          </Pressable>

          <View style={styles.calendarFrame} testID={calendarTestId}>
            <Text style={styles.calendarSectionTitle}>{calendarSectionTitle}</Text>
            <Text style={styles.calendarSectionHint}>{calendarSectionHint}</Text>
            <Calendar
              current={currentMonthYmd}
              hideExtraDays
              enableSwipeMonths
              markedDates={markedDates}
              onMonthChange={
                onMonthChange
                  ? (m: DateData) => {
                      onMonthChange({ year: m.year, month: m.month });
                    }
                  : undefined
              }
              onDayPress={
                onCalendarDayPress
                  ? (d: DateData) => {
                      onCalendarDayPress(d.dateString);
                    }
                  : undefined
              }
              theme={financeCalendarTheme}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  screenCaption: {
    marginTop: 16,
    fontSize: 15,
    color: '#6b7280',
    paddingHorizontal: 20,
    marginBottom: 12,
    lineHeight: 22,
  },
  calendarWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 12,
  },
  cardCountSummary: {
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#eff6ff',
  },
  cardCountSummaryPressed: {
    opacity: 0.92,
  },
  cardCountSummaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  cardCountSummaryNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 6,
  },
  cardCountSummaryHint: {
    fontSize: 13,
    color: '#3730a3',
    lineHeight: 18,
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
});
