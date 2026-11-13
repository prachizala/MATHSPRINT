"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EloRatingService = void 0;
class EloRatingService {
    static BASE_ELO = 1200;
    static K_FACTOR = 32;
    static DIFFICULTY_RATINGS = {
        easy: 1100,
        medium: 1250,
        hard: 1450,
    };
    /**
     * Determine Math Elo Tier title from numeric Elo rating
     */
    static getTier(elo) {
        if (elo >= 1550)
            return 'Grandmaster';
        if (elo >= 1400)
            return 'Diamond Strategist';
        if (elo >= 1250)
            return 'Gold Tactician';
        if (elo >= 1100)
            return 'Silver Challenger';
        return 'Bronze Novice';
    }
    /**
     * Compute Expected Score against question difficulty rating
     * Standard Chess-style logistic curve: E = 1 / (1 + 10^((R_q - R_s) / 400))
     */
    static getExpectedScore(studentElo, difficulty) {
        const questionRating = this.DIFFICULTY_RATINGS[difficulty] || 1250;
        return 1 / (1 + Math.pow(10, (questionRating - studentElo) / 400));
    }
    /**
     * Calculate updated Elo after answering a question with speed and streak adjustments
     */
    static calculateEloUpdate(currentElo, difficulty, isCorrect, responseTimeMs = 5000, streak = 0) {
        const safeElo = currentElo || this.BASE_ELO;
        const expected = this.getExpectedScore(safeElo, difficulty);
        const actual = isCorrect ? 1 : 0;
        let delta = Math.round(this.K_FACTOR * (actual - expected));
        if (isCorrect) {
            // Speed multiplier: answering under 3.5 seconds adds +4 bonus Elo
            if (responseTimeMs < 3500) {
                delta += 4;
            }
            // Streak momentum: streak of 3+ adds momentum bonus
            if (streak >= 3) {
                delta += Math.min(6, (streak - 2) * 2);
            }
            // Guarantee minimum +8 Elo on correct answers
            delta = Math.max(8, delta);
        }
        else {
            // Buffer loss against hard questions so students aren't overly penalized
            if (difficulty === 'hard') {
                delta = Math.max(-8, delta);
            }
            else {
                delta = Math.max(-16, delta);
            }
        }
        const newElo = Math.max(800, safeElo + delta);
        const tier = this.getTier(newElo);
        // Adaptive AI Difficulty Engine:
        // If student answers 3 in a row quickly (streak >= 3), automatically upgrade to HARD!
        const triggeredHardUpgrade = isCorrect && streak >= 3;
        let nextDifficulty = 'medium';
        if (triggeredHardUpgrade || newElo >= 1400) {
            nextDifficulty = 'hard';
        }
        else if (!isCorrect && streak === 0 && newElo < 1150) {
            nextDifficulty = 'easy';
        }
        else {
            nextDifficulty = 'medium';
        }
        return {
            previousElo: safeElo,
            newElo,
            delta,
            tier,
            nextDifficulty,
            triggeredHardUpgrade,
        };
    }
}
exports.EloRatingService = EloRatingService;
