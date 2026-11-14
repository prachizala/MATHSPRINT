export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'streak' | 'volume' | 'mastery';
  unlocked: boolean;
  progress: number; // 0 - 100
  progressLabel: string;
  color: string;
}

export class AchievementEngine {
  public static evaluateAchievements(performance: {
    overallScore?: number;
    overallAccuracy?: number;
    bestStreak?: number;
    totalSprints?: number;
    currentRank?: number;
  }): AchievementBadge[] {
    const score = performance.overallScore || 0;
    const accuracy = performance.overallAccuracy || 0;
    const bestStreak = performance.bestStreak || 0;
    const totalSprints = performance.totalSprints || 0;
    const rank = performance.currentRank || 999;

    const badges: AchievementBadge[] = [
      {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Answer questions in under 3.5 seconds',
        icon: 'flash',
        category: 'speed',
        unlocked: bestStreak >= 2,
        progress: Math.min(100, Math.round((bestStreak / 3) * 100)),
        progressLabel: bestStreak >= 2 ? 'UNLOCKED' : `${bestStreak}/2 Speed Streaks`,
        color: '#F59E0B',
      },
      {
        id: 'streak-fire',
        title: 'Streak Fire Master',
        description: 'Achieve a 3x multiplier streak in battle',
        icon: 'flame',
        category: 'streak',
        unlocked: bestStreak >= 3,
        progress: Math.min(100, Math.round((bestStreak / 3) * 100)),
        progressLabel: bestStreak >= 3 ? 'UNLOCKED' : `${bestStreak}/3x Multiplier`,
        color: '#EF4444',
      },
      {
        id: 'sniper-accuracy',
        title: 'Sniper Precision',
        description: 'Maintain 85%+ overall math accuracy',
        icon: 'locate',
        category: 'accuracy',
        unlocked: accuracy >= 85,
        progress: Math.min(100, accuracy),
        progressLabel: accuracy >= 85 ? 'UNLOCKED' : `${accuracy}% / 85% Target`,
        color: '#10B981',
      },
      {
        id: 'century-legend',
        title: 'Century Legend',
        description: 'Accumulate 1,000+ career sprint points',
        icon: 'trophy',
        category: 'volume',
        unlocked: score >= 1000,
        progress: Math.min(100, Math.round((score / 1000) * 100)),
        progressLabel: score >= 1000 ? 'UNLOCKED' : `${score} / 1,000 PTS`,
        color: '#8B5CF6',
      },
      {
        id: 'podium-finisher',
        title: 'Podium Finisher',
        description: 'Finish in the Top 3 of your classroom',
        icon: 'ribbon',
        category: 'mastery',
        unlocked: rank <= 3,
        progress: rank <= 3 ? 100 : 50,
        progressLabel: rank <= 3 ? `Rank #${rank}` : 'Top 3 Needed',
        color: '#3B82F6',
      },
      {
        id: 'veteran-sprinter',
        title: 'Sprint Veteran',
        description: 'Participate in 5 or more live battles',
        icon: 'timer',
        category: 'volume',
        unlocked: totalSprints >= 5,
        progress: Math.min(100, Math.round((totalSprints / 5) * 100)),
        progressLabel: totalSprints >= 5 ? 'UNLOCKED' : `${totalSprints}/5 Battles`,
        color: '#EC4899',
      },
    ];

    return badges;
  }
}
