import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePinSession } from '../../auth/PinSessionContext';
import { useChangePinFlow } from '../../auth/useChangePinFlow';
import { getStoredPin } from '../../auth/pinSecureStorage';
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

  return (
    <View style={styles.container} testID="screen-profile">
      <View style={styles.heroCard}>
        <View style={styles.titleRow}>
          <Ionicons name="person-circle-outline" size={28} color={financeColors.accent} />
          <Text style={styles.title}>Profile</Text>
        </View>
        <Text style={styles.caption}>Manage your finance hubs, security, and account setup.</Text>
      </View>

      <Text style={styles.sectionLabel}>Finance</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open insights hub"
        style={({ pressed }) => [styles.rowButton, pressed && styles.rowButtonPressed]}
        onPress={() => navigation.navigate('InsightsHub')}
      >
        <View style={styles.rowButtonInner}>
          <View style={styles.rowIconWrap}>
            <Ionicons name="analytics-outline" size={22} color="#2563eb" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowButtonLabel}>Insights</Text>
            <Text style={styles.rowButtonHint}>India-focused monthly and FY financial summary</Text>
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
          <View style={styles.rowIconWrap}>
            <Ionicons name="wallet-outline" size={22} color="#2563eb" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowButtonLabel}>Accounts</Text>
            <Text style={styles.rowButtonHint}>Track balances, income, and expense entries</Text>
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
          <View style={styles.rowIconWrap}>
            <Ionicons name="pie-chart-outline" size={22} color="#2563eb" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowButtonLabel}>Budgets</Text>
            <Text style={styles.rowButtonHint}>Weekly, bi-weekly, and monthly spending limits</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open investments hub"
        style={({ pressed }) => [styles.rowButton, styles.rowButtonSpacing, pressed && styles.rowButtonPressed]}
        onPress={() => navigation.navigate('InvestmentHub')}
      >
        <View style={styles.rowButtonInner}>
          <View style={styles.rowIconWrap}>
            <Ionicons name="trending-up-outline" size={22} color="#2563eb" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowButtonLabel}>Investments</Text>
            <Text style={styles.rowButtonHint}>Track holdings and dates like credit cards</Text>
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
          <View style={styles.rowIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#2563eb" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowButtonLabel}>Insurance</Text>
            <Text style={styles.rowButtonHint}>Policies, premiums, and renewal calendar</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </Pressable>

      <Text style={styles.sectionLabel}>Security</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change entry PIN"
        style={({ pressed }) => [styles.rowButton, styles.rowButtonSpacing, pressed && styles.rowButtonPressed]}
        onPress={() => void handleChangeEntryPin()}
      >
        <View style={styles.rowButtonInner}>
          <View style={styles.rowIconWrap}>
            <Ionicons name="keypad-outline" size={22} color="#2563eb" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowButtonLabel}>Change entry PIN</Text>
            <Text style={styles.rowButtonHint}>Update your 4-digit app PIN</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </Pressable>

      <Modal
        visible={changePinVisible}
        animationType="slide"
        presentationStyle="pageSheet"
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

          {changePinStep === 'verify_current' ? (
            <SetLoginPinScreen
              title="Enter current PIN"
              subtitle="Confirm it is you before choosing a new PIN."
              errorMessage={changePinError}
              resetToken={changePinResetToken}
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
              onPinComplete={(pin) => {
                void submitConfirmPin(pin);
              }}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: financeColors.background,
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
    color: financeColors.textMuted,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: financeColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
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
    backgroundColor: financeColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: financeColors.background,
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
