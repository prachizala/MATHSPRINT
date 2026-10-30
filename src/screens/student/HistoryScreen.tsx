import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, SprintCard, Button, EmptyState, FairCompetitionCard } from '../../components/common';
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
    topic: 'Linear Equations',
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
            statusBadge: idx === 0 ? 'WINNER' : undefined,
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
        {history.length === 0 ? (
          <EmptyState
            title="No Sprints Yet"
            description="You haven't participated in any live sprint battles yet. Join with a PIN to begin!"
            actionTitle="Join Live Sprint"
            onAction={() => navigation.navigate('JoinSprint')}
          />
        ) : (
          <FlatList
            data={history}
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
  list: {
    paddingBottom: theme.spacing.base,
  },
  fairPlay: {
    marginTop: theme.spacing.xs,
  },
});
