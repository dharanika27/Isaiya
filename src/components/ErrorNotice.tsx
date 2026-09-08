import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorNotice({ message, onRetry }: Props) {
  const { colors } = useIsaiyaTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.body, styles.message, { color: colors.onSurfaceMuted }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, { opacity: pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={[typography.itemTitle, { color: colors.primary }]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  message: {
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
});
