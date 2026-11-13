import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, Card, StatCard, TopicCard, Button, FairCompetitionCard } from '../../components/common';
import { mockStudentPerformance } from '../../data/mockData';
import { SprintApi } from '../../services/api/sprintApi';

type Props = NativeStackScreenProps<StudentStackParamList, 'Performance'>;

export const PerformanceScreen: React.FC<Props> = ({ navigation }) => {
  const [performance, setPerformance] = useState<any>(mockStudentPerformance);

  useEffect(() => {
    let isMounted = true;
    const fetchPerf = async () => {
      try {
        const data = await SprintApi.getStudentPerformance();
        if (isMounted && data) {
          setPerformance(data);
        }
      } catch (e) {
        console.warn('[PerformanceScreen] Fetch error:', e);
      }
    };
    fetchPerf();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Student Performance"
        subtitle="Topic breakdown & learning curve"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Career High-Level Overview */}
        <Text style={styles.sectionHeading}>Overall Career Statistics</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Score"
            value={performance.overallScore || 0}
            sublabel="Career Points"
            iconName="flash"
            color={theme.colors.primary}
          />
          <StatCard
            label="Accuracy"
            value={`${performance.overallAccuracy || 0}%`}
            sublabel="Overall Correct"
            iconName="checkmark-done"
            color={theme.colors.green}
          />
        </View>
        <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
          <StatCard
            label="Best Streak"
            value={`${performance.bestStreak || 0}x`}
            sublabel="Peak Multiplier"
            iconName="flame"
            color={theme.colors.purple}
          />
          <StatCard
            label="Sprints Played"
            value={performance.totalSprints || mockStudentPerformance.totalSprints}
            sublabel="2-Min Battles"
            iconName="timer-outline"
            color={theme.colors.cyan}
          />
        </View>

        {/* Topic Breakdown with Clear STRONG / MEDIUM / WEAK Labels */}
        <Text style={[styles.sectionHeading, { marginTop: theme.spacing.lg }]}>
          Topic Mastery & Skill Levels
        </Text>

        {(performance.topics || mockStudentPerformance.topics).map((topic: any, idx: number) => (
          <TopicCard
            key={idx}
            name={topic.name}
            accuracy={topic.accuracy}
            level={topic.level as 'STRONG TOPIC' | 'MEDIUM TOPIC' | 'WEAK TOPIC'}
            color={topic.color}
            description={topic.description}
            speedAvg={topic.speedAvg}
          />
        ))}

        {/* Weak Topic Action Banner */}
        <Card variant="accentPurple" style={styles.ctaCard}>
          <View style={styles.ctaRow}>
            <View style={styles.ctaInfo}>
              <Text style={styles.ctaTitle}>
                Boost Your Weak Topic: {performance.weakestTopic || 'Algebra'}
              </Text>
              <Text style={styles.ctaDesc}>
                Targeted 2-minute practice drills on {performance.weakestTopic || 'Algebra'} will raise your ranking to #1!
              </Text>
            </View>
            <Button
              title="Practice"
              variant="secondary"
              size="sm"
              onPress={() => navigation.navigate('Recommendations')}
            />
          </View>
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
  ctaCard: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  ctaTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  ctaDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  fairPlay: {
    marginTop: theme.spacing.md,
  },
});
