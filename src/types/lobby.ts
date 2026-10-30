import { Question } from './question';

export type LobbyStatus = 'waiting' | 'active' | 'completed';

export interface Participant {
  studentId: string;
  name: string;
  class?: string;
  avatarUrl?: string;
  score: number;
  streak: number;
  isReady: boolean;
  joinedAt: number;
}

export interface Lobby {
  lobbyId: string;
  code: string; // 6-digit pin for joining
  teacherId: string;
  title: string;
  topic?: string;
  status: LobbyStatus;
  startTime: number | null;
  durationSeconds: number; // typically 120s (2 minutes)
  questions: Question[];
  participants?: Record<string, Participant>;
  studentCount: number;
  createdAt: number;
}
