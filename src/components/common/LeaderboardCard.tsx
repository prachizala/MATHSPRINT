import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LeaderboardEntry } from '../../types';
import { formatPoints, formatAccuracy } from '../../utils/formatters';

export interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  onPress?: () => void;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entry, onPress }) => {
  const isTopThree = entry.rank <= 3;

  // Rank badge color
  let rankColor: string = theme.colors.textSecondary;
  let rankBg: string = theme.colors.surfaceSubtle;
  if (entry.rank === 1) {
    rankColor = '#B45309'; // Gold
    rankBg = '#FEF3C7';
  } else if (entry.rank === 2) {
    rankColor = '#475569'; // Silver
    rankBg = '#E2E8F0';
  } else if (entry.rank === 3) {
    rankColor = '#C2410C'; // Bronze
    rankBg = '#FFEDD5';
  }

  const content = (
    <View
      style={[
        styles.container,
        entry.isCurrentUser && styles.currentUserContainer,
      ]}
    >
      {/* Rank Indicator */}
      <View style={[styles.rankCircle, { backgroundColor: rankBg }]}>
        {entry.rank === 1 ? (
          <Ionicons name="trophy" size={16} color={rankColor} />
        ) : (
          <Text style={[styles.rankText, { color: rankColor }]}>{entry.rank}</Text>
        )}
      </View>

      {/* Participant info */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, entry.isCurrentUser && styles.currentUserName]}
            numberOfLines={1}
          >
            {entry.name}
          </Text>
          {entry.isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youText}>YOU</Text>
            </View>
          )}
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statSubText}>{formatAccuracy(entry.accuracy)} acc</Text>
          {entry.streak > 1 && (
            <View style={styles.streakTag}>
              <Ionicons name="flame" size={12} color={theme.colors.orange} />
              <Text style={styles.streakText}>{entry.streak}x</Text>
            </View>
          )}
        </View>
      </View>

      {/* Points */}
      <View style={styles.scoreCol}>
        <Text style={styles.scoreText}>{formatPoints(entry.score)}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  currentUserContainer: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  rankText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  currentUserName: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  youBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  youText: {
    fontSize: 10,
    color: theme.colors.textInverse,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statSubText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  streakTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  streakText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.orangeDark,
    fontWeight: '600',
    marginLeft: 2,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
