import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, Card, ProgressBar, StatCard, Badge, FairCompetitionCard } from '../../components/common';
import { mockTeacherAnalytics, mockLeaderboard } from '../../data/mockData';
import { formatPoints } from '../../utils/formatters';
import { SprintApi } from '../../services/api/sprintApi';

type Props = NativeStackScreenProps<TeacherStackParamList, 'Analytics'>;

export const AnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const [analytics, setAnalytics] = useState<any>(mockTeacherAnalytics);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        const data = await SprintApi.getTeacherAnalytics();
        if (isMounted && data) {
          setAnalytics(data);
        }
      } catch (e) {
        console.warn('[AnalyticsScreen] Fetch error:', e);
      }
    };
    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Teacher Analytics"
        subtitle="Class 10-A Sprint Diagnostics"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 5 Core Top Metrics */}
        <Text style={styles.sectionHeading}>Participation & Overall Scores</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Students"
            value={analytics.totalStudents || 32}
            sublabel="Class Roster"
            iconName="people"
            color={theme.colors.primary}
          />
          <StatCard
            label="Participated"
            value={analytics.studentsParticipated || 28}
            sublabel="Active Today"
            iconName="checkmark-circle"
            color={theme.colors.green}
          />
        </View>

        <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
          <StatCard
            label="Average Score"
            value={analytics.averageScore || 785}
            sublabel="Class Points"
            iconName="trophy"
            color={theme.colors.purple}
          />
          <StatCard
            label="Avg Accuracy"
            value={`${analytics.averageAccuracy || 81}%`}
            sublabel="Target: >80%"
            iconName="analytics"
            color={theme.colors.cyan}
          />
        </View>

        <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
          <StatCard
            label="Participation Rate"
            value={`${analytics.participationRate || 88}%`}
            sublabel="Active Contestants"
            iconName="pie-chart"
            color={theme.colors.orange}
          />
        </View>

        {/* Topic Performance with Progress Visualizations */}
        <Text style={[styles.sectionHeading, { marginTop: theme.spacing.lg }]}>Topic Performance</Text>
        <Card variant="elevated" style={styles.card}>
          {mockTeacherAnalytics.topicPerformance.map((topic, idx) => (
            <View key={idx} style={styles.topicRow}>
              <ProgressBar
                progress={topic.accuracy / 100}
                label={`${topic.topic} (${topic.status})`}
                showPercentage
                color={topic.color}
                height={8}
              />
            </View>
          ))}
        </Card>

        {/* Class Weak Area Insight */}
        <Card variant="accentOrange" style={styles.card}>
          <View style={styles.insightHeader}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
            <Text style={styles.insightTitle}>Class Weak Area: {mockTeacherAnalytics.classWeakArea}</Text>
          </View>
          <Text style={styles.insightDesc}>
            Students averaged 9.4s on two-step linear algebra problems. Recommend launching an adaptive 2-minute algebra battle tomorrow.
          </Text>
        </Card>

        {/* Most Difficult vs Most Correct Questions */}
        <Text style={styles.sectionHeading}>Question Diagnostics</Text>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.qDiagItem}>
            <View style={styles.qBadgeRow}>
              <Badge label="MOST DIFFICULT" variant="danger" size="sm" />
              <Text style={styles.qStatText}>54% Accuracy</Text>
            </View>
            <Text style={styles.qText}>{mockTeacherAnalytics.mostDifficultQuestion}</Text>
          </View>

          <View style={[styles.qDiagItem, { borderBottomWidth: 0 }]}>
            <View style={styles.qBadgeRow}>
              <Badge label="MOST CORRECT" variant="green" size="sm" />
              <Text style={styles.qStatText}>96% Accuracy</Text>
            </View>
            <Text style={styles.qText}>{mockTeacherAnalytics.mostCorrectQuestion}</Text>
          </View>
        </Card>

        {/* Student Ranking Table */}
        <Text style={styles.sectionHeading}>Class 10-A Student Ranking</Text>
        <Card variant="elevated" style={styles.card}>
          {mockLeaderboard.map((student) => (
            <View key={student.studentId} style={styles.rankRow}>
              <Text style={styles.rankNum}>#{student.rank}</Text>
              <Text style={styles.rankName}>{student.name}</Text>
              <Text style={styles.rankAcc}>{student.accuracy}%</Text>
              <Text style={styles.rankScore}>{formatPoints(student.score)} pts</Text>
            </View>
          ))}
        </Card>

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
  sectionHeading: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  topicRow: {
    marginBottom: theme.spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    color: theme.colors.danger,
  },
  insightDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  qDiagItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  qBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  qStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  qText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rankNum: {
    width: 32,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    color: theme.colors.purple,
  },
  rankName: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  rankAcc: {
    width: 60,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  rankScore: {
    width: 75,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'right',
  },
  fairPlay: {
    marginTop: theme.spacing.xs,
  },
});
