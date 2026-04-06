import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { parseAmount } from '../../houseExpense/expenseDashboardLogic';
import { formatInr } from '../../localization/indiaFormat';
import { financeColors, financeShadow } from '../../ui/financeTheme';
import { useExpenseCategories } from '../../expenseCategories/useExpenseCategories';

type CategoryTitleFieldProps = {
  index: number;
  committedTitle: string;
  editable: boolean;
  onCommit: (index: number, value: string) => boolean;
};

function CategoryTitleField({
  index,
  committedTitle,
  editable,
  onCommit,
}: CategoryTitleFieldProps) {
  const [value, setValue] = useState(committedTitle);

  useEffect(() => {
    setValue(committedTitle);
  }, [committedTitle]);

  return (
    <TextInput
      testID={`house-expense-category-title-${index}`}
      style={[styles.rowInput, !editable && styles.inputReadOnly]}
      placeholder="Category name"
      placeholderTextColor="#9ca3af"
      value={value}
      editable={editable}
      onChangeText={setValue}
      onEndEditing={() => {
        if (!editable) {
          return;
        }
        const ok = onCommit(index, value);
        if (!ok) {
          setValue(committedTitle);
        }
      }}
      returnKeyType="done"
    />
  );
}

export default function HouseExpenseSettingsScreen() {
  const navigation = useNavigation();
  const {
    categories,
    isReady,
    isSaving,
    addCategory,
    updateCategoryTitle,
    updateCategoryAmount,
    saveCategories,
  } = useExpenseCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftAmount, setDraftAmount] = useState('');

  const totalBudget = useMemo(
    () => categories.reduce((sum, row) => sum + parseAmount(row.amount), 0),
    [categories],
  );
  const uncappedCount = useMemo(
    () => categories.filter((row) => parseAmount(row.amount) <= 0).length,
    [categories],
  );

  const handleHeaderAction = useCallback(async () => {
    if (isEditing) {
      await saveCategories();
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [isEditing, saveCategories]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          testID={
            isEditing ? 'house-expense-settings-header-save' : 'house-expense-settings-header-edit'
          }
          accessibilityRole="button"
          accessibilityLabel={
            isEditing ? 'Save expense categories' : 'Edit expense categories'
          }
          disabled={isEditing && isSaving}
          onPress={() => void handleHeaderAction()}
          style={({ pressed }) => [
            styles.headerButton,
            (pressed || (isEditing && isSaving)) && styles.headerButtonPressed,
          ]}
        >
          <View style={styles.headerActionRow}>
            {isEditing && isSaving ? (
              <ActivityIndicator size="small" color={financeColors.textMuted} />
            ) : (
              <Ionicons
                name={isEditing ? 'checkmark-circle-outline' : 'create-outline'}
                size={20}
                color={financeColors.accent}
              />
            )}
            <Text style={[styles.headerAction, isEditing && isSaving && styles.headerActionMuted]}>
              {isEditing ? (isSaving ? 'Saving…' : 'Save') : 'Edit'}
            </Text>
          </View>
        </Pressable>
      ),
    });
  }, [navigation, isEditing, isSaving, handleHeaderAction]);

  function handleAdd() {
    addCategory(draftTitle, draftAmount);
    setDraftTitle('');
    setDraftAmount('');
  }

  if (!isReady) {
    return (
      <View style={styles.centered} testID="house-expense-settings-loading">
        <ActivityIndicator size="large" color={financeColors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.screen} testID="house-expense-settings-screen">
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Expense categories</Text>
          <Text style={styles.heroTitle}>Keep categories clean, simple, and easy to maintain.</Text>
          <Text style={styles.heroCaption}>
            Use short names and monthly budget amounts. This list powers your home overview and category spending screens.
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Categories</Text>
              <Text style={styles.heroStatValue}>{categories.length}</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Budget total</Text>
              <Text style={styles.heroStatValue}>{formatInr(totalBudget)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Without budget</Text>
            <Text style={styles.summaryValue}>{uncappedCount}</Text>
            <Text style={styles.summaryHint}>Categories still missing a monthly cap</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Mode</Text>
            <Text style={styles.summaryValue}>{isEditing ? 'Edit' : 'View'}</Text>
            <Text style={styles.summaryHint}>
              {isEditing ? 'Make changes, then save from the header' : 'Tap Edit to update names or budgets'}
            </Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.addCard}>
            <Text style={styles.sectionTitle}>Add category</Text>
            <Text style={styles.sectionHint}>Use a simple name and optional monthly budget.</Text>
            <TextInput
              testID="house-expense-new-category-title"
              style={styles.addInput}
              placeholder="Category name"
              placeholderTextColor="#9ca3af"
              value={draftTitle}
              onChangeText={setDraftTitle}
              returnKeyType="next"
            />
            <TextInput
              testID="house-expense-new-category-amount"
              style={styles.addInput}
              placeholder="Monthly budget amount"
              placeholderTextColor="#9ca3af"
              value={draftAmount}
              onChangeText={setDraftAmount}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <Pressable
              testID="house-expense-add-category-button"
              style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
              onPress={handleAdd}
            >
              <Text style={styles.addButtonLabel}>Add category</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category list</Text>
          <Text style={styles.sectionHint}>Each category can have a monthly budget amount.</Text>
        </View>

        {categories.map((row, index) => {
          const amountValue = parseAmount(row.amount);
          return (
            <View key={`${row.title}-${index}`} style={styles.categoryCard}>
              <View style={styles.categoryTop}>
                <View style={styles.categoryBadge}>
                  <Ionicons name="pricetag-outline" size={16} color={financeColors.accentStrong} />
                </View>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryMetaLabel}>Category {index + 1}</Text>
                  <Text style={styles.categoryMetaHint}>
                    {amountValue > 0 ? `${formatInr(amountValue)} monthly budget` : 'No budget set yet'}
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Name</Text>
              <CategoryTitleField
                index={index}
                committedTitle={row.title}
                editable={isEditing}
                onCommit={updateCategoryTitle}
              />

              <Text style={styles.fieldLabel}>Monthly budget</Text>
              <TextInput
                testID={`house-expense-category-amount-${index}`}
                style={[styles.rowInput, !isEditing && styles.inputReadOnly]}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={row.amount}
                editable={isEditing}
                onChangeText={(text) => updateCategoryAmount(index, text)}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          );
        })}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAction: {
    fontSize: 17,
    color: financeColors.accent,
    fontWeight: '700',
  },
  headerActionMuted: {
    color: financeColors.textMuted,
  },
  heroCard: {
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
  heroCaption: {
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
    fontSize: 12,
    fontWeight: '700',
    color: financeColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroStatValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    color: financeColors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: financeColors.border,
    backgroundColor: financeColors.surfaceStrong,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: financeColors.textMuted,
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '800',
    color: financeColors.text,
  },
  summaryHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: financeColors.textMuted,
  },
  addCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: financeColors.border,
    backgroundColor: financeColors.surfaceStrong,
  },
  sectionHeader: {
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: financeColors.text,
  },
  sectionHint: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: financeColors.textMuted,
  },
  addInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
    marginTop: 12,
  },
  addButton: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: financeColors.accent,
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  categoryCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: financeColors.border,
    backgroundColor: financeColors.surfaceStrong,
  },
  categoryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  categoryBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: financeColors.accentSoft,
  },
  categoryMeta: {
    flex: 1,
  },
  categoryMetaLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: financeColors.text,
  },
  categoryMetaHint: {
    marginTop: 3,
    fontSize: 13,
    color: financeColors.textMuted,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '700',
    color: financeColors.textMuted,
  },
  rowInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: financeColors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: financeColors.text,
    backgroundColor: financeColors.surface,
    marginBottom: 12,
  },
  inputReadOnly: {
    backgroundColor: financeColors.surfaceMuted,
    color: financeColors.text,
  },
});
