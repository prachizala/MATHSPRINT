import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Button, Card, Header, Badge, FairCompetitionCard } from '../../components/common';
import { mockLobby } from '../../data/mockData';
import { SprintApi } from '../../services/api/sprintApi';
import { RealtimeService } from '../../services/firebase/realtimeService';

type Props = NativeStackScreenProps<TeacherStackParamList, 'Lobby'>;

export const LobbyScreen: React.FC<Props> = ({ route, navigation }) => {
  const lobbyId = route.params?.lobbyId || mockLobby.lobbyId;
  const [participants, setParticipants] = useState<any[]>(Object.values(mockLobby.participants || {}));
  const [lobbyCode, setLobbyCode] = useState(mockLobby.code);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let unsubParticipants: (() => void) | undefined;

    const fetchLobby = async () => {
      try {
        const sprintData = await SprintApi.getSprint(lobbyId);
        if (!isMounted) return;
        if (sprintData?.code) {
          setLobbyCode(sprintData.code);
        }

        unsubParticipants = RealtimeService.listenToParticipants(lobbyId, (pMap) => {
          if (isMounted) {
            const list = Object.values(pMap);
            if (list.length > 0) {
              setParticipants(list);
            }
          }
        });
      } catch (err) {
        console.warn('[LobbyScreen] Error:', err);
      }
    };

    fetchLobby();

    return () => {
      isMounted = false;
      unsubParticipants?.();
    };
  }, [lobbyId]);

  const handleStartSprint = async () => {
    setIsStarting(true);
    try {
      await SprintApi.startSprint(lobbyId);
      navigation.navigate('LiveMonitoring', { lobbyId });
    } catch (err: any) {
      console.warn('[LobbyScreen] Start error fallback:', err.message);
      navigation.navigate('LiveMonitoring', { lobbyId });
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancelSprint = () => {
    Alert.alert(
      'Cancel Sprint',
      'Are you sure you want to cancel this lobby? All connected students will be returned to their dashboard.',
      [
        { text: 'No, Keep Lobby', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await SprintApi.cancelSprint(lobbyId);
            } catch (e) {
              console.warn('Cancel sprint fallback:', e);
            }
            navigation.navigate('TeacherDashboard');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Sprint Lobby"
        subtitle="Classroom broadcast screen"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Prominent SPRINT READY! + 6-Digit Lobby Code Banner */}
        <Card variant="accentPurple" style={styles.pinCard}>
          <View style={styles.readyBadgeRow}>
            <Badge label="SPRINT READY!" variant="orange" size="md" />
            <Text style={styles.timerBadge}>⏱ 02:00 BATTLE</Text>
          </View>

          <Text style={styles.pinPrompt}>TELL STUDENTS TO ENTER PIN:</Text>
          <Text style={styles.pinCode}>{lobbyCode}</Text>
          <Text style={styles.joinInstructions}>mathsprint.app • Join from any smartphone or tablet</Text>
        </Card>

        {/* Participant Count & Readiness Bar */}
        <View style={styles.bar}>
          <View style={styles.countTag}>
            <Ionicons name="people" size={18} color={theme.colors.purple} />
            <Text style={styles.countText}>{participants.length} Students Connected</Text>
          </View>
          <Badge label="100% READY" variant="green" size="sm" />
        </View>

        {/* Participant List */}
        <FlatList
          data={participants}
          keyExtractor={(item) => item.studentId || item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <Card variant="elevated" style={styles.studentItem}>
              <View style={styles.studentAvatar}>
                <Ionicons name="person" size={16} color={theme.colors.purple} />
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentClass}>{item.class || 'Class 10-A'}</Text>
              </View>
              <Badge label="Ready" variant="green" size="sm" />
            </Card>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* Actions: START SPRINT & CANCEL SPRINT */}
        <View style={styles.footerActions}>
          <Button
            title={isStarting ? 'STARTING...' : 'START 2-MINUTE SPRINT'}
            variant="secondary"
            size="lg"
            disabled={isStarting}
            leftIcon={<Ionicons name="play" size={22} color="#FFF" />}
            onPress={handleStartSprint}
            fullWidth
            style={styles.startBtn}
          />

          <Button
            title="CANCEL SPRINT"
            variant="ghost"
            size="md"
            leftIcon={<Ionicons name="close-circle-outline" size={18} color={theme.colors.danger} />}
            onPress={handleCancelSprint}
            fullWidth
            style={styles.cancelBtn}
          />
        </View>

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
  pinCard: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  readyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.xs,
  },
  timerBadge: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800',
    color: theme.colors.purple,
  },
  pinPrompt: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.purple,
    letterSpacing: 1,
    marginTop: 4,
  },
  pinCode: {
    fontSize: 52,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 6,
    marginVertical: 4,
  },
  joinInstructions: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  countTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: 6,
  },
  list: {
    paddingBottom: theme.spacing.xs,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  studentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  studentClass: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  footerActions: {
    marginTop: theme.spacing.xs,
  },
  startBtn: {
    ...theme.shadows.sm,
  },
  cancelBtn: {
    marginTop: 4,
  },
  fairPlay: {
    marginTop: theme.spacing.xs,
  },
});
