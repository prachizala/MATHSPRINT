import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from './Card';
import { Badge } from './Badge';

interface SprintCardProps {
  title: string;
  topic?: string;
  dateOrTime?: string;
  duration?: string;
  participantCount?: number;
  score?: number;
  accuracy?: number;
  rank?: number;
  statusBadge?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const SprintCard: React.FC<SprintCardProps> = ({
  title,
  topic,
  dateOrTime,
  duration = '2:00',
  participantCount,
  score,
  accuracy,
  rank,
  statusBadge,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.container, style]}
    >
      <Card variant="elevated" style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            {topic && <Badge label={topic} variant="primary" size="sm" style={styles.badge} />}
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          </View>
          {statusBadge && <Badge label={statusBadge} variant="cyan" size="sm" />}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.metaItem}>
            <Ionicons name="timer-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.metaText}>{duration} Sprint</Text>
          </View>

          {participantCount !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={theme.colors.purple} />
              <Text style={styles.metaText}>{participantCount} contestants</Text>
            </View>
          )}

          {dateOrTime && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>{dateOrTime}</Text>
            </View>
          )}
        </View>

        {(score !== undefined || accuracy !== undefined || rank !== undefined) && (
          <View style={styles.statsRow}>
            {score !== undefined && (
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{score}</Text>
                <Text style={styles.statLbl}>Score</Text>
              </View>
            )}
            {accuracy !== undefined && (
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{accuracy}%</Text>
                <Text style={styles.statLbl}>Accuracy</Text>
              </View>
            )}
            {rank !== undefined && (
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.colors.orange }]}>#{rank}</Text>
                <Text style={styles.statLbl}>Rank</Text>
              </View>
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  titleCol: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: theme.spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLbl: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
});
