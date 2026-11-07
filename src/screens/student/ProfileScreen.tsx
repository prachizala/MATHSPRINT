import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, Card, Button, FairCompetitionCard, StatCard, Badge as StatusBadge } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { mockStudentPerformance } from '../../data/mockData';
import { SensoryFeedback } from '../../utils/audioFeedback';
import { SoundEffects } from '../../utils/soundEffects';
import { AchievementEngine, AchievementBadge } from '../../utils/achievementEngine';
import { EloEngine } from '../../utils/eloEngine';

type Props = NativeStackScreenProps<StudentStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, switchRole } = useAuth();
  const [hapticsEnabled, setHapticsEnabled] = useState(SensoryFeedback.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(SoundEffects.isEnabled());
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);

  const eloInfo = EloEngine.getRankInfo(mockStudentPerformance.overallScore ? 1200 + Math.round(mockStudentPerformance.overallScore * 0.2) : 1380);

  const achievements = AchievementEngine.evaluateAchievements({
    overallScore: mockStudentPerformance.overallScore,
    overallAccuracy: mockStudentPerformance.overallAccuracy,
    bestStreak: mockStudentPerformance.bestStreak,
    totalSprints: mockStudentPerformance.totalSprints,
    currentRank: mockStudentPerformance.currentRank,
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleToggleHaptics = (val: boolean) => {
    setHapticsEnabled(val);
    SensoryFeedback.setEnabled(val);
    if (val) {
      SensoryFeedback.triggerCorrectAnswer();
    }
  };

  const handleToggleSound = (val: boolean) => {
    setSoundEnabled(val);
    SoundEffects.setEnabled(val);
    if (val) {
      SoundEffects.playCorrect();
    }
  };

  const handleTestChime = () => {
    SoundEffects.playStreakFanfare(3);
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

        {/* Dynamic Math Elo Rating Card (Chess-style Adaptive Skill Rating) */}
        <Card variant="accentBlue" style={styles.eloCard}>
          <View style={styles.eloHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flash" size={18} color={theme.colors.primary} />
              <Text style={styles.eloTitle}>Adaptive Math Elo Rating</Text>
            </View>
            <View style={[styles.eloTierBadge, { backgroundColor: eloInfo.badgeColor }]}>
              <Text style={styles.eloTierBadgeText}>{eloInfo.badgeLabel}</Text>
            </View>
          </View>
          <View style={styles.eloScoreRow}>
            <Text style={styles.eloRatingValue}>{eloInfo.rating}</Text>
            <Text style={styles.eloRatingSub}>ELO SKILL RATING</Text>
          </View>
          <Text style={styles.eloDesc}>
            Calculated dynamically per question based on difficulty, speed, and accuracy. Streaks of 3+ trigger Hard AI upgrades!
          </Text>
          <View style={styles.eloProgressTrack}>
            <View style={[styles.eloProgressFill, { width: `${eloInfo.progressPercent}%`, backgroundColor: eloInfo.badgeColor }]} />
          </View>
          <Text style={styles.eloNextTarget}>
            {eloInfo.rating} / {eloInfo.nextTierRating} Elo to Next Tier Rank
          </Text>
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

        {/* Sprint Trophies & Achievements Shelf */}
        <View style={styles.trophyHeaderRow}>
          <Text style={styles.sectionHeading}>Trophies & Badges</Text>
          <StatusBadge
            label={`${unlockedCount} / ${achievements.length} Unlocked`}
            variant="cyan"
            size="sm"
          />
        </View>

        <Card variant="elevated" style={styles.badgeShelfCard}>
          <View style={styles.badgeGrid}>
            {achievements.map((badge) => {
              const isSelected = selectedBadge?.id === badge.id;
              return (
                <TouchableOpacity
                  key={badge.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedBadge(isSelected ? null : badge)}
                  style={[
                    styles.badgeItem,
                    badge.unlocked ? styles.badgeItemUnlocked : styles.badgeItemLocked,
                    isSelected && styles.badgeItemSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.badgeIconCircle,
                      { backgroundColor: badge.unlocked ? `${badge.color}20` : '#F1F5F9' },
                    ]}
                  >
                    <Ionicons
                      name={badge.icon as any}
                      size={24}
                      color={badge.unlocked ? badge.color : theme.colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.badgeTitle,
                      { color: badge.unlocked ? theme.colors.textPrimary : theme.colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {badge.title}
                  </Text>
                  <View
                    style={[
                      styles.badgePill,
                      {
                        backgroundColor: badge.unlocked ? `${badge.color}15` : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgePillText,
                        { color: badge.unlocked ? badge.color : theme.colors.textSecondary },
                      ]}
                    >
                      {badge.progressLabel}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Badge Inspector Detail */}
          {selectedBadge && (
            <View style={styles.badgeDetailBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons
                  name={selectedBadge.icon as any}
                  size={20}
                  color={selectedBadge.unlocked ? selectedBadge.color : theme.colors.textMuted}
                />
                <Text style={styles.badgeDetailTitle}>{selectedBadge.title}</Text>
                <StatusBadge
                  label={selectedBadge.unlocked ? 'CLAIMED' : 'IN PROGRESS'}
                  variant={selectedBadge.unlocked ? 'green' : 'muted'}
                  size="sm"
                />
              </View>
              <Text style={styles.badgeDetailDesc}>{selectedBadge.description}</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${selectedBadge.progress}%`,
                      backgroundColor: selectedBadge.color,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </Card>

        {/* Battle Sensory & Sound Preferences */}
        <Text style={styles.sectionHeading}>Battle Preferences</Text>
        <Card variant="elevated" style={styles.prefCard}>
          {/* Web Audio API Sound Effects */}
          <View style={styles.prefRow}>
            <View style={styles.prefTextCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="volume-high-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.prefTitle}>Live Web Audio Chimes</Text>
              </View>
              <Text style={styles.prefDesc}>Procedural chimes for correct answers, streak fanfares, and metronome countdown ticks</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          {soundEnabled && (
            <TouchableOpacity onPress={handleTestChime} style={styles.testSoundBtn}>
              <Ionicons name="play" size={14} color={theme.colors.primary} />
              <Text style={styles.testSoundText}>Test Audio Chime</Text>
            </TouchableOpacity>
          )}

          <View style={styles.prefDivider} />

          {/* Haptic Sensory Feedback */}
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
  eloCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  eloHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eloTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  eloTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  eloTierBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
  },
  eloScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 4,
  },
  eloRatingValue: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  eloRatingSub: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  eloDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  eloProgressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  eloProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  eloNextTarget: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
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
  trophyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  badgeShelfCard: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  badgeItem: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
  },
  badgeItemUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    ...theme.shadows.sm,
  },
  badgeItemLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.7,
  },
  badgeItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  badgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  badgeDetailBox: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: theme.borderRadius.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  badgeDetailTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  badgeDetailDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginVertical: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
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
  prefDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  testSoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  testSoundText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
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
