import { Platform } from 'react-native';

export const financeColors = {
  background: '#f6f1e8',
  surface: '#fffaf4',
  surfaceStrong: '#ffffff',
  surfaceMuted: '#f2e7d8',
  border: '#eadfce',
  text: '#2d241c',
  textMuted: '#7a6d60',
  accent: '#e36a43',
  accentStrong: '#c95531',
  accentSoft: '#fde3d8',
  accentSoftText: '#8f4128',
  gold: '#f0b86f',
  goldSoft: '#faedd6',
  blue: '#6d8eb3',
  blueSoft: '#dfe8f3',
  green: '#2f8e6b',
  greenSoft: '#dff4eb',
  danger: '#b85642',
  dangerSoft: '#f7ddd8',
};

export const financeShadow = Platform.select({
  ios: {
    shadowColor: '#2d241c',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  android: {
    elevation: 4,
  },
  default: {
    shadowColor: '#2d241c',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
});

export const financeCalendarTheme = {
  backgroundColor: financeColors.surfaceStrong,
  calendarBackground: financeColors.surfaceStrong,
  textSectionTitleColor: financeColors.textMuted,
  monthTextColor: financeColors.text,
  textMonthFontWeight: '700' as const,
  arrowColor: financeColors.accent,
  todayTextColor: financeColors.accent,
};
