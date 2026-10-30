import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Button, Card, Header, Badge, Loading, FairCompetitionCard } from '../../components/common';
import { mockLobby } from '../../data/mockData';
import { SprintApi } from '../../services/api/sprintApi';
import { RealtimeService } from '../../services/firebase/realtimeService';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<StudentStackParamList, 'WaitingRoom'>;

export const WaitingRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const pin = route.params?.lobbyCode || mockLobby.code;
  const { user } = useAuth();

  const [lobbyDetails, setLobbyDetails] = useState<any>(mockLobby);
  const [participants, setParticipants] = useState<any[]>(Object.values(mockLobby.participants || {}));
  const [sprintId, setSprintId] = useState<string>(mockLobby.lobbyId);

  useEffect(() => {
    let unsubSprint: (() => void) | undefined;
    let unsubParticipants: (() => void) | undefined;
    let isMounted = true;

    const joinLobby = async () => {
      try {
        const data = await SprintApi.joinLobby(pin);
        if (!isMounted) return;

        setLobbyDetails(data);
        const resolvedSprintId = data.sprintId || data.lobbyId || mockLobby.lobbyId;
        setSprintId(resolvedSprintId);

        // Join live presence in RTDB
        if (user) {
          RealtimeService.joinLiveSprint(resolvedSprintId, {
            studentId: user.userId,
            name: user.name,
          });
        }

        // Listen for live participants in real-time
        unsubParticipants = RealtimeService.listenToParticipants(resolvedSprintId, (partMap) => {
          if (isMounted) {
            const list = Object.values(partMap);
            if (list.length > 0) {
              setParticipants(list);
            }
          }
        });

        // Listen for status transition WAITING -> LIVE
        unsubSprint = RealtimeService.listenToLiveSprint(resolvedSprintId, (liveState) => {
          if (!isMounted) return;
          if (liveState.status === 'LIVE') {
            navigation.replace('LiveQuiz', { lobbyId: resolvedSprintId });
          }
        });
      } catch (err) {
        console.warn('[WaitingRoom] Join error:', err);
      }
    };

    joinLobby();

    return () => {
      isMounted = false;
      unsubSprint?.();
      unsubParticipants?.();
    };
  }, [pin, user, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Waiting Room"
        subtitle={`PIN: ${pin}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Sprint & Teacher Card */}
        <Card variant="accentBlue" style={styles.lobbyCard}>
          <View style={styles.row}>
            <View style={styles.flexOne}>
              <Badge label="LIVE SPRINT LOBBY" variant="primary" size="sm" />
              <Text style={styles.sprintTitle}>{lobbyDetails.sprintName || lobbyDetails.title || 'Math Sprint Battle'}</Text>
              <Text style={styles.sprintTopic}>{lobbyDetails.topic || 'Arithmetic & Speed Math'}</Text>
              <View style={styles.teacherRow}>
                <Ionicons name="school-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.teacherName}>Host: Prof. Sarah Miller</Text>
              </View>
            </View>
            <View style={styles.pinBox}>
              <Text style={styles.pinLabel}>PIN CODE</Text>
              <Text style={styles.pinText}>{pin}</Text>
            </View>
          </View>
        </Card>

        {/* Live Status Callout */}
        <Card variant="default" style={styles.statusCard}>
          <Loading message="Waiting for teacher to start the 2-minute sprint..." size="small" />
          <Text style={styles.subStatus}>
            Get ready for rapid 10-15s mental math problems. Keep your fingers ready!
          </Text>
        </Card>

        {/* Contestants List with Avatars */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Contestants Joined ({participants.length})</Text>
          <Badge label="ALL READY" variant="green" size="sm" />
        </View>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.studentId || item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <Card variant="elevated" style={styles.participantItem}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={16} color={theme.colors.primary} />
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.participantName}>{item.name}</Text>
                <Text style={styles.studentClass}>{item.class || 'Class 10-A'}</Text>
              </View>
              <Badge label="Ready" variant="green" size="sm" />
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />

        {/* Direct Action for Testing / Demo */}
        <Button
          title="START BATTLE (DEMO LAUNCH)"
          variant="orange"
          size="lg"
          leftIcon={<Ionicons name="flash" size={20} color="#FFF" />}
          onPress={() => navigation.navigate('LiveQuiz', { lobbyId: sprintId })}
          fullWidth
          style={styles.actionBtn}
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
  lobbyCard: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  flexOne: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  sprintTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  sprintTopic: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  teacherName: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  pinBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pinLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pinText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 1,
    marginTop: 2,
  },
  statusCard: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  subStatus: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    lineHeight: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  listTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: theme.spacing.sm,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  studentInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  studentClass: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  actionBtn: {
    marginTop: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  fairPlay: {
    marginTop: theme.spacing.sm,
  },
});
