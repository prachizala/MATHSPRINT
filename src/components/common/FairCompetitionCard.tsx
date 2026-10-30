import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from './Card';

interface FairCompetitionCardProps {
  style?: ViewStyle;
  compact?: boolean;
}

export const FairCompetitionCard: React.FC<FairCompetitionCardProps> = ({
  style,
  compact = false,
}) => {
  const points = [
    { icon: 'shuffle', text: 'Randomized questions & answers' },
    { icon: 'checkmark-circle-outline', text: 'One submission per question' },
    { icon: 'shield-checkmark-outline', text: 'Server-side validation & anomaly checks' },
    { icon: 'time-outline', text: 'Precise timestamp recording' },
    { icon: 'timer-outline', text: 'Automatic quiz closing at 02:00' },
  ];

  if (compact) {
    return (
      <View style={[styles.compactRow, style]}>
        <Ionicons name="shield-checkmark" size={16} color={theme.colors.green} />
        <Text style={styles.compactText}>🛡 FAIR COMPETITION PROTECTED</Text>
      </View>
    );
  }

  return (
    <Card variant="accentGreen" style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.green} />
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.title}>🛡 FAIR COMPETITION</Text>
          <Text style={styles.subtitle}>Integrity-first classroom battle engine</Text>
        </View>
      </View>

      <View style={styles.list}>
        {points.map((pt, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Ionicons
              name={pt.icon as any}
              size={14}
              color={theme.colors.greenDark}
              style={styles.bulletIcon}
            />
            <Text style={styles.itemText}>{pt.text}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    color: theme.colors.greenDark,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  list: {
    gap: 6,
    paddingLeft: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletIcon: {
    marginRight: 8,
  },
  itemText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.greenLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.full,
    gap: 6,
    alignSelf: 'center',
  },
  compactText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.greenDark,
    letterSpacing: 0.5,
  },
});
