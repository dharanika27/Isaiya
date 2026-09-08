import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function LanguageChipComponent({ label, selected, onPress }: Props) {
  const { colors } = useIsaiyaTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surfaceVariant,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <Text style={[typography.itemTitle, { color: selected ? '#FFFFFF' : colors.onSurface }]}>{label}</Text>
    </Pressable>
  );
}

export const LanguageChip = React.memo(LanguageChipComponent);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
});
