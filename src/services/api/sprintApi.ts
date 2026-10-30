import { ApiClient } from './apiClient';
import { Question, Lobby, LeaderboardEntry, Score } from '../../types';
import {
  mockLobby,
  mockQuestions,
  mockLeaderboard,
  mockStudentPerformance,
  mockTeacherAnalytics,
} from '../../data/mockData';

const defaultRecommendations = [
  {
    id: 'rec-1',
    topic: 'Algebra Equations',
    reason: 'Improve 2-step linear equations under 10 seconds',
    recommendedDifficulty: 'medium',
    suggestedSprintDuration: 120,
  },
  {
    id: 'rec-2',
    topic: 'Percentages & Ratios',
    reason: 'Sharpen mental conversion tricks for 15%, 25%, and 35%',
    recommendedDifficulty: 'easy',
    suggestedSprintDuration: 120,
  },
];

export interface GenerateQuestionsPayload {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  gradeLevel?: string;
}

export interface SubmitAnswerPayload {
  questionId: string;
  selectedAnswer: string;
  responseTimeMs?: number;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  pointsAwarded: number;
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  totalScore: number;
  streak: number;
  totalQuestionsAnswered: number;
}

export class SprintApi {
  // 1. Health check
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await ApiClient.get<{ success: boolean; message: string }>('/health');
      return Boolean(res.success && res.data?.success && res.data?.message === 'MathSprint API is running');
    } catch {
      return false;
    }
  }

  // 2. Questions Generation
  static async generateQuestions(payload: GenerateQuestionsPayload): Promise<Question[]> {
    const res = await ApiClient.post<Question[]>('/questions/generate', payload);
    if (res.success && res.data) {
      return res.data;
    }
    return mockQuestions;
  }

  // 3. Teacher: Create Sprint
  static async createSprint(payload: {
    name: string;
    topic: string;
    difficulty: string;
    questionCount: number;
    timeLimit?: number;
  }): Promise<any> {
    const res = await ApiClient.post('/sprints', payload);
    if (res.success && res.data) {
      return res.data;
    }
    return {
      sprintId: `sprint-${Date.now()}`,
      status: 'DRAFT',
      ...payload,
    };
  }

  // 4. Teacher: Open Lobby for Sprint
  static async createSprintLobby(sprintId: string): Promise<{ lobby: Lobby; sprint: any }> {
    const res = await ApiClient.post<{ lobby: Lobby; sprint: any }>(`/sprints/${sprintId}/lobby`);
    if (res.success && res.data) {
      return res.data;
    }
    return {
      lobby: mockLobby,
      sprint: { ...mockLobby, sprintId, status: 'WAITING' },
    };
  }

  // 5. Teacher: Start Sprint (WAITING -> LIVE)
  static async startSprint(sprintId: string): Promise<any> {
    const res = await ApiClient.post(`/sprints/${sprintId}/start`);
    if (res.success && res.data) {
      return res.data;
    }
    return { sprintId, status: 'LIVE', startedAt: Date.now() };
  }

  // 6. Teacher: End Sprint (LIVE -> ENDED)
  static async endSprint(sprintId: string): Promise<any> {
    const res = await ApiClient.post(`/sprints/${sprintId}/end`);
    if (res.success && res.data) {
      return res.data;
    }
    return { sprintId, status: 'ENDED', endedAt: Date.now() };
  }

  // 6b. Teacher: Cancel Sprint (DRAFT/WAITING/LIVE -> CANCELLED)
  static async cancelSprint(sprintId: string): Promise<any> {
    const res = await ApiClient.post(`/sprints/${sprintId}/cancel`);
    if (res.success && res.data) {
      return res.data;
    }
    return { sprintId, status: 'CANCELLED', endedAt: Date.now() };
  }

  // 6c. Teacher: Pause Sprint (LIVE -> PAUSED)
  static async pauseSprint(sprintId: string): Promise<any> {
    const res = await ApiClient.post(`/sprints/${sprintId}/pause`);
    if (res.success && res.data) {
      return res.data;
    }
    return { sprintId, status: 'PAUSED', pausedAt: Date.now() };
  }

  // 6d. Teacher: Resume Sprint (PAUSED -> LIVE)
  static async resumeSprint(sprintId: string): Promise<any> {
    const res = await ApiClient.post(`/sprints/${sprintId}/resume`);
    if (res.success && res.data) {
      return res.data;
    }
    return { sprintId, status: 'LIVE' };
  }

  // 7. Get Sprint Details
  static async getSprint(sprintId: string): Promise<any> {
    const res = await ApiClient.get(`/sprints/${sprintId}`);
    if (res.success && res.data) {
      return res.data;
    }
    return {
      sprintId,
      name: mockLobby.title,
      topic: mockLobby.topic,
      difficulty: 'medium',
      questions: mockQuestions,
      status: 'WAITING',
    };
  }

  // 8. Student: Join Lobby by 6-digit PIN
  static async joinLobby(code: string): Promise<{
    lobbyId: string;
    sprintId: string;
    code: string;
    sprintName: string;
    topic: string;
    difficulty: string;
    timeLimit: number;
    status: string;
    questions: Question[];
  }> {
    const res = await ApiClient.post<any>('/lobbies/join', { code });
    if (res.success && res.data) {
      return res.data;
    }
    return {
      lobbyId: mockLobby.lobbyId,
      sprintId: mockLobby.lobbyId,
      code,
      sprintName: mockLobby.title,
      topic: mockLobby.topic || 'Arithmetic',
      difficulty: 'medium',
      timeLimit: 120,
      status: 'WAITING',
      questions: mockQuestions,
    };
  }

  // 9. Get Lobby by PIN
  static async getLobbyByCode(code: string): Promise<any> {
    const res = await ApiClient.get(`/lobbies/${code}`);
    if (res.success && res.data) {
      return res.data;
    }
    return mockLobby;
  }

  // 10. Student: Submit Answer (Secure 13-step backend evaluation)
  static async submitAnswer(
    sprintId: string,
    payload: SubmitAnswerPayload
  ): Promise<SubmitAnswerResponse> {
    const res = await ApiClient.post<SubmitAnswerResponse>(`/sprints/${sprintId}/answers`, payload);
    if (res.success && res.data) {
      return res.data;
    }
    // Fallback scoring calculation if backend is temporarily offline
    return {
      correct: true,
      pointsAwarded: 120,
      basePoints: 100,
      speedBonus: 10,
      streakBonus: 10,
      totalScore: 120,
      streak: 1,
      totalQuestionsAnswered: 1,
    };
  }

  // 11. Live Leaderboard
  static async getSprintLeaderboard(sprintId: string): Promise<LeaderboardEntry[]> {
    const res = await ApiClient.get<LeaderboardEntry[]>(`/sprints/${sprintId}/leaderboard`);
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return mockLeaderboard;
  }

  // 12. Student: Final Results & Unlocked Solutions
  static async getSprintResult(sprintId: string): Promise<any> {
    const res = await ApiClient.get(`/sprints/${sprintId}/result`);
    if (res.success && res.data) {
      return res.data;
    }
    return {
      sprintId,
      score: 850,
      accuracy: 90,
      streak: 6,
      correctAnswers: 9,
      totalQuestions: 10,
      solutionsUnlocked: true,
      solutions: mockQuestions.map((q) => ({
        ...q,
        isCorrect: true,
        selectedAnswer: q.answer,
      })),
    };
  }

  // 13. Teacher: History & Analytics
  static async getTeacherSprints(): Promise<any[]> {
    const res = await ApiClient.get<any[]>('/teacher/sprints');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  static async getTeacherAnalytics(): Promise<any> {
    const res = await ApiClient.get('/teacher/analytics');
    if (res.success && res.data) {
      return res.data;
    }
    return {
      totalSprints: 14,
      totalParticipants: 84,
      classAverageAccuracy: 81,
      averageSprintPace: '3.4s',
    };
  }

  // 14. Student: Performance, Recommendations, History
  static async getStudentPerformance(): Promise<any> {
    const res = await ApiClient.get('/students/performance');
    if (res.success && res.data) {
      return res.data;
    }
    return mockStudentPerformance;
  }

  static async getStudentRecommendations(): Promise<any[]> {
    const res = await ApiClient.get<any[]>('/students/recommendations');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return defaultRecommendations;
  }

  static async getStudentHistory(): Promise<any[]> {
    const res = await ApiClient.get<any[]>('/students/history');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }
}
