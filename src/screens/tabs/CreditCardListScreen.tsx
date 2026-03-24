import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function CreditCardListScreen() {
  return (
    <View style={styles.container} testID="screen-credit-card-list">
      <Text style={styles.title}>Credit card list</Text>
      <Text style={styles.caption}>Your cards will appear here.</Text>
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
