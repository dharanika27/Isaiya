import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

interface Props {
  label?: string;
}

export function LoadingIndicator({ label }: Props) {
  const { colors } = useIsaiyaTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
      {label ? <Text style={[typography.body, styles.label, { color: colors.onSurfaceMuted }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 8,
  },
});
