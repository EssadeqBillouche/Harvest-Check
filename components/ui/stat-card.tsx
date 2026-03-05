import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}

export function StatCard({ label, value, icon, color, style }: StatCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accentColor = color ?? colors.primary;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
        Shadows.sm,
        style,
      ]}
    >
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
          {icon}
        </View>
      )}
      <Text style={[styles.value, { color: colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
