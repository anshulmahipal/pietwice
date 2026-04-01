import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FinanceHubLayout } from '../../financeHub/FinanceHubLayout';
import { toExpenseDateYmd } from '../../houseExpense/expenseDate';
import type { ProfileStackParamList } from '../../navigation/profileStackTypes';

export function InsuranceHubScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'InsuranceHub'>>();
  const [count] = useState(0);

  const calendarMonthYmd = useMemo(() => {
    const d = new Date();
    return toExpenseDateYmd(new Date(d.getFullYear(), d.getMonth(), 1));
  }, []);

  const openAdd = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'You will be able to add insurance policies here in a future update.',
    );
  }, []);

  const openSummary = useCallback(() => {
    Alert.alert(
      count === 0 ? 'No policies yet' : 'List',
      count === 0
        ? 'Nothing to list. Use Add in the header when adding policies is available.'
        : 'A detailed list view will be available in a future update.',
    );
  }, [count]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Insurance',
      headerTitleAlign: 'center',
      headerRight: () => (
        <Pressable
          testID="insurance-hub-header-add"
          accessibilityRole="button"
          accessibilityLabel="Add insurance policy"
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
      screenTestId="screen-insurance-hub"
      caption="Same entry layout as credit cards: registered count, then a calendar for premiums, renewals, and other dates."
      trackedLabel="Policies tracked"
      count={count}
      summaryHint={
        count === 0
          ? 'Tap for list — use Add to add a policy when available'
          : `${count} ${count === 1 ? 'policy' : 'policies'} · tap for full list`}
      summaryAccessibilityLabel={`${count} policies tracked. Tap to view the full list.`}
      summaryCountTestId="insurance-hub-count-value"
      calendarSectionTitle="Due date calendar"
      calendarSectionHint="Premium due dates and renewals will appear on highlighted days, similar to card bill dates."
      calendarTestId="insurance-hub-calendar-frame"
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
