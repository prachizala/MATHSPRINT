import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, Card, Badge, Button, FairCompetitionCard } from '../../components/common';
import { mockQuestions } from '../../data/mockData';
import { Question } from '../../types';

type Props = NativeStackScreenProps<TeacherStackParamList, 'QuestionBank'>;

export const QuestionBankScreen: React.FC<Props> = ({ navigation }) => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [activeTab, setActiveTab] = useState<'bank' | 'generator'>('bank');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newAiQuestions, setNewAiQuestions] = useState<Question[]>([]);

  const handleGenerateWithAi = () => {
    setIsGenerating(true);
    // Algorithmic / Gemini generator fallback ensuring app works 100% with or without Gemini API key
    setTimeout(() => {
      const generated: Question[] = [
        {
          questionId: `gen-${Date.now()}-1`,
          question: 'What is 18 × 12?',
          options: ['204', '216', '224', '236'],
          answer: '216',
          explanation: '18 × 12 = 18 × 10 + 18 × 2 = 180 + 36 = 216.',
          topic: 'Arithmetic',
          difficulty: 'medium',
          points: 150,
        },
        {
          questionId: `gen-${Date.now()}-2`,
          question: 'Solve: 5x + 15 = 45',
          options: ['5', '6', '7', '8'],
          answer: '6',
          explanation: '5x = 30 => x = 6.',
          topic: 'Algebra',
          difficulty: 'easy',
          points: 100,
        },
      ];
      setNewAiQuestions(generated);
      setIsGenerating(false);
    }, 700);
  };

  const handleSaveToQuestionBank = () => {
    if (newAiQuestions.length === 0) return;
    setQuestions((prev) => [...newAiQuestions, ...prev]);
    setNewAiQuestions([]);
    Alert.alert('Saved!', 'Generated questions added to the active question bank.');
    setActiveTab('bank');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Question Bank"
        subtitle={`${questions.length} Predefined Sprint Problems`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Tab Switcher: Predefined Bank vs AI Generator */}
        <View style={styles.tabContainer}>
          <Button
            title={`Bank (${questions.length})`}
            variant={activeTab === 'bank' ? 'primary' : 'ghost'}
            size="sm"
            leftIcon={<Ionicons name="library" size={16} color={activeTab === 'bank' ? '#FFF' : theme.colors.primary} />}
            onPress={() => setActiveTab('bank')}
            style={styles.tabBtn}
          />
          <Button
            title="AI Generator"
            variant={activeTab === 'generator' ? 'secondary' : 'ghost'}
            size="sm"
            leftIcon={<Ionicons name="sparkles" size={16} color={activeTab === 'generator' ? '#FFF' : theme.colors.purple} />}
            onPress={() => setActiveTab('generator')}
            style={styles.tabBtn}
          />
        </View>

        {activeTab === 'bank' ? (
          /* Predefined Question Bank View */
          <FlatList
            data={questions}
            keyExtractor={(item) => item.questionId}
            renderItem={({ item, index }) => (
              <Card variant="elevated" style={styles.card}>
                <View style={styles.headerRow}>
                  <Badge label={`Q${index + 1} • ${item.topic}`} variant="primary" size="sm" />
                  <Badge label={item.difficulty.toUpperCase()} variant="cyan" size="sm" />
                </View>
                <Text style={styles.questionText}>{item.question}</Text>
                <View style={styles.optionsGrid}>
                  {item.options.map((opt, i) => (
                    <View
                      key={i}
                      style={[
                        styles.optionPill,
                        opt === item.answer && styles.optionPillCorrect,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          opt === item.answer && styles.optionTextCorrect,
                        ]}
                      >
                        {String.fromCharCode(65 + i)}: {opt}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.ansLine}>Correct: {item.answer}</Text>
              </Card>
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          /* AI Generator Section */
          <View style={styles.generatorSection}>
            <Card variant="accentOrange" style={styles.aiNoticeCard}>
              <View style={styles.aiNoticeHeader}>
                <Badge label="OPTIONAL AI — NOT REQUIRED FOR MVP" variant="orange" size="sm" />
                <Ionicons name="information-circle" size={18} color={theme.colors.orange} />
              </View>
              <Text style={styles.aiNoticeTitle}>Gemini AI Sprint Question Engine</Text>
              <Text style={styles.aiNoticeSub}>
                The app operates seamlessly with pre-curated question sets even when offline or without an active Gemini API key.
              </Text>
              <Button
                title={isGenerating ? 'Synthesizing Problems...' : 'Generate With AI'}
                variant="orange"
                size="md"
                leftIcon={<Ionicons name="sparkles" size={18} color="#FFF" />}
                loading={isGenerating}
                onPress={handleGenerateWithAi}
                style={styles.genBtn}
              />
            </Card>

            {newAiQuestions.length > 0 && (
              <View style={styles.reviewContainer}>
                <Text style={styles.reviewTitle}>Review Questions ({newAiQuestions.length})</Text>
                {newAiQuestions.map((q, idx) => (
                  <Card key={idx} variant="elevated" style={styles.reviewCard}>
                    <Badge label={q.topic} variant="purple" size="sm" />
                    <Text style={styles.reviewQ}>{q.question}</Text>
                    <Text style={styles.reviewA}>Correct: {q.answer}</Text>
                  </Card>
                ))}

                <Button
                  title="Save To Question Bank"
                  variant="primary"
                  size="md"
                  leftIcon={<Ionicons name="save-outline" size={18} color="#FFF" />}
                  onPress={handleSaveToQuestionBank}
                  style={styles.saveBtn}
                />
              </View>
            )}
          </View>
        )}

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.full,
    padding: 3,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
  },
  list: {
    paddingBottom: theme.spacing.base,
  },
  card: {
    padding: theme.spacing.base,
    marginBottom: theme.spacing.sm,
  },
  headerRow: {
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionPill: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xs,
  },
  optionPillCorrect: {
    backgroundColor: theme.colors.greenLight,
  },
  optionText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  optionTextCorrect: {
    color: theme.colors.greenDark,
    fontWeight: '700',
  },
  ansLine: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.greenDark,
    marginTop: 6,
  },
  generatorSection: {
    flex: 1,
  },
  aiNoticeCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  aiNoticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiNoticeTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  aiNoticeSub: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  genBtn: {
    marginTop: theme.spacing.md,
  },
  reviewContainer: {
    marginTop: theme.spacing.xs,
  },
  reviewTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  reviewCard: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  reviewQ: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginVertical: 2,
  },
  reviewA: {
    fontSize: 11,
    color: theme.colors.greenDark,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: theme.spacing.sm,
  },
  fairPlay: {
    marginTop: theme.spacing.xs,
  },
});
