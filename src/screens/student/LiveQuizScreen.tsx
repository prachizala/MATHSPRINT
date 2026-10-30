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

  const questionStartTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number>(Date.now() + 120000);
  const isFinishedRef = useRef(false);
  const isPausedRef = useRef(false);

  const handleSprintFinish = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
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

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // 2-minute server-synced countdown timer
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
      setRemainingTime(remaining);
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
      const serverResult = await SprintApi.submitAnswer(lobbyId, {
        questionId: currentQuestion.questionId,
        selectedAnswer: selectedOption,
        responseTimeMs,
      });

      setScore(serverResult.totalScore);
      setStreak(serverResult.streak);
      if (serverResult.correct) {
        setCorrectCount((prev) => prev + 1);
        if (serverResult.streak > bestStreak) setBestStreak(serverResult.streak);
      }
    } catch (err) {
      // Fallback local scoring if offline
      const isCorrect = selectedOption === currentQuestion.answer;
      if (isCorrect) {
        const newStreak = streak + 1;
        const speedBonus = responseTimeMs < 4000 ? 20 : 0;
        const streakBonus = newStreak * 10;
        const pointsEarned = 100 + speedBonus + streakBonus;
        setScore((prev) => prev + pointsEarned);
        setStreak(newStreak);
        setCorrectCount((prev) => prev + 1);
        if (newStreak > bestStreak) setBestStreak(newStreak);
      } else {
        setStreak(0);
      }
    }

    // Move to next question after brief 250ms transition
    setTimeout(() => {
      setSpeedBonusAwarded(false);
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsSubmitted(false);
        questionStartTimeRef.current = Date.now();
      } else {
        handleSprintFinish();
      }
    }, 250);
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Sprint Complete!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header: Score & Streak Pills */}
        <View style={styles.topMetricsRow}>
          <View style={styles.scoreTag}>
            <Ionicons name="flash" size={16} color={theme.colors.primary} />
            <Text style={styles.scoreText}>{formatPoints(score)} PTS</Text>
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
          <Badge label={`${currentQuestion.difficulty.toUpperCase()} • +100 PTS`} variant="cyan" size="sm" />
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
  },
  scoreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  scoreText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    marginLeft: 4,
  },
  streakTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.orangeLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.orange,
  },
  streakText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    color: theme.colors.orangeDark,
    marginLeft: 4,
  },
  timerCard: {
    marginBottom: theme.spacing.sm,
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
