import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface GhostRacerTrackProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  remainingSeconds: number;
  totalSeconds: number;
}

export const GhostRacerTrack: React.FC<GhostRacerTrackProps> = ({
  currentQuestionIndex,
  totalQuestions,
  remainingSeconds,
  totalSeconds,
}) => {
  const safeTotalQ = totalQuestions > 0 ? totalQuestions : 10;
  const safeTotalSec = totalSeconds > 0 ? totalSeconds : 120;
  const elapsedSec = Math.max(0, safeTotalSec - remainingSeconds);

  // Student progress percentage (0 - 100)
  const studentPercent = Math.min(100, Math.max(2, (currentQuestionIndex / safeTotalQ) * 100));

  // Ghost progress based on uniform classroom median pace benchmark
  const ghostPercent = Math.min(100, Math.max(2, (elapsedSec / safeTotalSec) * 100));

  const targetSecPerQ = safeTotalSec / safeTotalQ;
  const ghostExpectedQ = Math.floor(elapsedSec / targetSecPerQ);
  const qDelta = currentQuestionIndex - ghostExpectedQ;

  let deltaLabel = '';
  let deltaBg = '#ECFDF5';
  let deltaColor = '#059669';

  if (qDelta > 0) {
    deltaLabel = `🏃 You lead Class Benchmark by +${qDelta} Qs!`;
    deltaBg = '#ECFDF5';
    deltaColor = '#059669';
  } else if (qDelta === 0) {
    deltaLabel = `⚡ Neck-and-neck with Class Benchmark Pace`;
    deltaBg = '#EFF6FF';
    deltaColor = theme.colors.primary;
  } else {
    deltaLabel = `👻 Class Benchmark is +${Math.abs(qDelta)} Qs ahead! Pick up speed!`;
    deltaBg = '#FFFBEB';
    deltaColor = '#D97706';
  }

  return (
    <View style={styles.container}>
      {/* Race Telemetry Tag */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="speedometer-outline" size={13} color={theme.colors.textSecondary} />
          <Text style={styles.title}>Ghost Racer • Pace Benchmark</Text>
        </View>
        <View style={[styles.badgePill, { backgroundColor: deltaBg }]}>
          <Text style={[styles.badgeText, { color: deltaColor }]}>{deltaLabel}</Text>
        </View>
      </View>

      {/* Mini Track */}
      <View style={styles.trackContainer}>
        {/* Track Groove */}
        <View style={styles.trackGroove} />

        {/* Start / Finish flags */}
        <Text style={styles.startFlag}>START</Text>
        <Text style={styles.finishFlag}>🏁 FINISH</Text>

        {/* Ghost Benchmark Runner */}
        <View style={[styles.runnerPin, { left: `${Math.min(92, Math.max(3, ghostPercent))}%` }]}>
          <View style={styles.ghostCircle}>
            <Text style={{ fontSize: 11 }}>👻</Text>
          </View>
          <Text style={styles.ghostLabel}>Ghost</Text>
        </View>

        {/* Active Student Runner */}
        <View style={[styles.runnerPin, { left: `${Math.min(92, Math.max(3, studentPercent))}%` }]}>
          <View style={styles.studentCircle}>
            <Ionicons name="flash" size={10} color="#FFF" />
          </View>
          <Text style={styles.studentLabel}>YOU</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  trackContainer: {
    height: 32,
    position: 'relative',
    justifyContent: 'center',
  },
  trackGroove: {
    position: 'absolute',
    left: 28,
    right: 48,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  startFlag: {
    position: 'absolute',
    left: 0,
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.textMuted,
  },
  finishFlag: {
    position: 'absolute',
    right: 0,
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.textSecondary,
  },
  runnerPin: {
    position: 'absolute',
    alignItems: 'center',
    width: 24,
    marginLeft: -12,
    top: 0,
  },
  studentCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
    ...theme.shadows.sm,
  },
  studentLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: theme.colors.primary,
    marginTop: 1,
  },
  ghostCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  ghostLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8B5CF6',
    marginTop: 1,
  },
});
