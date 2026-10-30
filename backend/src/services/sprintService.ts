import { FirestoreDataService } from './firestoreDataService';
import { RealtimeSprintService } from './realtimeSprintService';
import {
  FirestoreSprint,
  FirestoreLobby,
  SprintStatus,
  PublicQuestion,
  FirestoreQuestion,
} from '../types';

export class SprintService {
  /**
   * Validate state transition
   */
  static isValidTransition(current: SprintStatus, target: SprintStatus): boolean {
    const validTransitions: Record<SprintStatus, SprintStatus[]> = {
      DRAFT: ['WAITING', 'CANCELLED'],
      WAITING: ['LIVE', 'CANCELLED'],
      LIVE: ['ENDED', 'CANCELLED'],
      ENDED: [], // Cannot transition out of ENDED
      CANCELLED: [], // Cannot transition out of CANCELLED
    };
    return validTransitions[current]?.includes(target) || false;
  }

  /**
   * Start a sprint (Teacher only, WAITING -> LIVE)
   */
  static async startSprint(sprintId: string): Promise<FirestoreSprint> {
    const sprint = await FirestoreDataService.getSprint(sprintId);
    if (!sprint) {
      throw new Error(`Sprint not found: ${sprintId}`);
    }

    if (sprint.status !== 'WAITING') {
      throw new Error(`Cannot start sprint in status '${sprint.status}'. Must be 'WAITING'.`);
    }

    const now = Date.now();
    const durationSeconds = sprint.timeLimit || 120;
    const endedAt = now + durationSeconds * 1000;

    await FirestoreDataService.updateSprintStatus(sprintId, 'LIVE', {
      startedAt: now,
      endedAt,
    });

    if (sprint.lobbyId) {
      await FirestoreDataService.updateLobbyStatus(sprint.lobbyId, 'LIVE', now);
    }

    // Sync RTDB
    await RealtimeSprintService.updateSprintState(sprintId, 'LIVE', now, endedAt);

    return {
      ...sprint,
      status: 'LIVE',
      startedAt: now,
      endedAt,
    };
  }

  /**
   * End a sprint (LIVE -> ENDED)
   */
  static async endSprint(sprintId: string): Promise<FirestoreSprint> {
    const sprint = await FirestoreDataService.getSprint(sprintId);
    if (!sprint) {
      throw new Error(`Sprint not found: ${sprintId}`);
    }

    if (sprint.status === 'ENDED') {
      return sprint;
    }

    if (sprint.status !== 'LIVE' && sprint.status !== 'WAITING') {
      throw new Error(`Cannot end sprint in status '${sprint.status}'.`);
    }

    const now = Date.now();
    await FirestoreDataService.updateSprintStatus(sprintId, 'ENDED', {
      endedAt: now,
    });

    if (sprint.lobbyId) {
      await FirestoreDataService.updateLobbyStatus(sprint.lobbyId, 'ENDED');
    }

    // Sync RTDB
    await RealtimeSprintService.updateSprintState(sprintId, 'ENDED', sprint.startedAt, now);

    return {
      ...sprint,
      status: 'ENDED',
      endedAt: now,
    };
  }

  /**
   * Cancel a sprint (DRAFT / WAITING / LIVE -> CANCELLED)
   */
  static async cancelSprint(sprintId: string): Promise<FirestoreSprint> {
    const sprint = await FirestoreDataService.getSprint(sprintId);
    if (!sprint) {
      throw new Error(`Sprint not found: ${sprintId}`);
    }

    if (sprint.status === 'ENDED' || sprint.status === 'CANCELLED') {
      return sprint;
    }

    const now = Date.now();
    await FirestoreDataService.updateSprintStatus(sprintId, 'CANCELLED', {
      endedAt: now,
    });

    if (sprint.lobbyId) {
      await FirestoreDataService.updateLobbyStatus(sprint.lobbyId, 'CANCELLED');
    }

    // Sync RTDB
    await RealtimeSprintService.updateSprintState(sprintId, 'CANCELLED', sprint.startedAt, now);

    return {
      ...sprint,
      status: 'CANCELLED',
      endedAt: now,
    };
  }

  /**
   * Check if sprint has reached its server end time and auto-end if expired
   */
  static async checkAndEnforceTimer(sprint: FirestoreSprint): Promise<boolean> {
    if (sprint.status !== 'LIVE') {
      return sprint.status === 'ENDED';
    }

    const now = Date.now();
    if (sprint.endedAt && now >= sprint.endedAt) {
      // Auto-end expired sprint on the server
      await this.endSprint(sprint.sprintId);
      return true; // Is expired
    }

    return false; // Still active
  }

  /**
   * Fisher-Yates array shuffling utility for fair-play randomization
   */
  static shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /**
   * Randomize question order for participants
   */
  static shuffleQuestions(questions: FirestoreQuestion[]): FirestoreQuestion[] {
    return this.shuffleArray(questions);
  }

  /**
   * Filter questions for clients:
   * 1. Strips answer and explanation (no answer leaks during active sprint!)
   * 2. Permutes option positions (A/B/C/D) randomly so adjacent students cannot copy option letters
   */
  static sanitizeQuestions(questions: FirestoreQuestion[]): PublicQuestion[] {
    return questions.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      options: this.shuffleArray(q.options),
      topic: q.topic,
      difficulty: q.difficulty,
      createdAt: q.createdAt,
    }));
  }
}
