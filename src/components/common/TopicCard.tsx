import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { Card } from './Card';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';

interface TopicCardProps {
  name: string;
  accuracy: number;
  level: 'STRONG TOPIC' | 'MEDIUM TOPIC' | 'WEAK TOPIC';
  color?: string;
  description?: string;
  speedAvg?: string;
  style?: ViewStyle;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  name,
  accuracy,
  level,
  color,
  description,
  speedAvg,
  style,
}) => {
  const levelVariant =
    level === 'STRONG TOPIC' ? 'green' : level === 'MEDIUM TOPIC' ? 'cyan' : 'danger';
  const barColor =
    color ||
    (level === 'STRONG TOPIC'
      ? theme.colors.green
      : level === 'MEDIUM TOPIC'
      ? theme.colors.cyan
      : theme.colors.danger);

  return (
    <Card variant="elevated" style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text style={styles.name}>{name}</Text>
          {speedAvg && <Text style={styles.speed}>Avg response: {speedAvg}</Text>}
        </View>
        <Badge label={level} variant={levelVariant} size="sm" />
      </View>

      <ProgressBar
        progress={accuracy / 100}
        label="Accuracy"
        showPercentage
        color={barColor}
        height={8}
      />

      {description && <Text style={styles.desc}>{description}</Text>}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  titleCol: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  speed: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  desc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginTop: theme.spacing.sm,
  },
});
