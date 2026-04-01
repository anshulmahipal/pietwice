import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FinanceHubLayout } from '../../financeHub/FinanceHubLayout';
import { toExpenseDateYmd } from '../../houseExpense/expenseDate';
import type { ProfileStackParamList } from '../../navigation/profileStackTypes';

export function InvestmentHubScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'InvestmentHub'>>();
  const [count] = useState(0);

  const calendarMonthYmd = useMemo(() => {
    const d = new Date();
    return toExpenseDateYmd(new Date(d.getFullYear(), d.getMonth(), 1));
  }, []);

  const openAdd = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'You will be able to add investments here in a future update.',
    );
  }, []);

  const openSummary = useCallback(() => {
    Alert.alert(
      count === 0 ? 'No investments yet' : 'List',
      count === 0
        ? 'Nothing to list. Use Add in the header when adding investments is available.'
        : 'A detailed list view will be available in a future update.',
    );
  }, [count]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Investments',
      headerTitleAlign: 'center',
      headerRight: () => (
        <Pressable
          testID="investment-hub-header-add"
          accessibilityRole="button"
          accessibilityLabel="Add investment"
          onPress={openAdd}
          style={({ pressed }) => [styles.headerAddButton, pressed && styles.headerAddButtonPressed]}
        >
          <View style={styles.headerAddInner}>
            <Ionicons name="add-circle-outline" size={22} color="#2563eb" />
            <Text style={styles.headerAddLabel}>Add</Text>
          </View>
        </Pressable>
      ),
    });
  }, [navigation, openAdd]);

  return (
    <FinanceHubLayout
      screenTestId="screen-investment-hub"
      caption="Summary and calendar follow the same layout as credit cards. Holdings and key dates will appear here once you add data."
      trackedLabel="Holdings tracked"
      count={count}
      summaryHint={
        count === 0
          ? 'Tap for list — use Add to add a holding when available'
          : `${count} holding${count === 1 ? '' : 's'} · tap for full list`}
      summaryAccessibilityLabel={`${count} holdings tracked. Tap to view the full list.`}
      summaryCountTestId="investment-hub-count-value"
      calendarSectionTitle="Activity calendar"
      calendarSectionHint="Contribution dates, dividends, and other milestones will highlight on the calendar."
      calendarTestId="investment-hub-calendar-frame"
      currentMonthYmd={calendarMonthYmd}
      onPressSummary={openSummary}
    />
  );
}

const styles = StyleSheet.create({
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
    color: '#2563eb',
    fontWeight: '600',
  },
});
