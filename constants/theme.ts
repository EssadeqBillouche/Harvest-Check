/**
 * Harvest-Check Theme
 * Agricultural-themed color palette with green tones.
 */

import { Platform } from 'react-native';

// ─── Brand Palette ───────────────────────────────────────────────────────────
export const Palette = {
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green200: '#bbf7d0',
  green300: '#86efac',
  green400: '#4ade80',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#15803d',
  green800: '#166534',
  green900: '#14532d',

  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber400: '#fbbf24',
  amber500: '#f59e0b',
  amber600: '#d97706',

  red50: '#fef2f2',
  red400: '#f87171',
  red500: '#ef4444',
  red600: '#dc2626',

  blue50: '#eff6ff',
  blue400: '#60a5fa',
  blue500: '#3b82f6',

  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  white: '#ffffff',
  black: '#000000',
} as const;

const tintColorLight = Palette.green600;
const tintColorDark = Palette.green400;

export const Colors = {
  light: {
    text: Palette.gray900,
    textSecondary: Palette.gray500,
    background: Palette.gray50,
    surface: Palette.white,
    tint: tintColorLight,
    primary: Palette.green600,
    primaryLight: Palette.green100,
    secondary: Palette.amber500,
    danger: Palette.red500,
    dangerLight: Palette.red50,
    success: Palette.green500,
    warning: Palette.amber500,
    icon: Palette.gray500,
    border: Palette.gray200,
    inputBackground: Palette.white,
    tabIconDefault: Palette.gray400,
    tabIconSelected: tintColorLight,
    cardBackground: Palette.white,
    placeholder: Palette.gray400,
  },
  dark: {
    text: Palette.gray50,
    textSecondary: Palette.gray400,
    background: Palette.gray900,
    surface: Palette.gray800,
    tint: tintColorDark,
    primary: Palette.green400,
    primaryLight: Palette.green900,
    secondary: Palette.amber400,
    danger: Palette.red400,
    dangerLight: Palette.gray800,
    success: Palette.green400,
    warning: Palette.amber400,
    icon: Palette.gray400,
    border: Palette.gray700,
    inputBackground: Palette.gray800,
    tabIconDefault: Palette.gray500,
    tabIconSelected: tintColorDark,
    cardBackground: Palette.gray800,
    placeholder: Palette.gray600,
  },
};

export type ThemeColors = typeof Colors.light;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────
export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
