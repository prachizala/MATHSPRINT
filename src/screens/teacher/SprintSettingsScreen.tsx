import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, Card, Badge, Button, FairCompetitionCard } from '../../components/common';

type Props = NativeStackScreenProps<TeacherStackParamList, 'SprintSettings'>;

export const SprintSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [randomQuestions, setRandomQuestions] = useState(true);
  const [randomOptions, setRandomOptions] = useState(true);
  const [oneSubmission, setOneSubmission] = useState(true);
  const [serverValidation, setServerValidation] = useState(true);
  const [autoClosing, setAutoClosing] = useState(true);
  const [timestampRecording, setTimestampRecording] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Sprint Settings"
        subtitle="Fair play rules & scoring controls"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Core Sprint Parameters Display */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Sprint Configuration</Text>
          <View style={styles.paramGrid}>
            <View style={styles.paramItem}>
              <Text style={styles.paramLbl}>Topic</Text>
              <Text style={styles.paramVal}>Arithmetic • Logic</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLbl}>Difficulty</Text>
              <Text style={styles.paramVal}>Medium (Adaptive)</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLbl}>Question Count</Text>
              <Text style={styles.paramVal}>10 Questions</Text>
            </View>
            <View style={styles.paramItem}>
              <Text style={styles.paramLbl}>Battle Timer</Text>
              <Text style={[styles.paramVal, { color: theme.colors.primary }]}>⏱ 02:00 (120s)</Text>
            </View>
          </View>
        </Card>

        {/* Dynamic Scoring Rules Card */}
        <Card variant="accentBlue" style={styles.card}>
          <Text style={styles.sectionTitle}>⚡ Dynamic Scoring System</Text>
          <View style={styles.scoringRow}>
            <View style={styles.scorePill}>
              <Text style={styles.scorePoints}>+100</Text>
              <Text style={styles.scoreLabel}>Correct Answer</Text>
            </View>
            <View style={styles.scorePill}>
              <Text style={[styles.scorePoints, { color: theme.colors.orange }]}>+20</Text>
              <Text style={styles.scoreLabel}>Speed Bonus (&lt;4s)</Text>
            </View>
            <View style={styles.scorePill}>
              <Text style={[styles.scorePoints, { color: theme.colors.purple }]}>+10</Text>
              <Text style={styles.scoreLabel}>Streak Multiplier</Text>
            </View>
          </View>
        </Card>

        {/* 6 Required Anti-Cheat & Fair Play Controls */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>🛡 Fair Competition & Anti-Cheat Controls</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Random Question Order</Text>
              <Text style={styles.settingSub}>Shuffles sequence for adjacent devices</Text>
            </View>
            <Switch
              value={randomQuestions}
              onValueChange={setRandomQuestions}
              trackColor={{ false: theme.colors.border, true: theme.colors.green }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Random Answer Options</Text>
              <Text style={styles.settingSub}>Permutes A/B/C/D positions per participant</Text>
            </View>
            <Switch
              value={randomOptions}
              onValueChange={setRandomOptions}
              trackColor={{ false: theme.colors.border, true: theme.colors.green }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>One Submission Per Question</Text>
              <Text style={styles.settingSub}>Prevents changing choices once submitted</Text>
            </View>
            <Switch
              value={oneSubmission}
              onValueChange={setOneSubmission}
              trackColor={{ false: theme.colors.border, true: theme.colors.green }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Server-side Validation</Text>
              <Text style={styles.settingSub}>Validates answer integrity on backend</Text>
            </View>
            <Switch
              value={serverValidation}
              onValueChange={setServerValidation}
              trackColor={{ false: theme.colors.border, true: theme.colors.green }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Automatic Quiz Closing</Text>
              <Text style={styles.settingSub}>Enforces immediate cut-off at 02:00 mark</Text>
            </View>
            <Switch
              value={autoClosing}
              onValueChange={setAutoClosing}
              trackColor={{ false: theme.colors.border, true: theme.colors.green }}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Timestamp Recording</Text>
              <Text style={styles.settingSub}>Sub-second telemetry for fair tie-breaking</Text>
            </View>
            <Switch
              value={timestampRecording}
              onValueChange={setTimestampRecording}
              trackColor={{ false: theme.colors.border, true: theme.colors.green }}
            />
          </View>
        </Card>

        {/* Save CTA */}
        <Button
          title="Save & Apply to Sprint"
          variant="secondary"
          size="lg"
          leftIcon={<Ionicons name="checkmark-circle" size={20} color="#FFF" />}
          onPress={() => navigation.goBack()}
          fullWidth
          style={styles.saveBtn}
        />

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
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  paramGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paramItem: {
    width: '46%',
  },
  paramLbl: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  paramVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  scoringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  scorePill: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scorePoints: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  scoreLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  settingName: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  settingSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    marginTop: theme.spacing.xs,
  },
  fairPlay: {
    marginTop: theme.spacing.sm,
  },
});
