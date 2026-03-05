import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ text, variant = 'neutral', style }: BadgeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.primaryLight, text: colors.primary },
    warning: {
      bg: colorScheme === 'light' ? '#fef3c7' : '#78350f',
      text: colorScheme === 'light' ? '#92400e' : '#fbbf24',
    },
    danger: {
      bg: colors.dangerLight,
      text: colors.danger,
    },
    info: {
      bg: colorScheme === 'light' ? '#dbeafe' : '#1e3a5f',
      text: colorScheme === 'light' ? '#1d4ed8' : '#60a5fa',
    },
    neutral: {
      bg: colorScheme === 'light' ? '#f3f4f6' : '#374151',
      text: colors.textSecondary,
    },
  };

  const vs = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: vs.bg }, style]}>
      <Text style={[styles.text, { color: vs.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
