import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Button, Card, Header, Badge, StatCard, FairCompetitionCard } from '../../components/common';
import { mockLeaderboard, mockTeacherAnalytics } from '../../data/mockData';
import { formatPoints, formatAccuracy } from '../../utils/formatters';

type Props = NativeStackScreenProps<TeacherStackParamList, 'Results'>;

export const ResultsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Sprint Results"
        subtitle="Class 10-A Final Standings"
        rightElement={
          <Badge label="02:00 FINISHED" variant="green" size="sm" />
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <Card variant="accentPurple" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Math Logic Battle</Text>
          <Text style={styles.summarySub}>
            2-Minute Classroom Sprint • {mockTeacherAnalytics.studentsParticipated} Students Completed
          </Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{mockTeacherAnalytics.averageAccuracy}%</Text>
              <Text style={styles.metricLbl}>Avg Accuracy</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{mockTeacherAnalytics.averageScore}</Text>
              <Text style={styles.metricLbl}>Avg Score</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{mockTeacherAnalytics.participationRate}%</Text>
              <Text style={styles.metricLbl}>Participation</Text>
            </View>
          </View>
        </Card>

        {/* Podium Winners */}
        <Text style={styles.sectionTitle}>Podium Winners</Text>
        {mockLeaderboard.slice(0, 3).map((item) => (
          <Card key={item.studentId} variant="elevated" style={styles.podiumCard}>
            <View style={styles.row}>
              <View
                style={[
                  styles.podiumBadge,
                  item.rank === 1 && { backgroundColor: '#FEF3C7' },
                  item.rank === 2 && { backgroundColor: '#F1F5F9' },
                  item.rank === 3 && { backgroundColor: '#FFEDD5' },
                ]}
              >
                <Ionicons
                  name="trophy"
                  size={20}
                  color={item.rank === 1 ? '#D97706' : item.rank === 2 ? '#64748B' : '#C2410C'}
                />
              </View>
              <View style={styles.podiumInfo}>
                <Text style={styles.podiumName}>{item.name}</Text>
                <Text style={styles.podiumStats}>
                  {formatPoints(item.score)} PTS • {formatAccuracy(item.accuracy)} accuracy • {item.streak}x streak
                </Text>
              </View>
              <Badge
                label={`#${item.rank}`}
                variant={item.rank === 1 ? 'orange' : item.rank === 2 ? 'primary' : 'purple'}
                size="md"
              />
            </View>
          </Card>
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="VIEW IN-DEPTH CLASS ANALYTICS"
            variant="secondary"
            size="lg"
            leftIcon={<Ionicons name="bar-chart-outline" size={20} color="#FFF" />}
            onPress={() => navigation.navigate('Analytics')}
            fullWidth
            style={styles.btn}
          />

          <Button
            title="Return to Dashboard"
            variant="outline"
            size="md"
            onPress={() => navigation.navigate('TeacherDashboard')}
            fullWidth
            style={styles.btn}
          />
        </View>

        <FairCompetitionCard compact style={styles.fairPlay} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.xxl,
  },
  summaryCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  summaryTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  summarySub: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '900',
    color: theme.colors.purple,
  },
  metricLbl: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  podiumCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podiumBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  podiumInfo: {
    flex: 1,
  },
  podiumName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  podiumStats: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  btn: {
    marginBottom: theme.spacing.xs,
  },
  fairPlay: {
    marginTop: theme.spacing.xs,
  },
});
