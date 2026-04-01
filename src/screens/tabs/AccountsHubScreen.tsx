import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { accountTypeLabel, entryKindLabel, type AccountType, type LedgerEntryKind } from '../../accounts/accountLogic';
import { useAccountsLedger } from '../../accounts/useAccountsLedger';
import { formatExpenseDateDisplay } from '../../houseExpense/expenseDate';
import { formatInr } from '../../localization/indiaFormat';
import type { ProfileStackParamList } from '../../navigation/profileStackTypes';
import { financeColors, financeShadow } from '../../ui/financeTheme';

type AccountsNav = NativeStackNavigationProp<ProfileStackParamList, 'AccountsHub'>;

export function AccountsHubScreen() {
  const navigation = useNavigation<AccountsNav>();
  const {
    accounts,
    recentEntries,
    monthlyIncome,
    monthlyExpense,
    totalBalance,
    isReady,
    isSaving,
    formError,
    addAccount,
    addEntry,
    reload,
    clearFormError,
  } = useAccountsLedger();

  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [entryModalVisible, setEntryModalVisible] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [openingBalance, setOpeningBalance] = useState('');
  const [entryAccountId, setEntryAccountId] = useState<number | null>(null);
  const [entryKind, setEntryKind] = useState<LedgerEntryKind>('expense');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNote, setEntryNote] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date());

  const netCashflow = monthlyIncome - monthlyExpense;

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Accounts',
      headerTitleAlign: 'center',
      headerRight: () => (
        <Pressable
          testID="accounts-header-add-entry"
          accessibilityRole="button"
          accessibilityLabel="Add account entry"
          onPress={() => {
            clearFormError();
            setEntryAccountId(accounts[0]?.id ?? null);
            setEntryKind('expense');
            setEntryAmount('');
            setEntryNote('');
            setEntryDate(new Date());
            setEntryModalVisible(true);
          }}
          style={({ pressed }) => [styles.headerAddButton, pressed && styles.headerAddButtonPressed]}
        >
          <View style={styles.headerAddInner}>
            <Ionicons name="add-circle-outline" size={22} color="#2563eb" />
            <Text style={styles.headerAddLabel}>Entry</Text>
          </View>
        </Pressable>
      ),
    });
  }, [accounts, clearFormError, navigation]);

  const accountById = useMemo(() => {
    const map: Record<number, string> = {};
    for (const account of accounts) {
      map[account.id] = account.accountName;
    }
    return map;
  }, [accounts]);

  async function handleSaveAccount() {
    const ok = await addAccount(accountName, accountType, openingBalance);
    if (ok) {
      setAccountModalVisible(false);
      setAccountName('');
      setOpeningBalance('');
      setAccountType('bank');
    }
  }

  async function handleSaveEntry() {
    const ok = await addEntry(entryAccountId, entryKind, entryAmount, entryNote, entryDate);
    if (ok) {
      setEntryModalVisible(false);
      setEntryAmount('');
      setEntryNote('');
      setEntryDate(new Date());
    }
  }

  if (!isReady) {
    return (
      <View style={styles.centered} testID="screen-accounts-hub">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.screen} testID="screen-accounts-hub">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Accounts</Text>
          <Text style={styles.heroTitle}>Keep every wallet, bank balance, and cash movement aligned.</Text>
          <Text style={styles.caption}>
            Track account balances and ledger entries for income and expenses.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total balance</Text>
          <Text style={styles.summaryValue}>{formatInr(totalBalance)}</Text>
          <Text style={styles.summaryMeta}>
            This month · Income {formatInr(monthlyIncome)} · Expense {formatInr(monthlyExpense)} · Net {formatInr(netCashflow)}
          </Text>
        </View>

        <Pressable
          testID="accounts-add-account-open"
          accessibilityRole="button"
          accessibilityLabel="Add account"
          onPress={() => {
            clearFormError();
            setAccountName('');
            setOpeningBalance('');
            setAccountType('bank');
            setAccountModalVisible(true);
          }}
          style={({ pressed }) => [styles.addAccountBtn, pressed && styles.addAccountBtnPressed]}
        >
          <Ionicons name="wallet-outline" size={18} color="#1d4ed8" />
          <Text style={styles.addAccountText}>Add account</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Accounts</Text>
        {accounts.length === 0 ? (
          <Text style={styles.emptyText}>No accounts yet. Add your first account.</Text>
        ) : (
          <View style={styles.cardList}>
            {accounts.map((account) => (
              <View key={account.id} style={styles.accountCard} testID={`accounts-row-${account.id}`}>
                <Text style={styles.accountName}>{account.accountName}</Text>
                <Text style={styles.accountMeta}>{accountTypeLabel(account.accountType)}</Text>
                <Text style={styles.accountBalance}>{formatInr(Number(account.currentBalance) || 0)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Recent entries</Text>
        {recentEntries.length === 0 ? (
          <Text style={styles.emptyText}>No entries yet. Add an income or expense entry from the header.</Text>
        ) : (
          <View style={styles.cardList}>
            {recentEntries.map((entry) => (
              <View key={entry.id} style={styles.entryCard} testID={`account-entry-row-${entry.id}`}>
                <View style={styles.entryTop}>
                  <Text style={styles.entryTitle}>{accountById[entry.accountId] ?? entry.accountName}</Text>
                  <Text style={styles.entryAmount}>
                    {entry.entryKind === 'income' ? '+' : '-'}
                    {formatInr(Number(entry.amount) || 0)}
                  </Text>
                </View>
                <Text style={styles.entryMeta}>
                  {entryKindLabel(entry.entryKind)} · {entry.entryDate}
                </Text>
                {entry.note ? <Text style={styles.entryNote}>{entry.note}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={accountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="accounts-add-account-modal">
            <Text style={styles.modalTitle}>New account</Text>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              testID="accounts-name-input"
              style={styles.modalInput}
              placeholder="e.g. HDFC Savings"
              placeholderTextColor="#9ca3af"
              value={accountName}
              onChangeText={setAccountName}
            />
            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.chipRow}>
              {(['bank', 'cash', 'wallet', 'credit_card'] as AccountType[]).map((type) => (
                <Pressable
                  key={type}
                  testID={`accounts-type-${type}`}
                  onPress={() => setAccountType(type)}
                  style={({ pressed }) => [
                    styles.chip,
                    accountType === type && styles.chipActive,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text style={[styles.chipText, accountType === type && styles.chipTextActive]}>
                    {accountTypeLabel(type)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.modalLabel}>Opening balance</Text>
            <TextInput
              testID="accounts-opening-balance-input"
              style={styles.modalInput}
              placeholder="e.g. 10000"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              value={openingBalance}
              onChangeText={setOpeningBalance}
            />
            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                testID="accounts-add-account-cancel"
                onPress={() => setAccountModalVisible(false)}
                style={({ pressed }) => [styles.modalBtn, styles.modalCancel, pressed && styles.modalBtnPressed]}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="accounts-add-account-save"
                disabled={isSaving}
                onPress={() => void handleSaveAccount()}
                style={({ pressed }) => [styles.modalBtn, styles.modalSave, (pressed || isSaving) && styles.modalBtnPressed]}
              >
                <Text style={styles.modalSaveText}>{isSaving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={entryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEntryModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="accounts-add-entry-modal">
            <Text style={styles.modalTitle}>New entry</Text>
            <Text style={styles.modalLabel}>Account</Text>
            <View style={styles.chipRow}>
              {accounts.map((account) => (
                <Pressable
                  key={account.id}
                  testID={`accounts-entry-account-${account.id}`}
                  onPress={() => setEntryAccountId(account.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    entryAccountId === account.id && styles.chipActive,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text
                    style={[styles.chipText, entryAccountId === account.id && styles.chipTextActive]}
                    numberOfLines={1}
                  >
                    {account.accountName}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.modalLabel}>Kind</Text>
            <View style={styles.chipRow}>
              {(['income', 'expense'] as LedgerEntryKind[]).map((kind) => (
                <Pressable
                  key={kind}
                  testID={`accounts-entry-kind-${kind}`}
                  onPress={() => setEntryKind(kind)}
                  style={({ pressed }) => [
                    styles.chip,
                    entryKind === kind && styles.chipActive,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text style={[styles.chipText, entryKind === kind && styles.chipTextActive]}>
                    {entryKindLabel(kind)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              testID="accounts-entry-amount-input"
              style={styles.modalInput}
              placeholder="e.g. 2500"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              value={entryAmount}
              onChangeText={setEntryAmount}
            />
            <Text style={styles.modalLabel}>Note (optional)</Text>
            <TextInput
              testID="accounts-entry-note-input"
              style={styles.modalInput}
              placeholder="e.g. Salary credit"
              placeholderTextColor="#9ca3af"
              value={entryNote}
              onChangeText={setEntryNote}
            />
            <Text style={styles.modalDateLabel}>Date: {formatExpenseDateDisplay(entryDate)}</Text>
            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                testID="accounts-add-entry-cancel"
                onPress={() => setEntryModalVisible(false)}
                style={({ pressed }) => [styles.modalBtn, styles.modalCancel, pressed && styles.modalBtnPressed]}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="accounts-add-entry-save"
                disabled={isSaving}
                onPress={() => void handleSaveEntry()}
                style={({ pressed }) => [styles.modalBtn, styles.modalSave, (pressed || isSaving) && styles.modalBtnPressed]}
              >
                <Text style={styles.modalSaveText}>{isSaving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            </View>
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
  caption: {
    marginTop: 10,
    fontSize: 15,
    color: financeColors.textMuted,
    lineHeight: 22,
  },
  summaryCard: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: financeColors.accent,
  },
  summaryLabel: { fontSize: 14, fontWeight: '700', color: '#fff4ee' },
  summaryValue: { marginTop: 4, fontSize: 34, fontWeight: '800', color: '#ffffff' },
  summaryMeta: { marginTop: 6, fontSize: 13, color: '#fff0e8', lineHeight: 18 },
  addAccountBtn: {
    marginTop: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: financeColors.goldSoft,
  },
  addAccountBtnPressed: { opacity: 0.8 },
  addAccountText: { color: financeColors.text, fontWeight: '700', fontSize: 14 },
  sectionTitle: { marginTop: 20, marginHorizontal: 16, fontSize: 16, fontWeight: '700', color: financeColors.text },
  emptyText: { marginTop: 8, marginHorizontal: 16, color: financeColors.textMuted, fontSize: 14 },
  cardList: { marginTop: 8, marginHorizontal: 16, gap: 10 },
  accountCard: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: financeColors.surfaceStrong,
  },
  accountName: { fontSize: 15, fontWeight: '700', color: financeColors.text },
  accountMeta: { marginTop: 2, fontSize: 12, color: financeColors.textMuted },
  accountBalance: { marginTop: 6, fontSize: 16, fontWeight: '800', color: financeColors.text },
  entryCard: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: financeColors.surface,
  },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryTitle: { fontSize: 14, fontWeight: '700', color: financeColors.text },
  entryAmount: { fontSize: 14, fontWeight: '800', color: financeColors.text },
  entryMeta: { marginTop: 2, fontSize: 12, color: financeColors.textMuted },
  entryNote: { marginTop: 4, fontSize: 12, color: financeColors.textMuted },
  headerAddButton: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 4 },
  headerAddButtonPressed: { opacity: 0.6 },
  headerAddInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerAddLabel: { fontSize: 17, color: financeColors.accent, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(45,36,28,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', backgroundColor: financeColors.surfaceStrong, borderRadius: 24, padding: 18 },
  modalTitle: { fontSize: 19, fontWeight: '700', color: financeColors.text },
  modalLabel: { marginTop: 10, marginBottom: 6, fontSize: 13, fontWeight: '600', color: financeColors.text },
  modalInput: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
  },
  modalDateLabel: { marginTop: 10, fontSize: 13, color: financeColors.textMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: financeColors.surface,
  },
  chipActive: { borderColor: financeColors.accent, backgroundColor: financeColors.accentSoft },
  chipPressed: { opacity: 0.8 },
  chipText: { fontSize: 12, color: financeColors.textMuted, fontWeight: '600' },
  chipTextActive: { color: financeColors.accentStrong },
  errorText: { marginTop: 10, color: financeColors.danger, fontSize: 13, fontWeight: '500' },
  modalActions: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 14 },
  modalBtnPressed: { opacity: 0.7 },
  modalCancel: { backgroundColor: financeColors.surfaceMuted },
  modalSave: { backgroundColor: financeColors.accent },
  modalCancelText: { color: financeColors.text, fontWeight: '700' },
  modalSaveText: { color: '#fff', fontWeight: '700' },
});
