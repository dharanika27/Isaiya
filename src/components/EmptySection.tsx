import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

interface Props {
  title: string;
  emptyText: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptySection({ title, emptyText, icon = 'musical-notes-outline' }: Props) {
  const { colors } = useIsaiyaTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.screenTitle, styles.title, { color: colors.onSurface }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.surfaceVariant }]}>
        <Ionicons name={icon} size={22} color={colors.onSurfaceMuted} style={styles.icon} />
        <Text style={[typography.body, styles.emptyText, { color: colors.onSurfaceMuted }]}>{emptyText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  emptyText: {
    flex: 1,
    lineHeight: 20,
  },
});
