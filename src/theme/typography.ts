import type { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  appTitle: { fontSize: 28, fontWeight: '700' },
  tagline: { fontSize: 14, fontWeight: '400' },
  screenTitle: { fontSize: 18, fontWeight: '700' },
  sectionLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  itemTitle: { fontSize: 14, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
};
