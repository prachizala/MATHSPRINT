import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from './Card';
import { formatTime } from '../../utils/formatters';

interface TimerCardProps {
  remainingSeconds: number;
  totalSeconds?: number;
  label?: string;
  style?: ViewStyle;
}

export const TimerCard: React.FC<TimerCardProps> = ({
  remainingSeconds,
  totalSeconds = 120,
  label = '2-MINUTE SPRINT TIMER',
  style,
}) => {
  const isLow = remainingSeconds <= 20;
  const isCritical = remainingSeconds <= 10;
  const timerColor = isCritical
    ? theme.colors.danger
    : isLow
    ? theme.colors.orange
    : theme.colors.primary;

  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));

  return (
    <Card
      variant={isCritical ? 'accentOrange' : 'elevated'}
      style={[
        styles.card,
        isCritical && { borderColor: theme.colors.danger, borderWidth: 1.5 },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <Ionicons
            name="timer"
            size={16}
            color={timerColor}
            style={isCritical ? styles.pulse : undefined}
          />
          <Text style={[styles.labelText, { color: timerColor }]}>{label}</Text>
        </View>
        <Text style={[styles.timerDigits, { color: timerColor }]}>
          {formatTime(remainingSeconds)}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${progressPercent}%`,
              backgroundColor: timerColor,
            },
          ]}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timerDigits: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pulse: {
    opacity: 0.9,
  },
  track: {
    height: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
});
