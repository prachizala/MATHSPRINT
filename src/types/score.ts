export interface Score {
  studentId: string;
  lobbyId: string;
  studentName: string;
  score: number;
  accuracy: number; // percentage (0-100)
  streak: number;
  highestStreak: number;
  rank?: number;
  totalAnswered: number;
  correctCount: number;
  averageResponseTimeMs: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  score: number;
  accuracy: number;
  streak: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  status?: 'Thinking' | 'Answered';
}
