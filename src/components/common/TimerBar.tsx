import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { formatTimer } from '../../utils/formatters';

export interface TimerBarProps {
  remainingSeconds: number;
  totalSeconds?: number;
  showLabel?: boolean;
  style?: ViewStyle;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  remainingSeconds,
  totalSeconds = 120,
  showLabel = true,
  style,
}) => {
  const percentage = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));

  // Dynamic color transitions
  let barColor: string = theme.colors.cyan;
  if (percentage <= 0.2) {
    barColor = theme.colors.danger;
  } else if (percentage <= 0.4) {
    barColor = theme.colors.orange;
  }

  const isUrgent = percentage <= 0.2;

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelRow}>
          <View style={styles.timerBadge}>
            <Ionicons
              name="stopwatch-outline"
              size={16}
              color={isUrgent ? theme.colors.danger : theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.timerText,
                isUrgent && styles.timerTextUrgent,
              ]}
            >
              {formatTimer(remainingSeconds)}
            </Text>
          </View>
          <Text style={styles.ratioText}>
            {Math.round(remainingSeconds)}s / {totalSeconds}s
          </Text>
        </View>
      )}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage * 100}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: 4,
    fontVariant: ['tabular-nums'],
  },
  timerTextUrgent: {
    color: theme.colors.danger,
  },
  ratioText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  track: {
    height: 8,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
});
