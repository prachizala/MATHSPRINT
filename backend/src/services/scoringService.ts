import { ScoringResult } from '../types';

export interface ScoreCalculationInput {
  isCorrect: boolean;
  responseTimeMs: number;
  currentStreak: number;
}

export class ScoringService {
  /**
   * Reusable scoring engine:
   * - Base: +100 for correct answer
   * - Speed bonus: up to +20 for fast answers (< 5s), 0 if > 5s
   * - Streak bonus: +10 per streak count
   * - All bonuses strictly 0 if answer is incorrect
   */
  static calculateScore(input: ScoreCalculationInput): ScoringResult {
    const { isCorrect, responseTimeMs, currentStreak } = input;

    if (!isCorrect) {
      return {
        basePoints: 0,
        speedBonus: 0,
        streakBonus: 0,
        totalPoints: 0,
      };
    }

    const basePoints = 100;

    // Speed bonus: up to +20 (linear scale under 5 seconds: 0ms -> 20pts, 5000ms -> 0pts)
    let speedBonus = 0;
    if (responseTimeMs < 5000 && responseTimeMs >= 0) {
      speedBonus = Math.max(0, Math.min(20, Math.round(20 * (1 - responseTimeMs / 5000))));
    }

    // Streak bonus: +10 points per accumulated streak
    const newStreak = currentStreak + 1;
    const streakBonus = Math.max(0, newStreak * 10);

    const totalPoints = basePoints + speedBonus + streakBonus;

    return {
      basePoints,
      speedBonus,
      streakBonus,
      totalPoints,
    };
  }
}
