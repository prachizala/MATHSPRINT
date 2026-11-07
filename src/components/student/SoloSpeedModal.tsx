import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Button, Card, Badge, ProgressBar } from '../common';
import { mockQuestions } from '../../data/mockData';
import { Question } from '../../types';
import { SensoryFeedback } from '../../utils/audioFeedback';
import { SoundEffects } from '../../utils/soundEffects';

interface SoloSpeedModalProps {
  visible: boolean;
  onClose: () => void;
}

type GameState = 'SETUP' | 'PLAYING' | 'FINISHED';

export const SoloSpeedModal: React.FC<SoloSpeedModalProps> = ({ visible, onClose }) => {
  const [gameState, setGameState] = useState<GameState>('SETUP');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Game gameplay state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startBlitz = () => {
    let pool = [...mockQuestions];
    if (selectedTopic !== 'All') {
      const filtered = pool.filter((q) => q.topic.toLowerCase() === selectedTopic.toLowerCase());
      if (filtered.length >= 3) {
        pool = filtered;
      }
    }
    // Shuffle
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 8);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setTimeLeft(60);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setGameState('PLAYING');
  };

  // Clock countdown during PLAYING state
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            SoundEffects.playBattleFinish();
            setGameState('FINISHED');
            return 0;
          }
          if (prev === 10 || prev === 5) {
            SoundEffects.playCountdownTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked || gameState !== 'PLAYING') return;

    setSelectedOption(opt);
    setIsAnswerChecked(true);

    const currentQ = questions[currentIndex];
    const isCorrect = currentQ && opt === currentQ.answer;

    if (isCorrect) {
      SoundEffects.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      if (newStreak >= 3) {
        SoundEffects.playStreakFanfare(newStreak);
      }

      // Calculation: Base 100 + speed bonus + streak multiplier
      const speedBonus = Math.max(0, Math.round(timeLeft * 1.5));
      const multiplier = Math.min(3, 1 + newStreak * 0.25);
      const earned = Math.round((100 + speedBonus) * multiplier);
      setScore((prev) => prev + earned);
      setCorrectCount((prev) => prev + 1);
    } else {
      SoundEffects.playIncorrect();
      setStreak(0);
    }

    // Auto proceed to next question after 800ms
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswerChecked(false);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        SoundEffects.playBattleFinish();
        setGameState('FINISHED');
      }
    }, 850);
  };

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('SETUP');
    onClose();
  };

  const currentQ = questions[currentIndex];
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>⚡ Solo Speed Blitz</Text>
            <Text style={styles.headerSubtitle}>Offline Single-Player Mode</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* SETUP SCREEN */}
          {gameState === 'SETUP' && (
            <View>
              <Card variant="accentBlue" style={styles.introCard}>
                <View style={styles.introRow}>
                  <View style={{ flex: 1 }}>
                    <Badge label="ZERO NETWORK REQUIRED" variant="green" size="sm" />
                    <Text style={styles.introTitle}>Instant Practice Arena</Text>
                    <Text style={styles.introDesc}>
                      Sharpen your mental math speed before live classroom battles. 60-second timer, streak bonuses, and instant solutions!
                    </Text>
                  </View>
                  <View style={styles.clockCircle}>
                    <Ionicons name="stopwatch" size={36} color={theme.colors.primary} />
                  </View>
                </View>
              </Card>

              {/* Topic Filter */}
              <Text style={styles.sectionLabel}>Select Practice Topic</Text>
              <View style={styles.chipRow}>
                {['All', 'Arithmetic', 'Algebra', 'Logic', 'Fractions'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, selectedTopic === t && styles.chipActive]}
                    onPress={() => setSelectedTopic(t)}
                  >
                    <Text style={[styles.chipText, selectedTopic === t && styles.chipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Difficulty */}
              <Text style={[styles.sectionLabel, { marginTop: theme.spacing.md }]}>
                Difficulty Level
              </Text>
              <View style={styles.chipRow}>
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.chip, selectedDifficulty === d && styles.chipActive]}
                    onPress={() => setSelectedDifficulty(d)}
                  >
                    <Text style={[styles.chipText, selectedDifficulty === d && styles.chipTextActive]}>
                      {d.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Ready Action */}
              <Button
                title="START 60s BLITZ NOW"
                variant="primary"
                size="lg"
                leftIcon={<Ionicons name="play" size={20} color="#FFF" />}
                onPress={startBlitz}
                fullWidth
                style={{ marginTop: theme.spacing.xl }}
              />
            </View>
          )}

          {/* PLAYING SCREEN */}
          {gameState === 'PLAYING' && currentQ && (
            <View>
              {/* Telemetry Bar: Timer, Score, Streak */}
              <View style={styles.liveBar}>
                <View style={styles.timerPill}>
                  <Ionicons
                    name="timer-outline"
                    size={16}
                    color={timeLeft <= 10 ? theme.colors.danger : theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.timerText,
                      timeLeft <= 10 && { color: theme.colors.danger },
                    ]}
                  >
                    {timeLeft}s
                  </Text>
                </View>

                {streak >= 2 && (
                  <View style={styles.streakPill}>
                    <Text style={styles.streakText}>🔥 {streak}x STREAK</Text>
                  </View>
                )}

                <View style={styles.scorePill}>
                  <Text style={styles.scoreText}>{score} PTS</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <ProgressBar
                progress={(currentIndex + 1) / questions.length}
                color={theme.colors.primary}
                height={6}
                style={{ marginVertical: theme.spacing.sm }}
              />

              <Text style={styles.qCounter}>
                Question {currentIndex + 1} of {questions.length} • {currentQ.topic}
              </Text>

              {/* Question Card */}
              <Card variant="elevated" style={styles.questionCard}>
                <Text style={styles.questionPrompt}>{currentQ.question}</Text>
              </Card>

              {/* Options */}
              <View style={styles.optionsGrid}>
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQ.answer;

                  let optStyle = styles.optButton;
                  let customTextColor: string = theme.colors.textPrimary;

                  if (isAnswerChecked) {
                    if (isCorrect) {
                      optStyle = styles.optCorrect;
                      customTextColor = theme.colors.green;
                    } else if (isSelected) {
                      optStyle = styles.optWrong;
                      customTextColor = theme.colors.danger;
                    }
                  } else if (isSelected) {
                    optStyle = styles.optSelected;
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      disabled={isAnswerChecked}
                      style={[styles.optBase, optStyle]}
                      onPress={() => handleSelectOption(opt)}
                    >
                      <View style={styles.optLetterCircle}>
                        <Text style={styles.optLetter}>{String.fromCharCode(65 + idx)}</Text>
                      </View>
                      <Text style={[styles.optBaseText, { color: customTextColor }]}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* FINISHED SCREEN */}
          {gameState === 'FINISHED' && (
            <View style={{ alignItems: 'center' }}>
              <View style={styles.trophyIconLarge}>
                <Ionicons name="trophy" size={54} color={theme.colors.orange} />
              </View>

              <Text style={styles.finishTitle}>Blitz Complete!</Text>
              <Text style={styles.finishSubtitle}>
                {score >= 600 ? '⚡ Lightning Fast! Superb Performance!' : 'Great practice run! Speed improves with each sprint.'}
              </Text>

              {/* Stats Card */}
              <Card variant="elevated" style={styles.finishStatsCard}>
                <View style={styles.finishRow}>
                  <View style={styles.finishStatCol}>
                    <Text style={styles.finishStatNum}>{score}</Text>
                    <Text style={styles.finishStatLbl}>TOTAL PTS</Text>
                  </View>
                  <View style={styles.finishDivider} />
                  <View style={styles.finishStatCol}>
                    <Text style={styles.finishStatNum}>{accuracy}%</Text>
                    <Text style={styles.finishStatLbl}>ACCURACY</Text>
                  </View>
                  <View style={styles.finishDivider} />
                  <View style={styles.finishStatCol}>
                    <Text style={styles.finishStatNum}>{bestStreak}x</Text>
                    <Text style={styles.finishStatLbl}>BEST STREAK</Text>
                  </View>
                </View>
              </Card>

              <Button
                title="PRACTICE AGAIN"
                variant="primary"
                size="md"
                leftIcon={<Ionicons name="refresh" size={18} color="#FFF" />}
                onPress={startBlitz}
                fullWidth
                style={{ marginTop: theme.spacing.lg }}
              />

              <Button
                title="BACK TO DASHBOARD"
                variant="outline"
                size="md"
                onPress={handleClose}
                fullWidth
                style={{ marginTop: theme.spacing.xs }}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  content: {
    padding: theme.spacing.base,
  },
  introCard: {
    marginBottom: theme.spacing.base,
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  introDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  clockCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  liveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  streakPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  qCounter: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  questionCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    marginBottom: theme.spacing.base,
  },
  questionPrompt: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  optionsGrid: {
    gap: 10,
  },
  optBase: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  optButton: {
    borderColor: '#E2E8F0',
  },
  optSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  optCorrect: {
    borderColor: theme.colors.green,
    backgroundColor: '#ECFDF5',
  },
  optWrong: {
    borderColor: theme.colors.danger,
    backgroundColor: '#FEF2F2',
  },
  optLetterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optLetter: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  optBaseText: {
    fontSize: 15,
    fontWeight: '700',
  },
  trophyIconLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.base,
  },
  finishTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '900',
    color: theme.colors.textPrimary,
  },
  finishSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    marginBottom: theme.spacing.lg,
  },
  finishStatsCard: {
    width: '100%',
    padding: theme.spacing.base,
  },
  finishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  finishStatCol: {
    alignItems: 'center',
  },
  finishStatNum: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  finishStatLbl: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  finishDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
});
