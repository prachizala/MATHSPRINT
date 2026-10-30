import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Card, Header, Badge, Button, FairCompetitionCard } from '../../components/common';
import { mockQuestions } from '../../data/mockData';
import { SprintApi } from '../../services/api/sprintApi';

type Props = NativeStackScreenProps<StudentStackParamList, 'Solutions'>;

export const SolutionsScreen: React.FC<Props> = ({ route, navigation }) => {
  const lobbyId = route.params?.lobbyId || 'lobby-101';
  const [solutions, setSolutions] = useState<any[]>(mockQuestions);
  const [filter, setFilter] = useState<'all' | 'mistakes' | 'correct'>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchSolutions = async () => {
      try {
        const data = await SprintApi.getSprintResult(lobbyId);
        if (isMounted && data?.solutions && data.solutions.length > 0) {
          setSolutions(data.solutions);
        }
      } catch (err) {
        console.warn('[SolutionsScreen] Fetch fallback:', err);
      }
    };
    fetchSolutions();
    return () => {
      isMounted = false;
    };
  }, [lobbyId]);

  const mistakesCount = solutions.filter((item, index) => {
    const hasStudentRecord = item.selectedAnswer !== undefined;
    return hasStudentRecord ? !item.isCorrect : index === 7;
  }).length;

  const correctCount = solutions.length - mistakesCount;

  const filteredSolutions = solutions.filter((item, index) => {
    const hasStudentRecord = item.selectedAnswer !== undefined;
    const isMissed = hasStudentRecord ? !item.isCorrect : index === 7;
    if (filter === 'mistakes') return isMissed;
    if (filter === 'correct') return !isMissed;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Sprint Solutions"
        subtitle="Step-by-step logic and calculations"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Filter Segment Chips */}
        <View style={styles.filterRow}>
          <Button
            title={`All (${solutions.length})`}
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setFilter('all')}
            style={styles.filterBtn}
          />
          <Button
            title={`Mistakes (${mistakesCount})`}
            variant={filter === 'mistakes' ? 'secondary' : 'ghost'}
            size="sm"
            leftIcon={
              mistakesCount > 0 ? (
                <Ionicons name="alert-circle" size={14} color={filter === 'mistakes' ? '#FFF' : theme.colors.danger} />
              ) : undefined
            }
            onPress={() => setFilter('mistakes')}
            style={styles.filterBtn}
          />
          <Button
            title={`Correct (${correctCount})`}
            variant={filter === 'correct' ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setFilter('correct')}
            style={styles.filterBtn}
          />
        </View>

        {filter === 'mistakes' && mistakesCount === 0 ? (
          <Card variant="elevated" style={styles.perfectCard}>
            <Ionicons name="trophy" size={48} color={theme.colors.orange} />
            <Text style={styles.perfectTitle}>Zero Mistakes! Perfect Sprint!</Text>
            <Text style={styles.perfectSub}>
              You answered all problems correctly with high accuracy. Ready for harder challenges!
            </Text>
          </Card>
        ) : (
          <FlatList
            data={filteredSolutions}
            keyExtractor={(item) => item.questionId}
            renderItem={({ item, index }) => {
              const hasStudentRecord = item.selectedAnswer !== undefined;
              const isMissed = hasStudentRecord ? !item.isCorrect : index === 7;
              const userAnswer = hasStudentRecord ? (item.selectedAnswer || 'Not answered') : (isMissed ? item.options[0] : item.answer);

              return (
                <Card variant="elevated" style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Badge label={`Q${index + 1} • ${item.topic}`} variant="primary" size="sm" />
                    <Badge label={item.difficulty.toUpperCase()} variant="cyan" size="sm" />
                  </View>

                  <Text style={styles.questionText}>{item.question}</Text>

                  {/* User's Submitted Answer */}
                  <View
                    style={[
                      styles.userAnswerBox,
                      isMissed ? styles.userAnswerBoxIncorrect : styles.userAnswerBoxCorrect,
                    ]}
                  >
                    <Ionicons
                      name={isMissed ? 'close-circle' : 'checkmark-circle'}
                      size={18}
                      color={isMissed ? theme.colors.danger : theme.colors.green}
                    />
                    <Text
                      style={[
                        styles.userAnswerText,
                        isMissed ? { color: theme.colors.danger } : { color: theme.colors.greenDark },
                      ]}
                    >
                      Your Answer: {userAnswer} {isMissed ? '(Incorrect)' : '(Correct)'}
                    </Text>
                  </View>

                  {/* Correct Answer */}
                  {isMissed && (
                    <View style={styles.correctAnswerBox}>
                      <Ionicons name="checkmark-done" size={18} color={theme.colors.green} />
                      <Text style={styles.correctAnswerText}>Correct Answer: {item.answer}</Text>
                    </View>
                  )}

                  {/* Step-by-Step Explanation */}
                  <View style={styles.explanationBox}>
                    <View style={styles.expHeader}>
                      <Ionicons name="bulb-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.explanationTitle}>Step-by-Step Explanation:</Text>
                    </View>
                    <Text style={styles.explanationText}>{item.explanation}</Text>
                  </View>
                </Card>
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {mistakesCount > 0 && (
          <Button
            title="PRACTICE TARGETED DRILL"
            variant="secondary"
            size="md"
            leftIcon={<Ionicons name="fitness-outline" size={18} color="#FFF" />}
            onPress={() => navigation.navigate('Recommendations')}
            fullWidth
            style={{ marginBottom: theme.spacing.xs }}
          />
        )}

        <Button
          title="Done Reviewing"
          variant="outline"
          size="md"
          onPress={() => navigation.navigate('StudentDashboard')}
          fullWidth
          style={styles.doneBtn}
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
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
  },
  perfectCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.lg,
  },
  perfectTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  perfectSub: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  noticeText: {
    fontSize: 11,
    color: theme.colors.primaryDark,
    fontWeight: '600',
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  questionText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  userAnswerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 6,
    gap: 8,
  },
  userAnswerBoxCorrect: {
    backgroundColor: theme.colors.greenLight,
  },
  userAnswerBoxIncorrect: {
    backgroundColor: theme.colors.dangerBackground,
  },
  userAnswerText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
  },
  correctAnswerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.greenLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 6,
    gap: 8,
  },
  correctAnswerText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.greenDark,
  },
  explanationBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: 4,
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  explanationText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  doneBtn: {
    marginTop: theme.spacing.xs,
  },
  fairPlay: {
    marginTop: theme.spacing.sm,
  },
});
