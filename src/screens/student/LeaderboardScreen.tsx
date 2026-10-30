import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, LeaderboardCard, Badge, Button, FairCompetitionCard } from '../../components/common';
import { mockLeaderboard, mockLobby } from '../../data/mockData';
import { SprintApi } from '../../services/api/sprintApi';
import { RealtimeService } from '../../services/firebase/realtimeService';
import { LeaderboardEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const route = useRoute<RouteProp<StudentStackParamList, 'Leaderboard'>>();
  const sprintId = route.params?.lobbyId || mockLobby.lobbyId;
  const { user } = useAuth();
  const currentUserId = user?.userId;

  const [entries, setEntries] = useState<LeaderboardEntry[]>(mockLeaderboard);

  useEffect(() => {
    let isMounted = true;
    let unsub: (() => void) | undefined;

    const loadLeaderboard = async () => {
      try {
        const initial = await SprintApi.getSprintLeaderboard(sprintId);
        if (isMounted && initial && initial.length > 0) {
          setEntries(initial);
        }

        unsub = RealtimeService.listenToLeaderboard(sprintId, (liveList) => {
          if (isMounted && liveList && liveList.length > 0) {
            setEntries(liveList);
          }
        });
      } catch (e) {
        console.warn('[LeaderboardScreen] Fetch error:', e);
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
      unsub?.();
    };
  }, [sprintId]);

  // Map isCurrentUser flag for user highlighting
  const userEntries = entries.map((entry) => ({
    ...entry,
    isCurrentUser: entry.studentId === currentUserId,
  }));

  // Dynamic podium from real live data
  const first = entries.find((e) => e.rank === 1) || entries[0] || { name: 'Diya', score: 1180, rank: 1, studentId: 'p-2' };
  const second = entries.find((e) => e.rank === 2) || entries[1] || { name: 'Aarav', score: 920, rank: 2, studentId: 'p-1' };
  const third = entries.find((e) => e.rank === 3) || entries[2] || { name: 'Rohan', score: 850, rank: 3, studentId: 'p-3' };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Live Leaderboard"
        subtitle="Real-time 2-minute sprint battle standings"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Top Summary Banner */}
        <View style={styles.topBar}>
          <Badge label="PODIUM BATTLE" variant="purple" size="sm" />
          <Text style={styles.sprintTag}>Math Logic Battle (02:00)</Text>
        </View>

        {/* Dynamic Podium Highlights (Top 3 Medals) */}
        <View style={styles.podiumBanner}>
          <View style={styles.podiumCol}>
            <View style={[styles.avatarCircle, { borderColor: '#94A3B8' }]}>
              <Text style={styles.avatarRank}>#2</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {second.name} {second.studentId === currentUserId ? '(You)' : ''}
            </Text>
            <Text style={styles.podiumScore}>{second.score}</Text>
          </View>

          <View style={[styles.podiumCol, styles.podiumFirst]}>
            <View style={[styles.avatarCircle, { borderColor: '#F59E0B', width: 62, height: 62 }]}>
              <Text style={[styles.avatarRank, { fontSize: 18, color: '#F59E0B' }]}>👑 #1</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {first.name} {first.studentId === currentUserId ? '(You)' : ''}
            </Text>
            <Text style={[styles.podiumScore, { color: theme.colors.orange }]}>{first.score}</Text>
          </View>

          <View style={styles.podiumCol}>
            <View style={[styles.avatarCircle, { borderColor: '#CD7F32' }]}>
              <Text style={styles.avatarRank}>#3</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {third.name} {third.studentId === currentUserId ? '(You)' : ''}
            </Text>
            <Text style={styles.podiumScore}>{third.score}</Text>
          </View>
        </View>

        {/* Full Contestant Rankings List */}
        <Text style={styles.listHeading}>Full Classroom Standings ({userEntries.length})</Text>
        <FlatList
          data={userEntries}
          keyExtractor={(item) => item.studentId}
          renderItem={({ item }) => (
            <LeaderboardCard entry={item} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <Button
          title="Back to Dashboard"
          variant="outline"
          size="md"
          onPress={() => navigation.navigate('StudentDashboard')}
          fullWidth
          style={styles.backBtn}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sprintTag: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  podiumBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  podiumCol: {
    alignItems: 'center',
    flex: 1,
  },
  podiumFirst: {
    transform: [{ translateY: -6 }],
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 31,
    borderWidth: 2.5,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarRank: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  podiumName: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  podiumScore: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  listHeading: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  listContent: {
    paddingBottom: theme.spacing.sm,
  },
  backBtn: {
    marginTop: theme.spacing.xs,
  },
  fairPlay: {
    marginTop: theme.spacing.sm,
  },
});
