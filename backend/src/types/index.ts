export type UserRole = 'student' | 'teacher';

export type SprintStatus = 'DRAFT' | 'WAITING' | 'LIVE' | 'PAUSED' | 'ENDED' | 'CANCELLED';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// 1. USERS Collection
export interface FirestoreUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  class?: string;
  createdAt: number;
}

// 2. QUESTIONS Collection
export interface FirestoreQuestion {
  questionId: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  topic: string;
  difficulty: DifficultyLevel;
  createdAt: number;
  points?: number;
}

// Backward compatibility alias
export type BackendQuestion = FirestoreQuestion;

// Client-safe Question (without answer & explanation during live sprint)
export interface PublicQuestion {
  questionId: string;
  question: string;
  options: string[];
  topic: string;
  difficulty: DifficultyLevel;
  createdAt: number;
}

// 3. LOBBIES Collection
export interface FirestoreLobby {
  lobbyId: string;
  code: string; // 6-digit pin
  teacherId: string;
  sprintName: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionCount: number;
  timeLimit: number; // default 120 seconds
  status: SprintStatus;
  startTime: number | null;
  createdAt: number;
  sprintId?: string;
}

// 4. SPRINTS Collection
export interface FirestoreSprint {
  sprintId: string;
  lobbyId: string;
  teacherId: string;
  name: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionCount: number;
  timeLimit: number; // 120
  status: SprintStatus;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  pausedAt?: number | null;
  remainingMs?: number | null;
  questionIds: string[];
}

// 5. ANSWERS Collection
export interface FirestoreAnswer {
  answerId: string;
  studentId: string;
  sprintId: string;
  questionId: string;
  selectedAnswer: string;
  correct: boolean;
  timestamp: number;
  responseTime: number;
}

// 6. SCORES Collection
export interface FirestoreScore {
  scoreId: string;
  studentId: string;
  sprintId: string;
  score: number;
  accuracy: number;
  streak: number;
  correctAnswers: number;
  totalQuestions: number;
  updatedAt: number;
}

// Real-time Database: liveSprints/{sprintId}
export interface LiveSprintParticipant {
  studentId: string;
  name: string;
  joined: number;
  answered: number;
  score: number;
  streak: number;
  lastUpdate: number;
  status?: 'Thinking' | 'Answered';
}

export interface LiveSprintLeaderboardEntry {
  studentId: string;
  name: string;
  score: number;
  rank: number;
  streak?: number;
  accuracy?: number;
  status?: 'Thinking' | 'Answered';
}

export interface LiveSprintProgress {
  totalParticipants: number;
  totalAnswered: number;
  averageScore: number;
  averagePaceSeconds?: number;
}

export interface LiveSprintState {
  status: SprintStatus;
  startTime: number | null;
  endTime: number | null;
  participants: Record<string, LiveSprintParticipant>;
  leaderboard: Record<string, LiveSprintLeaderboardEntry>;
  progress: LiveSprintProgress;
}

// Scoring output
export interface ScoringResult {
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  totalPoints: number;
}
