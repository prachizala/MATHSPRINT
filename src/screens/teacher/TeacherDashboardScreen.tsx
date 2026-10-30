import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
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
import { useAuth } from '../../context/AuthContext';
import { mockTeacherAnalytics, mockLobby } from '../../data/mockData';
import { SprintApi } from '../../services/api/sprintApi';

export const TeacherDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const { user, switchRole } = useAuth();
  const [analytics, setAnalytics] = React.useState<any>(mockTeacherAnalytics);

  React.useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        const data = await SprintApi.getTeacherAnalytics();
        if (isMounted && data) {
          setAnalytics(data);
        }
      } catch (err) {
        console.warn('[TeacherDashboard] Analytics fallback:', err);
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
        title="Teacher Dashboard"
        subtitle={`Welcome, ${user?.name || 'Prof. Sarah Miller'}`}
        rightElement={
          <Button
            title="Student View"
            size="sm"
            variant="ghost"
            leftIcon={<Ionicons name="swap-horizontal" size={14} color={theme.colors.purple} />}
            onPress={() => switchRole('student')}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero CTA: CREATE NEW SPRINT */}
        <Card variant="accentPurple" style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroTextCol}>
              <Badge label="HOST 2-MIN BATTLE" variant="purple" size="sm" />
              <Text style={styles.heroTitle}>Launch Classroom Sprint</Text>
              <Text style={styles.heroSubtitle}>
                Generate a 6-digit lobby code, display real-time live contestants, and control the 02:00 battle clock.
              </Text>
            </View>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={28} color={theme.colors.purple} />
            </View>
          </View>
          <Button
            title="CREATE NEW SPRINT"
            variant="secondary"
            size="lg"
            leftIcon={<Ionicons name="add-circle" size={20} color="#FFF" />}
            onPress={() => navigation.navigate('CreateSprint')}
            fullWidth
            style={styles.createBtn}
          />
        </Card>

        {/* 4 Core Teacher Metrics: Total Students, Sprints Created, Avg Score, Participation Rate */}
        <Text style={styles.sectionHeading}>Classroom Metrics</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Students"
            value={analytics.totalStudents || 32}
            sublabel="Class 10-A Enrolled"
            iconName="people"
            color={theme.colors.primary}
          />
          <StatCard
            label="Sprints Created"
            value={analytics.totalSprints || 14}
            sublabel="Hosted Battles"
            iconName="flash"
            color={theme.colors.purple}
          />
        </View>

        <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
          <StatCard
            label="Avg Class Score"
            value={analytics.averageScore || 785}
            sublabel="Class 10-A Average"
            iconName="trophy"
            color={theme.colors.orange}
          />
          <StatCard
            label="Participation"
            value={`${analytics.participationRate || 88}%`}
            sublabel="Active Contestants"
            iconName="checkmark-done-circle"
            color={theme.colors.green}
          />
        </View>

        {/* LIVE SPRINTS Quick Access Card */}
        <Text style={[styles.sectionHeading, { marginTop: theme.spacing.lg }]}>Live Sprints & Lobbies</Text>
        <Card variant="accentBlue" style={styles.activeLobbyCard}>
          <View style={styles.activeRow}>
            <View style={styles.activeInfo}>
              <View style={styles.activeTagRow}>
                <Badge label="LOBBY READY" variant="cyan" size="sm" />
                <Text style={styles.pinText}>PIN: {mockLobby.code}</Text>
              </View>
              <Text style={styles.activeTitle}>{mockLobby.title}</Text>
              <Text style={styles.activeSub}>5 students connected • 02:00 duration</Text>
            </View>
            <Button
              title="Open Lobby"
              size="sm"
              variant="primary"
              leftIcon={<Ionicons name="eye-outline" size={14} color="#FFF" />}
              onPress={() => navigation.navigate('Lobby', { lobbyId: mockLobby.lobbyId })}
            />
          </View>
        </Card>

        {/* Navigation Quick Tools: ANALYTICS & QUESTION BANK */}
        <Text style={styles.sectionHeading}>Teacher Toolset</Text>
        <View style={styles.toolsRow}>
          <Button
            title="ANALYTICS"
            variant="outline"
            size="md"
            leftIcon={<Ionicons name="bar-chart-outline" size={18} color={theme.colors.primary} />}
            onPress={() => navigation.navigate('Analytics')}
            style={styles.toolBtn}
          />
          <Button
            title="QUESTION BANK"
            variant="outline"
            size="md"
            leftIcon={<Ionicons name="library-outline" size={18} color={theme.colors.primary} />}
            onPress={() => navigation.navigate('QuestionBank')}
            style={styles.toolBtn}
          />
        </View>

        {/* Recent Sprints */}
        <Text style={[styles.sectionHeading, { marginTop: theme.spacing.md }]}>Recent Hosted Sprints</Text>
        <SprintCard
          title="Math Logic Battle"
          topic="Arithmetic • Logic • Algebra"
          dateOrTime="Today, 9:30 AM"
          duration="02:00"
          participantCount={28}
          statusBadge="COMPLETED"
          onPress={() => navigation.navigate('Results', { lobbyId: 'lobby-101' })}
        />

        <SprintCard
          title="Speed Multiplication Warmup"
          topic="Mental Math"
          dateOrTime="Yesterday, 11:15 AM"
          duration="02:00"
          participantCount={30}
          statusBadge="COMPLETED"
          onPress={() => navigation.navigate('TeacherHistory')}
        />

        {/* Fair Competition Notice */}
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
  heroCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    marginTop: theme.spacing.xs,
    ...theme.shadows.sm,
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
  activeLobbyCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  activeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pinText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  activeTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  activeSub: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  toolBtn: {
    flex: 1,
  },
  fairPlay: {
    marginTop: theme.spacing.md,
  },
});
