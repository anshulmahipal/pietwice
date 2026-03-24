import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
      style={[styles.inputTitle, !editable && styles.inputReadOnly]}
      placeholder="Title"
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
          <Text style={[styles.headerAction, isEditing && isSaving && styles.headerActionMuted]}>
            {isEditing ? (isSaving ? 'Saving…' : 'Save') : 'Edit'}
          </Text>
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
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.screen} testID="house-expense-settings-screen">
      <Text style={styles.lead}>
        {isEditing
          ? 'Make changes, then tap Save in the top bar to write them to local SQLite.'
          : 'Tap Edit to change categories and amounts. Save stores them on this device.'}
      </Text>

      <View style={styles.columnHeadings}>
        <Text style={[styles.headingLabel, styles.headingTitleCol]}>Title</Text>
        <Text style={[styles.headingLabel, styles.headingAmountCol]}>Amount</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {categories.map((row, index) => (
          <View key={`${row.title}-${index}`} style={styles.row}>
            {index > 0 ? <View style={styles.separator} /> : null}
            <View style={styles.rowInputs}>
              <CategoryTitleField
                index={index}
                committedTitle={row.title}
                editable={isEditing}
                onCommit={updateCategoryTitle}
              />
              <TextInput
                testID={`house-expense-category-amount-${index}`}
                style={[styles.inputAmount, !isEditing && styles.inputReadOnly]}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={row.amount}
                editable={isEditing}
                onChangeText={(text) => updateCategoryAmount(index, text)}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          </View>
        ))}
        <View style={styles.listFooterSpacer} />
      </ScrollView>

      {isEditing ? (
        <View style={styles.addBlock}>
          <Text style={styles.addHeading}>Add category</Text>
          <View style={styles.addRow}>
            <TextInput
              testID="house-expense-new-category-title"
              style={styles.inputTitle}
              placeholder="Title"
              placeholderTextColor="#9ca3af"
              value={draftTitle}
              onChangeText={setDraftTitle}
              onSubmitEditing={handleAdd}
              returnKeyType="next"
            />
            <TextInput
              testID="house-expense-new-category-amount"
              style={styles.inputAmount}
              placeholder="Amount"
              placeholderTextColor="#9ca3af"
              value={draftAmount}
              onChangeText={setDraftAmount}
              keyboardType="decimal-pad"
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
            <Pressable
              testID="house-expense-add-category-button"
              style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
              onPress={handleAdd}
            >
              <Text style={styles.addButtonLabel}>Add</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
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
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  headerAction: {
    fontSize: 17,
    color: '#2563eb',
    fontWeight: '500',
  },
  headerActionMuted: {
    color: '#6b7280',
  },
  lead: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
  },
  columnHeadings: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 12,
  },
  headingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  headingTitleCol: {
    flex: 1.4,
  },
  headingAmountCol: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    backgroundColor: '#fff',
  },
  rowInputs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
    alignItems: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
    marginLeft: 20,
  },
  listFooterSpacer: {
    height: 16,
  },
  inputTitle: {
    flex: 1.4,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  inputAmount: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  inputReadOnly: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  addBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
