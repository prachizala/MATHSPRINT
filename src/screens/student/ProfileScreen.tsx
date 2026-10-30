import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, Card, Button, FairCompetitionCard, StatCard } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { mockStudentPerformance } from '../../data/mockData';
import { SensoryFeedback } from '../../utils/audioFeedback';

type Props = NativeStackScreenProps<StudentStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, switchRole } = useAuth();
  const [hapticsEnabled, setHapticsEnabled] = useState(SensoryFeedback.isEnabled());

  const handleToggleHaptics = (val: boolean) => {
    setHapticsEnabled(val);
    SensoryFeedback.setEnabled(val);
    if (val) {
      SensoryFeedback.triggerCorrectAnswer();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Student Profile"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar & Info Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={44} color={theme.colors.primary} />
          </View>
          <Text style={styles.name}>{user?.name || 'Aarav'}</Text>
          <Text style={styles.email}>{user?.email || 'aarav@mathsprint.edu'}</Text>
          <View style={styles.classBadge}>
            <Text style={styles.classText}>{user?.class || 'Class 10-A'}</Text>
          </View>
        </Card>

        {/* Career Stats Snapshot */}
        <Text style={styles.sectionHeading}>Career Statistics</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Rank"
            value={`#${mockStudentPerformance.currentRank}`}
            sublabel="Class 10-A"
            iconName="trophy"
            color={theme.colors.orange}
          />
          <StatCard
            label="Accuracy"
            value={`${mockStudentPerformance.overallAccuracy}%`}
            sublabel="All Time"
            iconName="checkmark-circle"
            color={theme.colors.green}
          />
        </View>

        <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
          <StatCard
            label="Total Points"
            value={mockStudentPerformance.overallScore}
            sublabel="Score Earned"
            iconName="flash"
            color={theme.colors.primary}
          />
          <StatCard
            label="Sprints Played"
            value={mockStudentPerformance.totalSprints}
            sublabel="2-Min Battles"
            iconName="timer"
            color={theme.colors.purple}
          />
        </View>

        {/* Battle Sensory Preferences */}
        <Text style={styles.sectionHeading}>Battle Preferences</Text>
        <Card variant="elevated" style={styles.prefCard}>
          <View style={styles.prefRow}>
            <View style={styles.prefTextCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="phone-portrait-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.prefTitle}>Haptic Sensory Feedback</Text>
              </View>
              <Text style={styles.prefDesc}>Vibrate on correct answers, streak fire bonuses, and 10s countdown</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </Card>

        {/* Non-invasive Fair Competition Protection */}
        <FairCompetitionCard style={styles.fairPlay} />

        {/* Action Controls */}
        <View style={styles.actions}>
          <Button
            title="Switch to Teacher Hub"
            variant="secondary"
            size="md"
            leftIcon={<Ionicons name="briefcase-outline" size={18} color="#FFF" />}
            onPress={() => switchRole('teacher')}
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
    backgroundColor: theme.colors.primaryLight,
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
  classBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: 8,
  },
  classText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryDark,
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
  prefCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  prefTextCol: {
    flex: 1,
  },
  prefTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  prefDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
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
