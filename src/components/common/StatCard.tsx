import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  iconName?: keyof typeof Ionicons.glyphMap;
  color?: string;
  sublabel?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  iconName,
  color = theme.colors.primary,
  sublabel,
  style,
}) => {
  return (
    <Card variant="elevated" style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {iconName && (
          <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
            <Ionicons name={iconName} size={16} color={color} />
          </View>
        )}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    flex: 1,
    minWidth: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    marginVertical: 2,
  },
  sublabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});
