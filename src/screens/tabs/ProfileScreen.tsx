import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ProfileScreen() {
  return (
    <View style={styles.container} testID="screen-profile">
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.caption}>Account and settings.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },
  caption: {
    marginTop: 8,
    fontSize: 15,
    color: '#6b7280',
  },
});
