export interface Answer {
  studentId: string;
  questionId: string;
  answer: string;
  correct: boolean;
  timestamp: number;
  responseTime: number; // in milliseconds
  pointsAwarded: number;
}
