import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, Card, Button, FairCompetitionCard, StatCard } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { mockTeacherAnalytics } from '../../data/mockData';

export const TeacherProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const { user, logout, switchRole } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Teacher Profile"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="briefcase" size={42} color={theme.colors.purple} />
          </View>
          <Text style={styles.name}>{user?.name || 'Prof. Sarah Miller'}</Text>
          <Text style={styles.email}>{user?.email || 'sarah.miller@mathsprint.edu'}</Text>
          <View style={styles.deptBadge}>
            <Text style={styles.deptText}>{user?.class || 'Department of Mathematics'}</Text>
          </View>
        </Card>

        {/* Teaching Metrics Snapshot */}
        <Text style={styles.sectionHeading}>Teaching Overview</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Class Students"
            value={mockTeacherAnalytics.totalStudents}
            sublabel="Class 10-A Roster"
            iconName="people"
            color={theme.colors.primary}
          />
          <StatCard
            label="Sprints Hosted"
            value={14}
            sublabel="Total Battles"
            iconName="flash"
            color={theme.colors.purple}
          />
        </View>

        <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
          <StatCard
            label="Avg Class Score"
            value={mockTeacherAnalytics.averageScore}
            sublabel="Class Points"
            iconName="trophy"
            color={theme.colors.orange}
          />
          <StatCard
            label="Participation"
            value={`${mockTeacherAnalytics.participationRate}%`}
            sublabel="28 of 32 Active"
            iconName="checkmark-done"
            color={theme.colors.green}
          />
        </View>

        {/* Fair Play Shield */}
        <FairCompetitionCard style={styles.fairPlay} />

        {/* Action Controls */}
        <View style={styles.actions}>
          <Button
            title="Switch to Student Arena"
            variant="primary"
            size="md"
            leftIcon={<Ionicons name="school-outline" size={18} color="#FFF" />}
            onPress={() => switchRole('student')}
            fullWidth
            style={styles.btn}
          />

          <Button
            title="Log Out"
            variant="outline"
            size="md"
            leftIcon={<Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />}
            onPress={logout}
            fullWidth
            style={styles.btn}
          />
        </View>
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
  profileCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  name: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  email: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  deptBadge: {
    backgroundColor: theme.colors.purpleLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: 8,
  },
  deptText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.purpleDark,
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
  fairPlay: {
    marginVertical: theme.spacing.md,
  },
  actions: {
    gap: theme.spacing.xs,
  },
  btn: {
    marginBottom: theme.spacing.xs,
  },
});
