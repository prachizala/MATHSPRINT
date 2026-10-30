import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export interface ShieldBadgeProps {
  label?: string;
  verified?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}

export const ShieldBadge: React.FC<ShieldBadgeProps> = ({
  label = 'Fair-Play Verified',
  verified = true,
  compact = false,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        verified ? styles.verifiedContainer : styles.unverifiedContainer,
        compact && styles.compactContainer,
        style,
      ]}
    >
      <Ionicons
        name={verified ? 'shield-checkmark' : 'shield-outline'}
        size={compact ? 14 : 18}
        color={verified ? theme.colors.green : theme.colors.textMuted}
      />
      <Text
        style={[
          styles.text,
          verified ? styles.verifiedText : styles.unverifiedText,
          compact && styles.compactText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  compactContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  verifiedContainer: {
    backgroundColor: theme.colors.greenLight,
    borderColor: '#A7F3D0',
  },
  unverifiedContainer: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.border,
  },
  text: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    marginLeft: 6,
  },
  compactText: {
    fontSize: 10,
    marginLeft: 4,
  },
  verifiedText: {
    color: theme.colors.greenDark,
  },
  unverifiedText: {
    color: theme.colors.textSecondary,
  },
});
