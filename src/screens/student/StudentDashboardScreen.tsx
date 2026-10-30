import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import {
  Button,
  Card,
  Header,
  StatCard,
  SprintCard,
  Badge,
  FairCompetitionCard,
} from '../../components/common';
import { SoloSpeedModal } from '../../components/student/SoloSpeedModal';
import { useAuth } from '../../context/AuthContext';
import { mockStudentPerformance } from '../../data/mockData';
import { SprintApi } from '../../services/api/sprintApi';

export const StudentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { user, switchRole } = useAuth();
  const [performance, setPerformance] = useState<any>(mockStudentPerformance);
  const [showSoloModal, setShowSoloModal] = useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;
    const loadTelemetry = async () => {
      try {
        const perf = await SprintApi.getStudentPerformance();
        if (isMounted && perf) {
          setPerformance(perf);
        }
      } catch (err) {
        console.warn('[StudentDashboard] Telemetry fallback:', err);
      }
    };
    loadTelemetry();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Student Arena"
        subtitle={`Welcome back, ${user?.name || 'Aarav'}!`}
        rightElement={
          <Button
            title="Teacher View"
            size="sm"
            variant="ghost"
            leftIcon={<Ionicons name="swap-horizontal" size={14} color={theme.colors.primary} />}
            onPress={() => switchRole('teacher')}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Prominent Hero JOIN SPRINT Card */}
        <Card variant="accentBlue" style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroTextCol}>
              <Badge label="⚡ 2-MINUTE BATTLE READY" variant="cyan" size="sm" />
              <Text style={styles.heroTitle}>Live MathSprint Arena</Text>
              <Text style={styles.heroSubtitle}>
                Enter the classroom 6-digit PIN to battle live against classmates with dynamic scoring & streak bonuses!
              </Text>
            </View>
            <View style={styles.heroIconCircle}>
              <Ionicons name="flash" size={32} color={theme.colors.primary} />
            </View>
          </View>
          
          <Button
            title="JOIN SPRINT NOW"
            variant="primary"
            size="lg"
            leftIcon={<Ionicons name="keypad" size={20} color="#FFF" />}
            onPress={() => navigation.navigate('JoinSprint')}
            fullWidth
            style={styles.joinBtn}
          />

          <Button
            title="⚡ SOLO SPEED BLITZ (OFFLINE)"
            variant="outline"
            size="md"
            leftIcon={<Ionicons name="stopwatch-outline" size={18} color={theme.colors.primary} />}
            onPress={() => setShowSoloModal(true)}
            fullWidth
            style={styles.soloBtn}
          />
        </Card>

        {/* 4 Core Stat Cards: Rank, Total Points, Accuracy, Best Streak */}
        <Text style={styles.sectionHeading}>Your Sprint Metrics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Current Rank"
            value={`#${performance.currentRank || 2}`}
            sublabel="Class 10-A Podium"
            iconName="trophy"
            color={theme.colors.orange}
          />
          <StatCard
            label="Total Points"
            value={performance.overallScore || 0}
            sublabel="Career Points"
            iconName="flash"
            color={theme.colors.primary}
          />
        </View>
        <View style={[styles.statsGrid, { marginTop: theme.spacing.xs }]}>
          <StatCard
            label="Accuracy"
            value={`${performance.overallAccuracy || 0}%`}
            sublabel="Last 10 battles"
            iconName="checkmark-done"
            color={theme.colors.green}
          />
          <StatCard
            label="Best Streak"
            value={`${performance.bestStreak || 0}x`}
            sublabel="Multiplier Boost"
            iconName="flame"
            color={theme.colors.purple}
          />
        </View>

        {/* Weak Topic & Recommended Practice Section */}
        <Text style={styles.sectionHeading}>AI Adaptive Practice</Text>
        <Card variant="accentPurple" style={styles.recCard}>
          <View style={styles.recHeader}>
            <Badge label="WEAK TOPIC DETECTED" variant="danger" size="sm" />
            <Ionicons name="bulb-outline" size={20} color={theme.colors.purple} />
          </View>
          <Text style={styles.recTitle}>Algebra: Multi-step Linear Equations</Text>
          <Text style={styles.recDesc}>
            Your average response time on Algebra is 9.4s (62% accuracy). Solving 5 quick equations will boost your speed by 30%!
          </Text>
          <View style={styles.recActions}>
            <Button
              title="START PRACTICE DRILL"
              variant="secondary"
              size="sm"
              leftIcon={<Ionicons name="play" size={14} color="#FFF" />}
              onPress={() => navigation.navigate('Recommendations')}
            />
            <Button
              title="View All Advice"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('Recommendations')}
            />
          </View>
        </Card>

        {/* Recent Results / Sprint History */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Recent Results</Text>
          <Button
            title="Full History →"
            size="sm"
            variant="ghost"
            onPress={() => navigation.navigate('History')}
          />
        </View>

        <SprintCard
          title="Math Logic Battle"
          topic="Arithmetic • Logic"
          dateOrTime="Today, 9:30 AM"
          duration="02:00"
          score={920}
          accuracy={90}
          rank={2}
          statusBadge="PODIUM"
          onPress={() => navigation.navigate('FinalResult', { lobbyId: 'lobby-101' })}
        />

        <SprintCard
          title="Speed Math Sprint #14"
          topic="Mental Multiplication"
          dateOrTime="Yesterday, 2:15 PM"
          duration="02:00"
          score={880}
          accuracy={85}
          rank={3}
          onPress={() => navigation.navigate('History')}
        />

        {/* Fair Play Shield Section */}
        <FairCompetitionCard style={styles.fairPlay} />
      </ScrollView>

      {/* Offline Solo Speed Blitz Practice Modal */}
      <SoloSpeedModal
        visible={showSoloModal}
        onClose={() => setShowSoloModal(false)}
      />
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
  heroCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  heroTextCol: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  heroTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
  },
  heroSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  heroIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtn: {
    marginTop: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  soloBtn: {
    marginTop: theme.spacing.xs,
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.primary,
  },
  sectionHeading: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  recCard: {
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  recDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  recActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  fairPlay: {
    marginTop: theme.spacing.md,
  },
});
