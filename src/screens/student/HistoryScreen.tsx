import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, SprintCard, Button, EmptyState, FairCompetitionCard, Card } from '../../components/common';
import { SprintApi } from '../../services/api/sprintApi';

type Props = NativeStackScreenProps<StudentStackParamList, 'History'>;

interface SprintHistoryItem {
  id: string;
  title: string;
  topic: string;
  dateOrTime: string;
  duration: string;
  score: number;
  accuracy: number;
  rank: number;
  statusBadge?: string;
}

const mockHistoryData: SprintHistoryItem[] = [
  {
    id: 'sprint-1',
    title: 'Math Logic Battle',
    topic: 'Arithmetic • Logic • Algebra',
    dateOrTime: 'Today, 9:30 AM',
    duration: '02:00',
    score: 920,
    accuracy: 90,
    rank: 2,
    statusBadge: 'PODIUM',
  },
  {
    id: 'sprint-2',
    title: 'Algebra Express Challenge',
    topic: 'Algebra • Linear Equations',
    dateOrTime: 'Yesterday, 2:15 PM',
    duration: '02:00',
    score: 840,
    accuracy: 85,
    rank: 3,
  },
  {
    id: 'sprint-3',
    title: 'Speed Multiplication Warmup',
    topic: 'Arithmetic Mental Speed',
    dateOrTime: 'Sep 9, 11:00 AM',
    duration: '02:00',
    score: 1050,
    accuracy: 95,
    rank: 1,
    statusBadge: 'WINNER',
  },
  {
    id: 'sprint-4',
    title: 'Geometry & Angles Blitz',
    topic: 'Geometry Triangles',
    dateOrTime: 'Sep 8, 3:30 PM',
    duration: '02:00',
    score: 720,
    accuracy: 75,
    rank: 5,
  },
];

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [history, setHistory] = useState<SprintHistoryItem[]>(mockHistoryData);
  const [selectedTopic, setSelectedTopic] = useState('All');

  const topics = ['All', 'Arithmetic', 'Logic', 'Algebra', 'Geometry', 'Percentages'];

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      try {
        const liveHistory = await SprintApi.getStudentHistory();
        if (isMounted && liveHistory && liveHistory.length > 0) {
          const formatted: SprintHistoryItem[] = liveHistory.map((item: any, idx: number) => ({
            id: item.scoreId || `sprint-${idx}`,
            title: item.sprintName || 'Classroom Battle',
            topic: item.topic || 'Mental Math',
            dateOrTime: 'Recent',
            duration: '02:00',
            score: item.score || 0,
            accuracy: item.accuracy || 100,
            rank: idx + 1,
            statusBadge: idx === 0 ? 'WINNER' : idx < 3 ? 'PODIUM' : undefined,
          }));
          setHistory(formatted);
        }
      } catch (e) {
        console.warn('[HistoryScreen] Fetch error:', e);
      }
    };
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPoints = history.reduce((sum, h) => sum + h.score, 0);
  const avgAccuracy = Math.round(history.reduce((sum, h) => sum + h.accuracy, 0) / (history.length || 1));
  const podiumCount = history.filter((h) => h.rank <= 3).length;

  const filteredHistory = history.filter((item) => {
    if (selectedTopic === 'All') return true;
    return item.topic.toLowerCase().includes(selectedTopic.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Sprint History"
        subtitle={`${history.length} completed classroom battles`}
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          <Button
            title="Join Sprint"
            size="sm"
            variant="primary"
            onPress={() => navigation.navigate('JoinSprint')}
          />
        }
      />

      <View style={styles.content}>
        {/* Career Overview Banner */}
        <Card variant="accentBlue" style={styles.careerCard}>
          <View style={styles.careerRow}>
            <View style={styles.careerStat}>
              <Text style={styles.careerStatVal}>{history.length}</Text>
              <Text style={styles.careerStatLbl}>BATTLES</Text>
            </View>
            <View style={styles.careerDivider} />
            <View style={styles.careerStat}>
              <Text style={styles.careerStatVal}>{totalPoints}</Text>
              <Text style={styles.careerStatLbl}>TOTAL PTS</Text>
            </View>
            <View style={styles.careerDivider} />
            <View style={styles.careerStat}>
              <Text style={styles.careerStatVal}>{avgAccuracy}%</Text>
              <Text style={styles.careerStatLbl}>ACCURACY</Text>
            </View>
            <View style={styles.careerDivider} />
            <View style={styles.careerStat}>
              <Text style={styles.careerStatVal}>🏆 {podiumCount}</Text>
              <Text style={styles.careerStatLbl}>PODIUMS</Text>
            </View>
          </View>
        </Card>

        {/* Topic Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContainer}>
          {topics.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setSelectedTopic(t)}
              style={[
                styles.chip,
                selectedTopic === t && styles.chipActive,
              ]}
            >
              <Text style={[styles.chipText, selectedTopic === t && styles.chipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredHistory.length === 0 ? (
          <EmptyState
            title="No Sprints for this Topic"
            description="You haven't participated in any sprint battles for this topic yet."
            actionTitle="Show All Battles"
            onAction={() => setSelectedTopic('All')}
          />
        ) : (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SprintCard
                title={item.title}
                topic={item.topic}
                dateOrTime={item.dateOrTime}
                duration={item.duration}
                score={item.score}
                accuracy={item.accuracy}
                rank={item.rank}
                statusBadge={item.statusBadge}
                onPress={() => navigation.navigate('FinalResult', { lobbyId: item.id })}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
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
  careerCard: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  careerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  careerStat: {
    alignItems: 'center',
    flex: 1,
  },
  careerStatVal: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '900',
    color: theme.colors.primaryDark,
  },
  careerStatLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  careerDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
  },
  chipsScroll: {
    maxHeight: 38,
    marginBottom: theme.spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  list: {
    paddingBottom: theme.spacing.base,
  },
  fairPlay: {
    marginTop: theme.spacing.xs,
  },
});
