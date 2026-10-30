import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Button, Card, Header, Badge, StatCard, FairCompetitionCard } from '../../components/common';
import { mockStudentPerformance } from '../../data/mockData';
import { SprintApi } from '../../services/api/sprintApi';

type Props = NativeStackScreenProps<StudentStackParamList, 'FinalResult'>;

export const FinalResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const lobbyId = route.params?.lobbyId || 'lobby-101';
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchResult = async () => {
      try {
        const data = await SprintApi.getSprintResult(lobbyId);
        if (isMounted && data) {
          setResult(data);
        }
      } catch (err) {
        console.warn('[FinalResultScreen] Result fetch fallback:', err);
      }
    };
    fetchResult();
    return () => {
      isMounted = false;
    };
  }, [lobbyId]);

  const finalScore = result?.score !== undefined ? result.score : mockStudentPerformance.overallScore;
  const accuracy = result?.accuracy !== undefined ? result.accuracy : mockStudentPerformance.overallAccuracy;
  const streak = result?.streak !== undefined ? result.streak : mockStudentPerformance.bestStreak;
  const correctCount = result?.correctAnswers !== undefined ? result.correctAnswers : 9;
  const totalQuestions = result?.totalQuestions !== undefined ? result.totalQuestions : 10;
  const sprintTitle = result?.sprintName || 'Math Logic Battle';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Sprint Completed!" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Celebration Banner */}
        <View style={styles.banner}>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={44} color={theme.colors.primary} />
          </View>
          <Text style={styles.congratsTitle}>Challenge Completed!</Text>
          <Text style={styles.congratsSubtitle}>
            "{sprintTitle}" • 2-Minute Sprint Battle
          </Text>
          <Badge
            label="PODIUM FINISHER"
            variant="orange"
            size="md"
            style={styles.podiumBadge}
          />
        </View>

        {/* 6 Required Detailed Metrics Grid */}
        <Text style={styles.metricsHeading}>Battle Performance Summary</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Final Score"
            value={finalScore}
            sublabel="Base + Speed + Streak"
            iconName="flash"
            color={theme.colors.primary}
          />
          <StatCard
            label="Class Rank"
            value={`#${result?.rank !== undefined ? result.rank : mockStudentPerformance.currentRank}`}
            sublabel="Real-time Standing"
            iconName="trophy"
            color={theme.colors.orange}
          />
        </View>

        <View style={[styles.statsGrid, { marginTop: theme.spacing.sm }]}>
          <StatCard
            label="Accuracy"
            value={`${accuracy}%`}
            sublabel={`${correctCount} of ${totalQuestions} Correct`}
            iconName="checkmark-circle"
            color={theme.colors.green}
          />
          <StatCard
            label="Best Streak"
            value={`${streak}x`}
            sublabel={streak > 0 ? `+${streak * 10} Bonus Points` : 'No Streak'}
            iconName="flame"
            color={theme.colors.purple}
          />
        </View>

        <View style={[styles.statsGrid, { marginTop: theme.spacing.sm }]}>
          <StatCard
            label="Questions Correct"
            value={`${correctCount} / ${totalQuestions}`}
            sublabel={`${totalQuestions - correctCount} Missed`}
            iconName="checkbox-outline"
            color={theme.colors.cyan}
          />
          <StatCard
            label="Fastest Response"
            value={result?.fastestResponseMs ? `${(result.fastestResponseMs / 1000).toFixed(1)}s` : '1.4s'}
            sublabel="Mental Math Speed"
            iconName="timer-outline"
            color={theme.colors.primaryDark}
          />
        </View>

        {/* Action Buttons: VIEW SOLUTIONS, VIEW PERFORMANCE, PLAY AGAIN */}
        <View style={styles.actionsContainer}>
          <Button
            title="VIEW SOLUTIONS & EXPLANATIONS"
            variant="primary"
            size="lg"
            leftIcon={<Ionicons name="book-outline" size={20} color="#FFF" />}
            onPress={() => navigation.navigate('Solutions', { lobbyId })}
            fullWidth
            style={styles.actionBtn}
          />

          <Button
            title="VIEW STUDENT PERFORMANCE"
            variant="outline"
            size="md"
            leftIcon={<Ionicons name="analytics-outline" size={18} color={theme.colors.primary} />}
            onPress={() => navigation.navigate('Performance')}
            fullWidth
            style={styles.actionBtn}
          />

          <Button
            title="PLAY AGAIN (JOIN NEW SPRINT)"
            variant="orange"
            size="md"
            leftIcon={<Ionicons name="refresh" size={18} color="#FFF" />}
            onPress={() => navigation.navigate('JoinSprint')}
            fullWidth
            style={styles.actionBtn}
          />

          <Button
            title="Back to Dashboard"
            variant="ghost"
            size="md"
            onPress={() => navigation.navigate('StudentDashboard')}
            fullWidth
            style={styles.actionBtn}
          />
        </View>

        {/* Fair Play Protection */}
        <FairCompetitionCard style={styles.fairPlay} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.xxl,
  },
  banner: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  trophyCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.primaryGlow,
  },
  congratsTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  congratsSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  podiumBadge: {
    marginTop: theme.spacing.sm,
  },
  metricsHeading: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionsContainer: {
    marginTop: theme.spacing.lg,
  },
  actionBtn: {
    marginBottom: theme.spacing.sm,
  },
  fairPlay: {
    marginTop: theme.spacing.sm,
  },
});
