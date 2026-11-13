import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Button, Input, Card, Header, Badge, Loading } from '../../components/common';
import { SprintApi } from '../../services/api/sprintApi';
import { Question } from '../../types';
import { mockQuestions } from '../../data/mockData';

type Props = NativeStackScreenProps<TeacherStackParamList, 'AiGenerator'>;

export const AiGeneratorScreen: React.FC<Props> = ({ navigation }) => {
  const [topic, setTopic] = useState('Speed Math & Percentage Shortcuts');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState('5');
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Try backend endpoint, fallback to generated mock
      try {
        const questions = await SprintApi.generateQuestions({
          topic,
          difficulty,
          count: parseInt(count, 10) || 5,
        });
        setGeneratedQuestions(questions);
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
        setGeneratedQuestions(mockQuestions);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="AI Question Generator"
        subtitle="Powered by Gemini AI"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="accentOrange" style={styles.card}>
          <View style={styles.headerRow}>
            <Badge label="GEMINI AI ENGINE" variant="orange" size="sm" />
            <Ionicons name="sparkles" size={20} color={theme.colors.orange} />
          </View>

          <Text style={styles.cardTitle}>Prompt AI for Math & Logic Problems</Text>
          <Text style={styles.cardSub}>
            Generate curriculum-aligned 10-second mental math and logic questions for your next live sprint.
          </Text>

          <Input
            label="Subject / Topic Focus"
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Linear equations, mental percentages, ratios"
          />

          <View style={styles.diffRow}>
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <Button
                key={diff}
                title={diff.toUpperCase()}
                variant={difficulty === diff ? 'secondary' : 'ghost'}
                size="sm"
                onPress={() => setDifficulty(diff)}
                style={styles.diffBtn}
              />
            ))}
          </View>

          <Button
            title="Generate AI Sprint Questions"
            variant="orange"
            size="lg"
            leftIcon={<Ionicons name="flash" size={18} color="#FFF" />}
            loading={loading}
            onPress={handleGenerate}
            fullWidth
            style={styles.genBtn}
          />
        </Card>

        {loading && <Loading message="Synthesizing math puzzles with Gemini..." />}

        {generatedQuestions.length > 0 && !loading && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Generated Questions ({generatedQuestions.length})</Text>
            {generatedQuestions.map((q, idx) => (
              <Card key={idx} variant="elevated" style={styles.qCard}>
                <Badge label={`Q${idx + 1} • ${q.difficulty.toUpperCase()}`} variant="primary" size="sm" />
                <Text style={styles.qText}>{q.question}</Text>
                <Text style={styles.ansText}>Answer: {q.answer}</Text>
              </Card>
            ))}

            <Button
              title="Add All to Active Lobby"
              variant="primary"
              size="md"
              leftIcon={<Ionicons name="checkmark-done" size={18} color="#FFF" />}
              onPress={() => navigation.navigate('Lobby', { lobbyId: 'lobby-101' })}
              fullWidth
              style={styles.addBtn}
            />
          </View>
        )}
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
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  cardSub: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  diffRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  diffBtn: {
    flex: 1,
  },
  genBtn: {
    marginTop: theme.spacing.xs,
  },
  previewContainer: {
    marginTop: theme.spacing.md,
  },
  previewTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  qCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  qText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginVertical: 4,
  },
  ansText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.greenDark,
    fontWeight: '600',
  },
  addBtn: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
});
