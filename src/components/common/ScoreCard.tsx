import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from './Card';
import { formatPoints, formatAccuracy } from '../../utils/formatters';

export interface ScoreCardProps {
  score: number;
  accuracy: number;
  streak: number;
  rank?: number;
  title?: string;
  style?: StyleProp<ViewStyle>;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  accuracy,
  streak,
  rank,
  title = 'Sprint Performance',
  style,
}) => {
  return (
    <Card variant="elevated" style={[styles.card, style]}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}

      <View style={styles.grid}>
        {/* Score */}
        <View style={styles.metricBox}>
          <View style={[styles.iconBadge, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="trophy" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.metricValue}>{formatPoints(score)}</Text>
          <Text style={styles.metricLabel}>Total Score</Text>
        </View>

        {/* Accuracy */}
        <View style={styles.metricBox}>
          <View style={[styles.iconBadge, { backgroundColor: theme.colors.greenLight }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.green} />
          </View>
          <Text style={styles.metricValue}>{formatAccuracy(accuracy)}</Text>
          <Text style={styles.metricLabel}>Accuracy</Text>
        </View>

        {/* Streak */}
        <View style={styles.metricBox}>
          <View style={[styles.iconBadge, { backgroundColor: theme.colors.orangeLight }]}>
            <Ionicons name="flame" size={20} color={theme.colors.orange} />
          </View>
          <Text style={styles.metricValue}>{streak}x</Text>
          <Text style={styles.metricLabel}>Streak</Text>
        </View>

        {/* Rank (if provided) */}
        {rank !== undefined && (
          <View style={styles.metricBox}>
            <View style={[styles.iconBadge, { backgroundColor: theme.colors.purpleLight }]}>
              <Ionicons name="podium" size={20} color={theme.colors.purple} />
            </View>
            <Text style={styles.metricValue}>#{rank}</Text>
            <Text style={styles.metricLabel}>Rank</Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.base,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
