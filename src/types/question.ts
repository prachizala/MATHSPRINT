export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type MathTopic =
  | 'Arithmetic'
  | 'Algebra'
  | 'Geometry'
  | 'Logic & Puzzles'
  | 'Percentages & Ratios'
  | 'Speed Math'
  | 'Number Theory';

export interface Question {
  questionId: string;
  question: string;
  options: string[];
  answer: string; // The correct option value or string
  explanation: string;
  topic: MathTopic | string;
  difficulty: QuestionDifficulty;
  timeLimitSeconds?: number;
  points?: number;
}
