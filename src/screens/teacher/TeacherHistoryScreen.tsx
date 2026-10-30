import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, SprintCard, Button, FairCompetitionCard } from '../../components/common';
import { SprintApi } from '../../services/api/sprintApi';

const mockTeacherHistory = [
  {
    id: 'sprint-1',
    title: 'Math Logic Battle',
    topic: 'Arithmetic • Logic • Algebra',
    dateOrTime: 'Today, 9:30 AM',
    duration: '02:00',
    participants: 28,
    accuracy: 84,
    statusBadge: 'COMPLETED',
  },
  {
    id: 'sprint-2',
    title: 'Speed Multiplication Warmup',
    topic: 'Mental Math (12-19)',
    dateOrTime: 'Yesterday, 11:15 AM',
    duration: '02:00',
    participants: 30,
    accuracy: 88,
    statusBadge: 'COMPLETED',
  },
  {
    id: 'sprint-3',
    title: 'Algebra Fast-Fire Challenge',
    topic: 'Linear Equations',
    dateOrTime: 'Sep 9, 2:00 PM',
    duration: '02:00',
    participants: 26,
    accuracy: 76,
    statusBadge: 'COMPLETED',
  },
  {
    id: 'sprint-4',
    title: 'Geometry Rapid Deduction',
    topic: 'Angles & Triangles',
    dateOrTime: 'Sep 8, 10:30 AM',
    duration: '02:00',
    participants: 29,
    accuracy: 79,
    statusBadge: 'COMPLETED',
  },
];

export const TeacherHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const [sprints, setSprints] = useState<any[]>(mockTeacherHistory);

  useEffect(() => {
    let isMounted = true;
    const fetchSprints = async () => {
      try {
        const liveList = await SprintApi.getTeacherSprints();
        if (isMounted && liveList && liveList.length > 0) {
          const formatted = liveList.map((s: any, idx: number) => ({
            id: s.sprintId || `sprint-${idx}`,
            title: s.name || 'Math Sprint Battle',
            topic: s.topic || 'General Math',
            dateOrTime: 'Recent',
            duration: '02:00',
            participants: s.participants || 28,
            accuracy: s.accuracy || 82,
            statusBadge: s.status || 'COMPLETED',
          }));
          setSprints(formatted);
        }
      } catch (e) {
        console.warn('[TeacherHistoryScreen] Fetch error:', e);
      }
    };
    fetchSprints();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Hosted Sprints"
        subtitle={`${sprints.length} classroom battles conducted`}
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          <Button
            title="New Sprint"
            size="sm"
            variant="secondary"
            onPress={() => navigation.navigate('CreateSprint')}
          />
        }
      />

      <View style={styles.content}>
        <FlatList
          data={sprints}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SprintCard
              title={item.title}
              topic={item.topic}
              dateOrTime={item.dateOrTime}
              duration={item.duration}
              participantCount={item.participants}
              accuracy={item.accuracy}
              statusBadge={item.statusBadge}
              onPress={() => navigation.navigate('Results', { lobbyId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
  list: {
    paddingBottom: theme.spacing.base,
  },
  fairPlay: {
    marginTop: theme.spacing.xs,
  },
});
