import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Button, Input, Card, Header, Badge, FairCompetitionCard } from '../../components/common';
import { mockQuestions, mockLobby } from '../../data/mockData';
import { SprintApi } from '../../services/api/sprintApi';

type Props = NativeStackScreenProps<TeacherStackParamList, 'CreateSprint'>;

export const CreateSprintScreen: React.FC<Props> = ({ navigation }) => {
  const [sprintName, setSprintName] = useState('Math Logic Battle');
  const [topic, setTopic] = useState('Arithmetic • Logic • Algebra');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState('10');
  const [duration, setDuration] = useState<number>(120);
  const [loading, setLoading] = useState(false);

  const durationOptions = [
    { label: '60s Blitz', sec: 60 },
    { label: '90s Rapid', sec: 90 },
    { label: '120s Standard', sec: 120 },
    { label: '180s Deep', sec: 180 },
  ];

  const questionPresets = ['5', '10', '15', '20'];

  const handleCreateAndLaunch = async () => {
    setLoading(true);
    try {
      const sprint = await SprintApi.createSprint({
        name: sprintName,
        topic,
        difficulty,
        questionCount: parseInt(questionCount, 10) || 10,
        timeLimit: duration,
      });

      const sprintId = sprint?.sprintId || `sprint-${Date.now()}`;
      const lobbyRes = await SprintApi.createSprintLobby(sprintId);
      const targetId = lobbyRes.sprint?.sprintId || sprintId;

      navigation.navigate('Lobby', { lobbyId: targetId });
    } catch (err) {
      console.warn('[CreateSprintScreen] Creation fallback:', err);
      navigation.navigate('Lobby', { lobbyId: mockLobby.lobbyId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Create Live Sprint"
        subtitle="Set up a 2-minute classroom battle"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Sprint Parameters</Text>

          {/* 1. Sprint Name */}
          <Input
            label="Sprint Name"
            value={sprintName}
            onChangeText={setSprintName}
            placeholder="e.g. Math Logic Battle"
            leftIcon={<Ionicons name="trophy-outline" size={18} color={theme.colors.textMuted} />}
          />

          {/* 2. Topic */}
          <Input
            label="Math Topic / Focus"
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Arithmetic, Logic, Algebra"
            leftIcon={<Ionicons name="book-outline" size={18} color={theme.colors.textMuted} />}
          />

          {/* 3. Difficulty */}
          <Text style={styles.fieldLabel}>Difficulty Level</Text>
          <View style={styles.diffSelector}>
            {(['easy', 'medium', 'hard'] as const).map((lvl) => (
              <Button
                key={lvl}
                title={lvl.toUpperCase()}
                variant={difficulty === lvl ? 'secondary' : 'ghost'}
                size="sm"
                onPress={() => setDifficulty(lvl)}
                style={styles.diffBtn}
              />
            ))}
          </View>

          {/* 4. Number of Questions */}
          <Text style={styles.fieldLabel}>Number of Questions</Text>
          <View style={styles.presetChipRow}>
            {questionPresets.map((cnt) => (
              <Button
                key={cnt}
                title={`${cnt} Qs`}
                variant={questionCount === cnt ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => setQuestionCount(cnt)}
                style={styles.presetChipBtn}
              />
            ))}
          </View>
          <Input
            label="Or Custom Count"
            value={questionCount}
            onChangeText={setQuestionCount}
            keyboardType="number-pad"
            helperText="10 rapid questions recommended for 2-minute sprints"
            leftIcon={<Ionicons name="list-outline" size={18} color={theme.colors.textMuted} />}
          />

          {/* 5. Sprint Duration Presets */}
          <Text style={styles.fieldLabel}>Battle Duration</Text>
          <View style={styles.presetChipRow}>
            {durationOptions.map((opt) => (
              <Button
                key={opt.sec}
                title={opt.label}
                variant={duration === opt.sec ? 'secondary' : 'ghost'}
                size="sm"
                onPress={() => setDuration(opt.sec)}
                style={styles.presetChipBtn}
              />
            ))}
          </View>

          <View style={styles.timeBox}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>SELECTED BATTLE CLOCK</Text>
              <Text style={styles.timeValue}>
                ⏱ {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')} ({duration} SECONDS)
              </Text>
              <Text style={styles.timeDesc}>
                {duration <= 60
                  ? 'High-speed rapid-fire sprint'
                  : duration === 120
                  ? 'Standard competitive classroom battle'
                  : 'Extended focus sprint for deep problem solving'}
              </Text>
            </View>
            <Badge label={duration === 120 ? 'RECOMMENDED' : 'CUSTOM'} variant="cyan" size="sm" />
          </View>

          {/* Question Set Summary */}
          <View style={styles.questionsSummary}>
            <Text style={styles.qSummaryLabel}>Loaded Questions: {mockQuestions.length} Verified Problems</Text>
            <View style={styles.tagRow}>
              <Badge label="Arithmetic" variant="primary" size="sm" />
              <Badge label="Logic" variant="cyan" size="sm" />
              <Badge label="Algebra" variant="purple" size="sm" />
            </View>
          </View>

          {/* Actions */}
          <Button
            title="Configure Advanced Settings"
            variant="outline"
            size="md"
            leftIcon={<Ionicons name="settings-outline" size={18} color={theme.colors.primary} />}
            onPress={() => navigation.navigate('SprintSettings')}
            fullWidth
            style={styles.settingsBtn}
          />

          <Button
            title="GENERATE LOBBY (6-DIGIT PIN)"
            variant="secondary"
            size="lg"
            leftIcon={<Ionicons name="keypad" size={20} color="#FFF" />}
            loading={loading}
            onPress={handleCreateAndLaunch}
            fullWidth
            style={styles.launchBtn}
          />
        </Card>

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
  content: {
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    padding: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  diffSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: 3,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  diffBtn: {
    flex: 1,
  },
  presetChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  presetChipBtn: {
    flex: 1,
  },
  timeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '900',
    color: theme.colors.primaryDark,
    marginTop: 2,
  },
  timeDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  questionsSummary: {
    backgroundColor: theme.colors.surfaceSubtle,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  qSummaryLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  settingsBtn: {
    marginBottom: theme.spacing.sm,
  },
  launchBtn: {
    marginTop: theme.spacing.xs,
  },
  fairPlay: {
    marginTop: theme.spacing.md,
  },
});
