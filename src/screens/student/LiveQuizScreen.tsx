import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import {
  Button,
  Card,
  TimerCard,
  ProgressBar,
  Badge,
  QuestionOption,
  FairCompetitionCard,
} from '../../components/common';
import { mockQuestions, mockLobby } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { formatPoints } from '../../utils/formatters';
import { SprintApi } from '../../services/api/sprintApi';
import { RealtimeService } from '../../services/firebase/realtimeService';
import { Question } from '../../types';
import { SoundEffects } from '../../utils/soundEffects';

type Props = NativeStackScreenProps<StudentStackParamList, 'LiveQuiz'>;

export const LiveQuizScreen: React.FC<Props> = ({ route, navigation }) => {
  const lobbyId = route.params?.lobbyId || mockLobby.lobbyId;
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(120); // Exactly 2 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState(false);
  const [teacherAnnouncement, setTeacherAnnouncement] = useState<{ message: string; timestamp: number } | null>(null);
  const [rivalryText, setRivalryText] = useState<string>('');

  // Adaptive AI Difficulty Engine states
  const [eloRating, setEloRating] = useState<number>(1200);
  const [lastEloDelta, setLastEloDelta] = useState<number | null>(null);
  const [adaptiveHardTriggered, setAdaptiveHardTriggered] = useState<boolean>(false);

  const questionStartTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number>(Date.now() + 120000);
  const isFinishedRef = useRef(false);
  const isPausedRef = useRef(false);

  const handleSprintFinish = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    SoundEffects.playBattleFinish();
    navigation.replace('FinalResult', { lobbyId });
  };

  // Load real sprint questions if available & subscribe to server authoritative timer
  useEffect(() => {
    let isMounted = true;
    let unsubLiveSprint: (() => void) | undefined;

    const fetchSprint = async () => {
      try {
        const sprintData = await SprintApi.getSprint(lobbyId);
        if (isMounted && sprintData?.questions && sprintData.questions.length > 0) {
          setQuestions(sprintData.questions);
        }
        if (sprintData?.endedAt) {
          endTimeRef.current = sprintData.endedAt;
        }
      } catch (err) {
        console.warn('[LiveQuiz] Sprint fetch fallback:', err);
      }
    };
    fetchSprint();

    // Subscribe to server-authoritative status and endTime in RTDB
    unsubLiveSprint = RealtimeService.listenToLiveSprint(lobbyId, (liveState) => {
      if (!isMounted) return;
      if (liveState.status === 'PAUSED') {
        setIsPaused(true);
        isPausedRef.current = true;
      } else if (liveState.status === 'LIVE' || liveState.status === 'ACTIVE') {
        setIsPaused(false);
        isPausedRef.current = false;
        if (liveState.endTime) {
          endTimeRef.current = liveState.endTime;
        }
      }
      if (liveState.status === 'ENDED') {
        handleSprintFinish();
      }
    });

    return () => {
      isMounted = false;
      unsubLiveSprint?.();
    };
  }, [lobbyId]);

  // Periodic Telemetry: Teacher Announcement & Head-to-Head Rivalry
  useEffect(() => {
    let isMounted = true;

    const pollLiveTelemetry = async () => {
      try {
        // 1. Check for active Teacher Broadcast Announcement
        const ann = await SprintApi.getAnnouncement(lobbyId);
        if (isMounted && ann?.message) {
          if (Date.now() - ann.timestamp < 45000) {
            setTeacherAnnouncement(ann);
          } else {
            setTeacherAnnouncement(null);
          }
        }

        // 2. Head-to-Head Rivalry Telemetry
        const lb = await SprintApi.getSprintLeaderboard(lobbyId);
        if (isMounted && Array.isArray(lb) && lb.length >= 2) {
          const myIdx = lb.findIndex(
            (p: any) => p.studentId === user?.userId || p.name === user?.name
          );
          if (myIdx === 0) {
            // Rank #1
            const nextContestant = lb[1];
            const gap = Math.max(10, (lb[0].score || score) - (nextContestant.score || 0));
            setRivalryText(`👑 DEFENDING LEAD: ${nextContestant.name} is ${gap} PTS behind!`);
          } else if (myIdx > 0) {
            const competitorAbove = lb[myIdx - 1];
            const gap = Math.max(10, (competitorAbove.score || 0) - score);
            setRivalryText(`⚔️ RIVAL ALERT: ${competitorAbove.name} (#${myIdx}) is +${gap} PTS ahead!`);
          } else {
            const leader = lb[0];
            setRivalryText(`⚔️ TARGET PODIUM: Chase #1 ${leader.name} (${leader.score} PTS)`);
          }
        }
      } catch (_) {}
    };

    pollLiveTelemetry();
    const interval = setInterval(pollLiveTelemetry, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lobbyId, score]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // 2-minute server-synced countdown timer
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
      setRemainingTime(remaining);
      if (remaining === 10 || remaining === 5) {
        SoundEffects.playCountdownTick();
      }
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleSprintFinish();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Submit Answer to Secure Backend
  const handleSubmitAnswer = async () => {
    if (!selectedOption || isSubmitted || isPaused || !currentQuestion) return;

    setIsSubmitted(true);
    const responseTimeMs = Date.now() - questionStartTimeRef.current;
    if (responseTimeMs < 3500) {
      setSpeedBonusAwarded(true);
    }

    try {
      const response = await SprintApi.submitAnswer(lobbyId, {
        questionId: currentQuestion.questionId,
        selectedAnswer: selectedOption,
        responseTimeMs,
      });

      if (response && response.correct !== undefined) {
        if (response.correct) {
          SoundEffects.playCorrect();
          const newStreak = (response.streak !== undefined) ? response.streak : streak + 1;
          setStreak(newStreak);
          if (newStreak > bestStreak) setBestStreak(newStreak);

          // Audio: Streak Fanfare on 2x, 3x, 5x
          if (newStreak >= 2) {
            SoundEffects.playStreakFanfare(newStreak);
          }

          // Adaptive AI Difficulty Engine:
          // If student has answered 3 questions in a row quickly (streak >= 3),
          // automatically trigger hard Algebra / Logic difficulty next!
          if (newStreak >= 3) {
            setAdaptiveHardTriggered(true);
            SoundEffects.playHardUpgradeAlert();

            // Reorder upcoming questions: pull hard Algebra/Logic problem to front
            setQuestions((prevQuestions) => {
              const remaining = [...prevQuestions];
              const upcomingIndex = currentIndex + 1;
              const hardCandidateIndex = remaining.findIndex(
                (q, idx) =>
                  idx > currentIndex &&
                  (q.difficulty === 'hard' || q.topic === 'Algebra' || q.topic === 'Logic')
              );
              if (hardCandidateIndex > -1 && hardCandidateIndex !== upcomingIndex) {
                const [targetQ] = remaining.splice(hardCandidateIndex, 1);
                remaining.splice(upcomingIndex, 0, targetQ);
              }
              return remaining;
            });
          }

          setCorrectCount((prev) => prev + 1);
        } else {
          SoundEffects.playIncorrect();
          setStreak(0);
          setAdaptiveHardTriggered(false);
        }

        if (response.totalScore !== undefined) {
          setScore(response.totalScore);
        } else if (response.pointsAwarded) {
          setScore((prev) => prev + response.pointsAwarded);
        }

        // Update Math Elo rating telemetry
        if ((response as any).eloRating) {
          setEloRating((response as any).eloRating);
          setLastEloDelta((response as any).eloDelta);
        }
      } else {
        // Fallback scoring
        SoundEffects.playCorrect();
        setScore((prev) => prev + 100);
        setStreak((prev) => prev + 1);
        setCorrectCount((prev) => prev + 1);
      }
    } catch (err) {
      console.warn('[LiveQuiz] Answer submission server fallback:', err);
      SoundEffects.playCorrect();
      setScore((prev) => prev + 100);
      setStreak((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
    }

    // Auto advance to next question after 800ms
    setTimeout(() => {
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsSubmitted(false);
        setSpeedBonusAwarded(false);
        questionStartTimeRef.current = Date.now();
      } else {
        handleSprintFinish();
      }
    }, 850);
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No questions available in this sprint.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header: Score, Elo Rating & Streak Pills */}
        <View style={styles.topMetricsRow}>
          <View style={styles.scoreTag}>
            <Ionicons name="flash" size={16} color={theme.colors.primary} />
            <Text style={styles.scoreText}>{formatPoints(score)} PTS</Text>
          </View>

          {/* Dynamic Math Elo Skill Rating Pill */}
          <View style={styles.eloTag}>
            <Ionicons name="stats-chart" size={14} color="#8B5CF6" />
            <Text style={styles.eloText}>{eloRating} ELO</Text>
            {lastEloDelta !== null && (
              <Text
                style={[
                  styles.eloDeltaText,
                  { color: lastEloDelta >= 0 ? theme.colors.green : theme.colors.danger },
                ]}
              >
                {lastEloDelta >= 0 ? `+${lastEloDelta}` : lastEloDelta}
              </Text>
            )}
          </View>

          {streak > 1 ? (
            <View style={styles.streakTag}>
              <Ionicons name="flame" size={16} color={theme.colors.orange} />
              <Text style={styles.streakText}>{streak}x Streak!</Text>
            </View>
          ) : (
            <Badge label="STREAK READY" variant="cyan" size="sm" />
          )}

          <Badge label={`Q${currentIndex + 1} / ${totalQuestions}`} variant="purple" size="md" />
        </View>

        {/* Prominent 2-Minute Sprint Countdown Timer */}
        <TimerCard
          remainingSeconds={remainingTime}
          totalSeconds={120}
          label={isPaused ? 'BATTLE PAUSED' : '2-MINUTE SPRINT TIMER'}
          style={styles.timerCard}
        />

        {/* Teacher Broadcast Announcement Banner */}
        {teacherAnnouncement && (
          <View style={styles.announcementBanner}>
            <Ionicons name="megaphone" size={16} color="#B45309" />
            <Text style={styles.announcementText} numberOfLines={2}>
              TEACHER: "{teacherAnnouncement.message}"
            </Text>
          </View>
        )}

        {/* Head-to-Head Rivalry Telemetry Widget */}
        {rivalryText ? (
          <View style={styles.rivalryBar}>
            <Ionicons name="shield-half-outline" size={14} color={theme.colors.purple} />
            <Text style={styles.rivalryText} numberOfLines={1}>
              {rivalryText}
            </Text>
          </View>
        ) : null}

        {/* Adaptive AI Hard Difficulty Upgrade Banner */}
        {adaptiveHardTriggered && !isPaused && (
          <View style={styles.hardUpgradeBanner}>
            <Ionicons name="sparkles" size={18} color="#FFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.hardUpgradeTitle}>🔥 3-STREAK AI SURGE: HARD DIFFICULTY UNLOCKED!</Text>
              <Text style={styles.hardUpgradeSub}>Adaptive Engine switched to advanced Algebra & Multi-step Logic (+Bonus Elo)</Text>
            </View>
          </View>
        )}

        {/* Paused by Teacher Banner */}
        {isPaused && (
          <View style={styles.pausedBanner}>
            <Ionicons name="pause-circle" size={20} color={theme.colors.warning} />
            <Text style={styles.pausedBannerText}>
              BATTLE PAUSED BY TEACHER — TIMER FROZEN
            </Text>
          </View>
        )}

        {/* Dynamic Streak Fire Multiplier Banner */}
        {streak >= 2 && !isPaused && (
          <View style={styles.multiplierBanner}>
            <Ionicons name="flame" size={18} color="#FFF" />
            <Text style={styles.multiplierText}>
              🔥 {streak}X STREAK MULTIPLIER ACTIVE (+{streak * 10} PTS)
            </Text>
          </View>
        )}

        {/* Speed Bonus Pill */}
        {speedBonusAwarded && (
          <View style={styles.speedBonusPill}>
            <Ionicons name="flash" size={14} color={theme.colors.cyanDark} />
            <Text style={styles.speedBonusText}>⚡ Lightning Speed Bonus (+20 PTS)!</Text>
          </View>
        )}

        {/* Question Progress Bar */}
        <ProgressBar
          progress={(currentIndex + 1) / totalQuestions}
          label={`Question ${currentIndex + 1} of ${totalQuestions}`}
          showPercentage
          height={6}
          color={theme.colors.primary}
          style={styles.progressBar}
        />

        {/* Topic & Difficulty Meta Bar */}
        <View style={styles.metaRow}>
          <Badge label={String(currentQuestion.topic)} variant="primary" size="sm" />
          <Badge
            label={`${currentQuestion.difficulty.toUpperCase()} • ${currentQuestion.difficulty === 'hard' ? '+150 PTS (HARD)' : '+100 PTS'}`}
            variant={currentQuestion.difficulty === 'hard' ? 'purple' : 'cyan'}
            size="sm"
          />
        </View>

        {/* Question Prompt Card */}
        <Card variant="elevated" style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </Card>

        {/* 4 Multiple Choice Answer Options (Never reveal answer during active sprint) */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, idx) => (
            <QuestionOption
              key={idx}
              index={idx}
              text={option}
              isSelected={selectedOption === option}
              disabled={isSubmitted || isPaused}
              onPress={() => setSelectedOption(option)}
            />
          ))}
        </View>

        {/* SUBMIT ANSWER CTA */}
        <Button
          title={isPaused ? 'BATTLE PAUSED' : selectedOption ? 'SUBMIT ANSWER' : 'SELECT AN OPTION'}
          variant={selectedOption && !isPaused ? 'primary' : 'outline'}
          size="lg"
          disabled={!selectedOption || isSubmitted || isPaused}
          leftIcon={<Ionicons name="checkmark-circle" size={20} color={selectedOption && !isPaused ? '#FFF' : theme.colors.textMuted} />}
          onPress={handleSubmitAnswer}
          fullWidth
          style={styles.submitBtn}
        />

        {/* Non-invasive Fair Competition Protection */}
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
  scrollContent: {
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  topMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: 4,
  },
  scoreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  scoreText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    marginLeft: 3,
  },
  eloTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#C084FC',
    gap: 3,
  },
  eloText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '900',
    color: '#6B21A8',
  },
  eloDeltaText: {
    fontSize: 10,
    fontWeight: '800',
  },
  streakTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.orangeLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.orange,
  },
  streakText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    color: theme.colors.orangeDark,
    marginLeft: 3,
  },
  timerCard: {
    marginBottom: theme.spacing.xs,
  },
  announcementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.xs,
  },
  announcementText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    flex: 1,
  },
  rivalryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderRadius: theme.borderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.xs,
  },
  rivalryText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.purple,
  },
  hardUpgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.xs,
  },
  hardUpgradeTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.4,
  },
  hardUpgradeSub: {
    fontSize: 9,
    color: '#DDD6FE',
    marginTop: 1,
  },
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.warningBackground,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.sm,
  },
  pausedBannerText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    color: theme.colors.warning,
    letterSpacing: 0.5,
  },
  multiplierBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.orange,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.sm,
  },
  multiplierText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  speedBonusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.cyanLight,
    borderWidth: 1,
    borderColor: theme.colors.cyan,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.sm,
    alignSelf: 'center',
  },
  speedBonusText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.cyanDark,
  },
  progressBar: {
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  questionCard: {
    padding: theme.spacing.xl,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  questionText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: theme.spacing.xs,
  },
  submitBtn: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  fairPlay: {
    marginTop: theme.spacing.sm,
  },
});
