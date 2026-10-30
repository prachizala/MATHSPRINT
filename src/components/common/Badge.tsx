import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

export type BadgeVariant = 'primary' | 'cyan' | 'purple' | 'green' | 'orange' | 'danger' | 'muted';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  icon,
  size = 'md',
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.badge, styles[variant], styles[`size_${size}`], style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },

  // Sizes
  size_sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  textSize_sm: {
    fontSize: theme.typography.sizes.xs,
  },
  textSize_md: {
    fontSize: theme.typography.sizes.sm,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primaryLight,
  },
  text_primary: {
    color: theme.colors.primary,
  },
  cyan: {
    backgroundColor: theme.colors.cyanLight,
  },
  text_cyan: {
    color: theme.colors.cyanDark,
  },
  purple: {
    backgroundColor: theme.colors.purpleLight,
  },
  text_purple: {
    color: theme.colors.purple,
  },
  green: {
    backgroundColor: theme.colors.greenLight,
  },
  text_green: {
    color: theme.colors.greenDark,
  },
  orange: {
    backgroundColor: theme.colors.orangeLight,
  },
  text_orange: {
    color: theme.colors.orangeDark,
  },
  danger: {
    backgroundColor: theme.colors.dangerBackground,
  },
  text_danger: {
    color: theme.colors.danger,
  },
  muted: {
    backgroundColor: theme.colors.surfaceHighlight,
  },
  text_muted: {
    color: theme.colors.textSecondary,
  },
});
