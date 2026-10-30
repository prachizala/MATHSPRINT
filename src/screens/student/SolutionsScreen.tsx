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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Sprint Solutions"
        subtitle="Step-by-step logic and calculations"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.noticeBar}>
          <Ionicons name="information-circle" size={16} color={theme.colors.primary} />
          <Text style={styles.noticeText}>
            Sprint Complete: All official solutions and step-by-step explanations unlocked.
          </Text>
        </View>

        <FlatList
          data={solutions}
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

        <Button
          title="Done Reviewing"
          variant="primary"
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
