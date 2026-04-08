jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }) =>
      React.createElement(Text, { testID: `mock-ionicon-${name}` }, name),
  };
});

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ testID }) => React.createElement(View, { testID });
});

jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn(async () => ({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(async () => ({})),
  reloadAsync: jest.fn(async () => {}),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true, expires: 'never' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true, expires: 'never' })),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
    PROVISIONAL: 'provisional',
  },
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { MONTHLY: 'monthly', DATE: 'date' },
  setNotificationChannelAsync: jest.fn(async () => {}),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelScheduledNotificationAsync: jest.fn(async () => {}),
  scheduleNotificationAsync: jest.fn(async () => 'mock-id'),
}));
