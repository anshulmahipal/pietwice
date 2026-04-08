import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStoredPin } from '../../auth/pinSecureStorage';
import { usePinSession } from '../../auth/PinSessionContext';
import { useChangePinFlow } from '../../auth/useChangePinFlow';
import type { ProfileStackParamList } from '../../navigation/profileStackTypes';
import { financeColors, financeShadow } from '../../ui/financeTheme';
import { SetLoginPinScreen } from '../SetLoginPinScreen';

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>>();
  const insets = useSafeAreaInsets();
  const { replaceStoredPin } = usePinSession();
  const {
    visible: changePinVisible,
    step: changePinStep,
    errorMessage: changePinError,
    resetToken: changePinResetToken,
    open: openChangePin,
    close: closeChangePin,
    submitCurrentPin,
    submitNewPin,
    submitConfirmPin,
  } = useChangePinFlow({ replaceStoredPin });

  const handleChangeEntryPin = useCallback(async () => {
    const pin = await getStoredPin();
    openChangePin(pin);
  }, [openChangePin]);

  const handleExportBackup = useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }
    try {
      const [{ serializeMonthlyExpenseDatabase }, { shareMonthlyExpenseBackupFile }] = await Promise.all([
        import('../../backup/monthlyExpenseBackup'),
        import('../../backup/monthlyExpenseBackupShare'),
      ]);
      const bytes = await serializeMonthlyExpenseDatabase();
      await shareMonthlyExpenseBackupFile(bytes);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create backup.';
      Alert.alert('Backup failed', message);
    }
  }, []);

  const handleRestoreBackup = useCallback(() => {
    if (Platform.OS === 'web') {
      return;
    }
    Alert.alert(
      'Restore from backup?',
      'This replaces all finance data in the app with the file you pick. Your PIN is stored separately and is not inside the backup. Reminder toggles for bills and cards also live outside the database.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose file',
          onPress: () => {
            void (async () => {
              try {
                const { pickMonthlyExpenseBackupFile } = await import(
                  '../../backup/monthlyExpenseBackupShare'
                );
                const bytes = await pickMonthlyExpenseBackupFile();
                if (!bytes) {
                  return;
                }
                Alert.alert(
                  'Replace all data?',
                  'The current database will be overwritten. You cannot undo this.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Restore',
                      style: 'destructive',
                      onPress: () => {
                        void (async () => {
                          try {
                            const { replaceMonthlyExpenseDatabaseFromBackup } = await import(
                              '../../backup/monthlyExpenseBackup'
                            );
                            await replaceMonthlyExpenseDatabaseFromBackup(bytes);
                            Alert.alert(
                              'Restore complete',
                              'Fully close Bondwallet (swipe it away from recent apps) and open it again so every screen loads the restored data.',
                            );
                          } catch (err) {
                            const message =
                              err instanceof Error && err.name === 'InvalidBackupFileError'
                                ? err.message
                                : err instanceof Error
                                  ? err.message
                                  : 'Restore failed.';
                            Alert.alert('Restore failed', message);
                          }
                        })();
                      },
                    },
                  ],
                );
              } catch (e) {
                const message = e instanceof Error ? e.message : 'Could not read the file.';
                Alert.alert('Restore failed', message);
              }
            })();
          },
        },
      ],
    );
  }, []);

  return (
    <View style={styles.container} testID="screen-profile">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <View style={styles.titleRow}>
            <Ionicons name="grid-outline" size={28} color={financeColors.accent} />
            <Text style={styles.title}>More tools</Text>
          </View>
          <Text style={styles.caption}>
            Keep the main tabs focused on daily actions. Extra planning, tracking, and account controls live here.
          </Text>
          <View style={styles.heroMiniRow}>
            <View style={styles.heroMiniCard}>
              <Text style={styles.heroMiniLabel}>Most used</Text>
              <Text style={styles.heroMiniValue}>Accounts</Text>
            </View>
            <View style={styles.heroMiniCard}>
              <Text style={styles.heroMiniLabel}>Security</Text>
              <Text style={styles.heroMiniValue}>PIN lock</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Money tools</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open expense categories"
          style={({ pressed }) => [styles.rowButton, pressed && styles.rowButtonPressed]}
          onPress={() => navigation.navigate('HouseExpenseSettings')}
        >
          <View style={styles.rowButtonInner}>
            <View style={[styles.rowIconWrap, styles.accentIconWrap]}>
              <Ionicons name="pricetags-outline" size={22} color={financeColors.accent} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowButtonLabel}>Expense categories</Text>
              <Text style={styles.rowButtonHint}>Names and monthly budgets for the Home expense list</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open accounts hub"
          style={({ pressed }) => [styles.rowButton, styles.rowButtonSpacing, pressed && styles.rowButtonPressed]}
          onPress={() => navigation.navigate('AccountsHub')}
        >
          <View style={styles.rowButtonInner}>
            <View style={[styles.rowIconWrap, styles.blueIconWrap]}>
              <Ionicons name="wallet-outline" size={22} color={financeColors.blue} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowButtonLabel}>Accounts</Text>
              <Text style={styles.rowButtonHint}>Track balances, cash movement, income, and expenses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open insights hub"
          style={({ pressed }) => [styles.rowButton, styles.rowButtonSpacing, pressed && styles.rowButtonPressed]}
          onPress={() => navigation.navigate('InsightsHub')}
        >
          <View style={styles.rowButtonInner}>
            <View style={[styles.rowIconWrap, styles.goldIconWrap]}>
              <Ionicons name="analytics-outline" size={22} color={financeColors.accentStrong} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowButtonLabel}>Insights</Text>
              <Text style={styles.rowButtonHint}>See monthly trends, cashflow, and budget pressure</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open budgets hub"
          style={({ pressed }) => [styles.rowButton, styles.rowButtonSpacing, pressed && styles.rowButtonPressed]}
          onPress={() => navigation.navigate('BudgetHub')}
        >
          <View style={styles.rowButtonInner}>
            <View style={[styles.rowIconWrap, styles.accentIconWrap]}>
              <Ionicons name="pie-chart-outline" size={22} color={financeColors.accent} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowButtonLabel}>Budgets</Text>
              <Text style={styles.rowButtonHint}>Adjust limits when you want tighter control</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>

        <Text style={styles.sectionLabel}>Optional tracking</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open investments hub"
          style={({ pressed }) => [styles.rowButton, pressed && styles.rowButtonPressed]}
          onPress={() => navigation.navigate('InvestmentHub')}
        >
          <View style={styles.rowButtonInner}>
            <View style={[styles.rowIconWrap, styles.greenIconWrap]}>
              <Ionicons name="trending-up-outline" size={22} color={financeColors.green} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowButtonLabel}>Investments</Text>
              <Text style={styles.rowButtonHint}>Keep holdings and key dates in one place</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open insurance hub"
          style={({ pressed }) => [styles.rowButton, styles.rowButtonSpacing, pressed && styles.rowButtonPressed]}
          onPress={() => navigation.navigate('InsuranceHub')}
        >
          <View style={styles.rowButtonInner}>
            <View style={[styles.rowIconWrap, styles.neutralIconWrap]}>
              <Ionicons name="shield-checkmark-outline" size={22} color={financeColors.textMuted} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowButtonLabel}>Insurance</Text>
              <Text style={styles.rowButtonHint}>Store policy details, premiums, and renewals</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>

        {Platform.OS !== 'web' ? (
          <>
            <Text style={styles.sectionLabel}>Data</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Export data backup"
              style={({ pressed }) => [styles.rowButton, pressed && styles.rowButtonPressed]}
              onPress={() => void handleExportBackup()}
            >
              <View style={styles.rowButtonInner}>
                <View style={[styles.rowIconWrap, styles.blueIconWrap]}>
                  <Ionicons name="cloud-upload-outline" size={22} color={financeColors.blue} />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowButtonLabel}>Export backup</Text>
                  <Text style={styles.rowButtonHint}>
                    Save a copy of your database to Files or cloud storage (share sheet)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Restore data backup"
              style={({ pressed }) => [
                styles.rowButton,
                styles.rowButtonSpacing,
                pressed && styles.rowButtonPressed,
              ]}
              onPress={handleRestoreBackup}
            >
              <View style={styles.rowButtonInner}>
                <View style={[styles.rowIconWrap, styles.neutralIconWrap]}>
                  <Ionicons name="cloud-download-outline" size={22} color={financeColors.textMuted} />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowButtonLabel}>Restore backup</Text>
                  <Text style={styles.rowButtonHint}>
                    After reinstall, pick the `.db` file you exported, then restart the app
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>
          </>
        ) : null}

        <Text style={styles.sectionLabel}>Security</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change entry PIN"
          style={({ pressed }) => [styles.rowButton, pressed && styles.rowButtonPressed]}
          onPress={() => void handleChangeEntryPin()}
        >
          <View style={styles.rowButtonInner}>
            <View style={[styles.rowIconWrap, styles.accentIconWrap]}>
              <Ionicons name="keypad-outline" size={22} color={financeColors.accent} />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowButtonLabel}>Change entry PIN</Text>
              <Text style={styles.rowButtonHint}>Update the 4-digit PIN that protects the app</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>
      </ScrollView>

      <Modal
        visible={changePinVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeChangePin}
        testID="profile-change-pin-modal"
      >
        <View
          style={[
            styles.modalChrome,
            { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={styles.modalHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel change PIN"
              onPress={closeChangePin}
              style={({ pressed }) => [styles.cancelControl, pressed && styles.cancelPressed]}
            >
              <View style={styles.cancelInner}>
                <Ionicons name="close-circle-outline" size={22} color="#2563eb" />
                <Text style={styles.cancelText}>Cancel</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.modalPinBody}>
          {changePinStep === 'verify_current' ? (
            <SetLoginPinScreen
              title="Enter current PIN"
              subtitle="Confirm it is you before choosing a new PIN."
              errorMessage={changePinError}
              resetToken={changePinResetToken}
              safeAreaEdges={['left', 'right']}
              onPinComplete={(pin) => {
                void submitCurrentPin(pin);
              }}
            />
          ) : null}

          {changePinStep === 'enter_new' ? (
            <SetLoginPinScreen
              title="Enter new PIN"
              subtitle="Choose a new 4-digit PIN using the keypad below."
              errorMessage={changePinError}
              resetToken={changePinResetToken}
              safeAreaEdges={['left', 'right']}
              onPinComplete={(pin) => {
                submitNewPin(pin);
              }}
            />
          ) : null}

          {changePinStep === 'confirm_new' ? (
            <SetLoginPinScreen
              title="Confirm new PIN"
              subtitle="Enter the same 4 digits again to save."
              errorMessage={changePinError}
              resetToken={changePinResetToken}
              safeAreaEdges={['left', 'right']}
              onPinComplete={(pin) => {
                void submitConfirmPin(pin);
              }}
            />
          ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: financeColors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 22,
    backgroundColor: financeColors.surfaceStrong,
    borderWidth: 1,
    borderColor: financeColors.border,
    ...financeShadow,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: financeColors.text,
  },
  caption: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: financeColors.textMuted,
  },
  heroMiniRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  heroMiniCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: financeColors.surface,
  },
  heroMiniLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: financeColors.textMuted,
  },
  heroMiniValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: financeColors.text,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: financeColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 4,
  },
  rowButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: financeColors.surface,
    borderWidth: 1,
    borderColor: financeColors.border,
  },
  rowButtonPressed: {
    backgroundColor: financeColors.surfaceMuted,
  },
  rowButtonSpacing: {
    marginTop: 10,
  },
  rowButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: financeColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentIconWrap: {
    backgroundColor: financeColors.accentSoft,
  },
  blueIconWrap: {
    backgroundColor: financeColors.blueSoft,
  },
  goldIconWrap: {
    backgroundColor: financeColors.goldSoft,
  },
  greenIconWrap: {
    backgroundColor: financeColors.greenSoft,
  },
  neutralIconWrap: {
    backgroundColor: financeColors.surfaceMuted,
  },
  rowTextCol: {
    flex: 1,
  },
  rowButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: financeColors.text,
  },
  rowButtonHint: {
    marginTop: 4,
    fontSize: 14,
    color: financeColors.textMuted,
  },
  modalChrome: {
    flex: 1,
    minHeight: 0,
    backgroundColor: financeColors.background,
  },
  modalPinBody: {
    flex: 1,
    minHeight: 0,
  },
  modalHeader: {
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  cancelControl: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelPressed: {
    opacity: 0.7,
  },
  cancelInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelText: {
    fontSize: 17,
    color: financeColors.accent,
    fontWeight: '500',
  },
});
