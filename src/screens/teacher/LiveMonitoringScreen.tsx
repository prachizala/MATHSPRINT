import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import {
  Button,
  Card,
  Header,
  TimerCard,
  Badge,
  ProgressBar,
  FairCompetitionCard,
} from '../../components/common';
import { mockLeaderboard, mockLobby } from '../../data/mockData';
import { formatPoints, formatAccuracy } from '../../utils/formatters';
import { RealtimeService } from '../../services/firebase/realtimeService';
import { SprintApi } from '../../services/api/sprintApi';
import { LeaderboardEntry } from '../../types';

type Props = NativeStackScreenProps<TeacherStackParamList, 'LiveMonitoring'>;

export const LiveMonitoringScreen: React.FC<Props> = ({ route, navigation }) => {
  const lobbyId = route.params?.lobbyId || mockLobby.lobbyId;
  const [remainingTime, setRemainingTime] = useState(120);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [isEnding, setIsEnding] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [lastSentNotice, setLastSentNotice] = useState<string | null>(null);
  const isPausedRef = React.useRef(false);

  useEffect(() => {
    let isMounted = true;
    let unsubLeaderboard: (() => void) | undefined;
    let unsubSprint: (() => void) | undefined;

    // Listen to live leaderboard in RTDB
    unsubLeaderboard = RealtimeService.listenToLeaderboard(lobbyId, (lb) => {
      if (isMounted && lb.length > 0) {
        setLeaderboard(lb);
      }
    });

    // Listen to live sprint state
    unsubSprint = RealtimeService.listenToLiveSprint(lobbyId, (state) => {
      if (!isMounted) return;
      if (state.status === 'PAUSED') {
        setIsPaused(true);
        isPausedRef.current = true;
      } else if (state.status === 'LIVE' || state.status === 'ACTIVE') {
        setIsPaused(false);
        isPausedRef.current = false;
      }
      if (state.progress?.totalAnswered !== undefined) {
        setAnsweredCount(state.progress.totalAnswered);
      }
      if (state.progress?.averageScore !== undefined) {
        setAvgScore(state.progress.averageScore);
      }
      if (state.endTime && !isPausedRef.current) {
        const remaining = Math.max(0, Math.round((state.endTime - Date.now()) / 1000));
        setRemainingTime(remaining);
      }
    });

    const timer = setInterval(() => {
      if (!isPausedRef.current) {
        setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
      unsubLeaderboard?.();
      unsubSprint?.();
    };
  }, [lobbyId]);

  const handleTogglePause = async () => {
    setPauseLoading(true);
    try {
      if (isPaused) {
        await SprintApi.resumeSprint(lobbyId);
        setIsPaused(false);
        isPausedRef.current = false;
      } else {
        await SprintApi.pauseSprint(lobbyId);
        setIsPaused(true);
        isPausedRef.current = true;
      }
    } catch (err) {
      console.warn('Toggle pause error:', err);
    } finally {
      setPauseLoading(false);
    }
  };

  const handleSendAnnouncement = async (msg: string) => {
    if (!msg.trim()) return;
    setBroadcastSending(true);
    try {
      await SprintApi.sendAnnouncement(lobbyId, msg.trim());
      setLastSentNotice(msg.trim());
      setTimeout(() => setLastSentNotice(null), 4000);
    } catch (err: any) {
      Alert.alert('Broadcast Error', err.message || 'Failed to send announcement');
    } finally {
      setBroadcastSending(false);
    }
  };

  const handleCancelSprint = () => {
    Alert.alert(
      'Cancel Live Sprint',
      'Are you sure you want to cancel this live sprint battle? All connected students will return to their dashboards.',
      [
        { text: 'Keep Battle Active', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await SprintApi.cancelSprint(lobbyId);
            } catch (e) {
              console.warn('Cancel sprint error:', e);
            }
            navigation.navigate('TeacherDashboard');
          },
        },
      ]
    );
  };

  const handleEndSprint = async () => {
    setIsEnding(true);
    try {
      await SprintApi.endSprint(lobbyId);
    } catch (err) {
      console.warn('[LiveMonitoring] End sprint fallback:', err);
    } finally {
      setIsEnding(false);
      navigation.navigate('Results', { lobbyId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Live Monitoring"
        subtitle="Real-time classroom sprint telemetry"
        rightElement={
          <Badge
            label={isPaused ? 'BATTLE PAUSED' : 'LIVE BATTLE'}
            variant={isPaused ? 'cyan' : 'orange'}
            size="sm"
          />
        }
      />

      <View style={styles.content}>
        <Card variant="default" style={styles.titleCard}>
          <Text style={styles.sprintName}>MathSprint Championship</Text>
          <Text style={styles.topicName}>Topic: Arithmetic • Logic • Class 10-A</Text>
        </Card>

        {/* Live Timer */}
        <TimerCard
          remainingSeconds={remainingTime}
          totalSeconds={120}
          label={isPaused ? 'BATTLE PAUSED' : 'LIVE 2-MINUTE SPRINT TIMER'}
          style={styles.timerCard}
        />

        {/* Live Metrics Grid */}
        <View style={styles.telemetryGrid}>
          <Card variant="accentBlue" style={styles.telemetryCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderLbl}>Answers</Text>
              <Ionicons name="checkmark-done" size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.cardHeaderVal}>{answeredCount}</Text>
            <Text style={styles.cardHeaderSub}>Total Submissions</Text>
          </Card>

          <Card variant="accentPurple" style={styles.telemetryCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderLbl}>Class Avg</Text>
              <Ionicons name="trophy" size={16} color={theme.colors.purple} />
            </View>
            <Text style={styles.cardHeaderVal}>{avgScore}</Text>
            <Text style={styles.cardHeaderSub}>Points Average</Text>
          </Card>
        </View>

        {/* Teacher Live Announcement Broadcaster */}
        <Card variant="elevated" style={styles.broadcastCard}>
          <View style={styles.broadcastHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="megaphone" size={16} color={theme.colors.primary} />
              <Text style={styles.broadcastTitle}>Live Teacher Broadcaster</Text>
            </View>
            {lastSentNotice && (
              <Badge label="SENT TO CLASS" variant="green" size="sm" />
            )}
          </View>
          <Text style={styles.broadcastSub}>
            Tap a quick alert to push instant motivational notifications to students' quiz screens:
          </Text>
          <View style={styles.chipRow}>
            {[
              '⏰ Last 30 Seconds!',
              '🔥 Keep Streaks Up!',
              '⚡ Bonus Points Active!',
            ].map((msg) => (
              <TouchableOpacity
                key={msg}
                activeOpacity={0.7}
                disabled={broadcastSending}
                style={styles.broadcastChip}
                onPress={() => handleSendAnnouncement(msg)}
              >
                <Text style={styles.broadcastChipText}>{msg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Live Student Rankings */}
        <View style={styles.metaRow}>
          <Text style={styles.activeLabel}>Live Leaderboard</Text>
          <Badge label={`${leaderboard.length} Active Contestants`} variant="purple" size="sm" />
        </View>

        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.studentId}
          renderItem={({ item }) => (
            <Card variant="elevated" style={styles.studentCard}>
              <View style={styles.row}>
                <View style={styles.rankPill}>
                  <Text style={styles.rankText}>#{item.rank}</Text>
                </View>
                <View style={styles.nameCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Badge
                      label={item.status || (item.streak > 0 ? 'Answered' : 'Thinking')}
                      variant={item.status === 'Answered' || item.streak > 0 ? 'green' : 'cyan'}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.studentSub}>
                    {formatAccuracy(item.accuracy)} accuracy • {item.streak}x streak
                  </Text>
                </View>
                <View style={styles.scoreCol}>
                  <Text style={styles.scoreText}>{formatPoints(item.score)} PTS</Text>
                </View>
              </View>
            </Card>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* Battle Controls: Pause/Resume, End, Cancel */}
        <View style={styles.actionRow}>
          <Button
            title={isPaused ? 'RESUME BATTLE' : 'PAUSE BATTLE'}
            variant={isPaused ? 'primary' : 'outline'}
            size="md"
            loading={pauseLoading}
            leftIcon={
              <Ionicons
                name={isPaused ? 'play-circle' : 'pause-circle'}
                size={18}
                color={isPaused ? '#FFF' : theme.colors.warning}
              />
            }
            onPress={handleTogglePause}
            style={styles.pauseBtn}
          />

          <Button
            title={isEnding ? 'FINALIZING...' : 'END SPRINT'}
            variant="secondary"
            size="md"
            disabled={isEnding}
            leftIcon={<Ionicons name="flag" size={18} color="#FFF" />}
            onPress={handleEndSprint}
            style={styles.endBtn}
          />
        </View>

        <Button
          title="CANCEL SPRINT BATTLE"
          variant="ghost"
          size="sm"
          leftIcon={<Ionicons name="close-circle-outline" size={16} color={theme.colors.danger} />}
          onPress={handleCancelSprint}
          style={{ marginTop: 4 }}
        />

        <FairCompetitionCard compact style={styles.fairPlay} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.base,
  },
  titleCard: {
    marginBottom: theme.spacing.xs,
  },
  sprintName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  topicName: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  timerCard: {
    marginVertical: theme.spacing.xs,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: theme.spacing.xs,
  },
  telemetryCard: {
    flex: 1,
    padding: theme.spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardHeaderLbl: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  cardHeaderVal: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  cardHeaderSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  broadcastCard: {
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  broadcastHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  broadcastTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  broadcastSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  broadcastChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  broadcastChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  activeLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  list: {
    paddingBottom: theme.spacing.xs,
  },
  studentCard: {
    padding: theme.spacing.sm,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  rankText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    color: theme.colors.purple,
  },
  nameCol: {
    flex: 1,
  },
  studentName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  studentSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    color: theme.colors.purple,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: theme.spacing.xs,
  },
  pauseBtn: {
    flex: 1,
  },
  endBtn: {
    flex: 1,
  },
  fairPlay: {
    marginTop: theme.spacing.xs,
  },
});
