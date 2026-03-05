import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function Select({ label, options, value, onChange, error }: SelectProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={styles.optionsRow}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.7}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? colors.primary : colors.inputBackground,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? '#ffffff' : colors.text,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs + 2,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
  },
  error: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
