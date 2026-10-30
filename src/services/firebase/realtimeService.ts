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
   * Listen to live sprint state changes (e.g. status transition from WAITING -> LIVE -> ENDED)
   */
  static listenToLiveSprint(
    sprintId: string,
    onStateChange: (state: LiveSprintPayload) => void
  ): () => void {
    if (rtdb) {
      const sprintRef = ref(rtdb, `liveSprints/${sprintId}`);
      const unsub = onValue(sprintRef, (snapshot) => {
        const val = snapshot.val();
        if (val) onStateChange(val);
      });
      return unsub;
    }

    // Dev fallback: initial call
    onStateChange({
      status: 'WAITING',
      startTime: null,
      endTime: null,
    });
    return () => {};
  }

  /**
   * Listen to participants joined in a sprint lobby
   */
  static listenToParticipants(
    sprintId: string,
    onParticipantsChange: (participants: Record<string, any>) => void
  ): () => void {
    if (rtdb) {
      const participantsRef = ref(rtdb, `liveSprints/${sprintId}/participants`);
      const unsub = onValue(participantsRef, (snapshot) => {
        const val = snapshot.val() || {};
        onParticipantsChange(val);
      });
      return unsub;
    }

    const mockList = { ...mockLobby.participants };
    onParticipantsChange(mockList);
    return () => {};
  }

  /**
   * Listen to live leaderboard updates
   */
  static listenToLeaderboard(
    sprintId: string,
    onLeaderboardChange: (leaderboard: LeaderboardEntry[]) => void
  ): () => void {
    if (rtdb) {
      const leaderboardRef = ref(rtdb, `liveSprints/${sprintId}/leaderboard`);
      const unsub = onValue(leaderboardRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list: LeaderboardEntry[] = Object.values(val).map((item: any) => ({
            rank: item.rank || 1,
            studentId: item.studentId,
            name: item.name,
            score: item.score || 0,
            accuracy: 100,
            streak: 0,
          })).sort((a, b) => a.rank - b.rank);
          onLeaderboardChange(list);
        }
      });
      return unsub;
    }

    onLeaderboardChange(mockLeaderboard);
    return () => {};
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
