import {
  ref,
  set,
  onValue,
  remove,
  update,
  Unsubscribe,
} from 'firebase/database';
import { rtdb } from '../../../firebase/config/firebaseConfig';
import { Participant, LeaderboardEntry } from '../../types';
import { mockLobby, mockLeaderboard } from '../../data/mockData';
import { SprintApi } from '../api/sprintApi';

export interface LiveSprintPayload {
  status: string;
  startTime: number | null;
  endTime: number | null;
  participants?: Record<string, any>;
  leaderboard?: Record<string, any>;
  progress?: any;
}

export class RealtimeService {
  /**
   * Listen to live sprint state changes (WAITING -> LIVE -> PAUSED -> ENDED)
   * With automatic HTTP polling fallback if RTDB is inactive or offline.
   */
  static listenToLiveSprint(
    sprintId: string,
    onStateChange: (state: LiveSprintPayload) => void
  ): () => void {
    let pollInterval: NodeJS.Timeout | null = null;
    let unsubRtdb: (() => void) | null = null;
    let receivedRtdb = false;

    if (rtdb) {
      try {
        const sprintRef = ref(rtdb, `liveSprints/${sprintId}`);
        unsubRtdb = onValue(
          sprintRef,
          (snapshot) => {
            const val = snapshot.val();
            if (val) {
              receivedRtdb = true;
              onStateChange(val);
            }
          },
          (err) => {
            console.warn('[RealtimeService] RTDB liveSprint error, falling back to polling:', err);
          }
        );
      } catch (err) {
        console.warn('[RealtimeService] RTDB ref error:', err);
      }
    }

    const doPoll = async () => {
      try {
        const sprint = await SprintApi.getSprint(sprintId);
        if (sprint) {
          onStateChange({
            status: sprint.status,
            startTime: sprint.startedAt || null,
            endTime: sprint.endedAt || null,
            progress: {
              totalAnswered: sprint.totalAnswered || 0,
              averageScore: sprint.averageScore || 0,
            },
          });
        }
      } catch (err) {
        // Fallback gracefully
      }
    };

    doPoll();
    pollInterval = setInterval(() => {
      if (!receivedRtdb) {
        doPoll();
      }
    }, 2500);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (unsubRtdb) unsubRtdb();
    };
  }

  /**
   * Listen to participants joined in a sprint lobby
   */
  static listenToParticipants(
    sprintId: string,
    onParticipantsChange: (participants: Record<string, any>) => void
  ): () => void {
    let pollInterval: NodeJS.Timeout | null = null;
    let unsubRtdb: (() => void) | null = null;
    let receivedRtdb = false;

    if (rtdb) {
      try {
        const participantsRef = ref(rtdb, `liveSprints/${sprintId}/participants`);
        unsubRtdb = onValue(
          participantsRef,
          (snapshot) => {
            const val = snapshot.val();
            if (val) {
              receivedRtdb = true;
              onParticipantsChange(val);
            }
          },
          (err) => {
            console.warn('[RealtimeService] RTDB participants error:', err);
          }
        );
      } catch (err) {
        console.warn('[RealtimeService] RTDB ref error:', err);
      }
    }

    const doPoll = async () => {
      try {
        const sprint = await SprintApi.getSprint(sprintId);
        if (sprint && sprint.participants) {
          onParticipantsChange(sprint.participants);
        }
      } catch (err) {
        // Fallback to mock if not available
      }
    };

    doPoll();
    pollInterval = setInterval(() => {
      if (!receivedRtdb) {
        doPoll();
      }
    }, 2500);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (unsubRtdb) unsubRtdb();
    };
  }

  /**
   * Listen to live leaderboard updates
   */
  static listenToLeaderboard(
    sprintId: string,
    onLeaderboardChange: (leaderboard: LeaderboardEntry[]) => void
  ): () => void {
    let pollInterval: NodeJS.Timeout | null = null;
    let unsubRtdb: (() => void) | null = null;
    let receivedRtdb = false;

    if (rtdb) {
      try {
        const leaderboardRef = ref(rtdb, `liveSprints/${sprintId}/leaderboard`);
        unsubRtdb = onValue(
          leaderboardRef,
          (snapshot) => {
            const val = snapshot.val();
            if (val) {
              receivedRtdb = true;
              const list: LeaderboardEntry[] = Object.values(val)
                .map((item: any) => ({
                  rank: item.rank || 1,
                  studentId: item.studentId,
                  name: item.name,
                  score: item.score || 0,
                  accuracy: 100,
                  streak: 0,
                }))
                .sort((a, b) => a.rank - b.rank);
              onLeaderboardChange(list);
            }
          },
          (err) => {
            console.warn('[RealtimeService] RTDB leaderboard error:', err);
          }
        );
      } catch (err) {
        console.warn('[RealtimeService] RTDB ref error:', err);
      }
    }

    const doPoll = async () => {
      try {
        const list = await SprintApi.getSprintLeaderboard(sprintId);
        if (list && list.length > 0) {
          onLeaderboardChange(list);
        }
      } catch (err) {
        // Fallback quietly
      }
    };

    doPoll();
    pollInterval = setInterval(() => {
      if (!receivedRtdb) {
        doPoll();
      }
    }, 2000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (unsubRtdb) unsubRtdb();
    };
  }

  /**
   * Add student to live sprint participants in RTDB
   */
  static joinLiveSprint(
    sprintId: string,
    participant: { studentId: string; name: string }
  ): () => void {
    if (rtdb) {
      const pRef = ref(rtdb, `liveSprints/${sprintId}/participants/${participant.studentId}`);
      set(pRef, {
        studentId: participant.studentId,
        name: participant.name,
        joined: Date.now(),
        answered: 0,
        score: 0,
        streak: 0,
        lastUpdate: Date.now(),
      });

      return () => {
        remove(pRef);
      };
    }
    return () => {};
  }

  // ==================== Legacy compatibility helpers ====================
  static joinLobbyRoom(
    lobbyId: string,
    participant: Participant,
    onLobbyChange?: (participants: Record<string, Participant>) => void
  ): () => void {
    return this.listenToParticipants(lobbyId, (p) => {
      if (onLobbyChange) onLobbyChange(p as Record<string, Participant>);
    });
  }

  static updateLiveScore(
    lobbyId: string,
    studentId: string,
    score: number,
    streak: number
  ): void {
    if (rtdb) {
      const pRef = ref(rtdb, `liveSprints/${lobbyId}/participants/${studentId}`);
      update(pRef, { score, streak, lastUpdate: Date.now() });
    }
  }

  static listenToRoomState(
    lobbyId: string,
    onStateChange: (state: { status: string; currentQuestionIndex: number }) => void
  ): () => void {
    return this.listenToLiveSprint(lobbyId, (state) => {
      onStateChange({ status: state.status, currentQuestionIndex: 0 });
    });
  }
}
