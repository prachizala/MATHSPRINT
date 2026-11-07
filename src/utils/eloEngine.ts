export interface EloRankInfo {
  rating: number;
  tier: string;
  badgeLabel: string;
  badgeColor: string;
  nextTierRating: number;
  progressPercent: number;
}

export class EloEngine {
  public static readonly BASE_ELO = 1200;

  public static getRankInfo(rating: number = 1200): EloRankInfo {
    const elo = Math.max(800, rating);

    if (elo >= 1550) {
      return {
        rating: elo,
        tier: 'Grandmaster',
        badgeLabel: '🏆 GRANDMASTER',
        badgeColor: '#8B5CF6', // Purple
        nextTierRating: 2000,
        progressPercent: Math.min(100, Math.round(((elo - 1550) / 450) * 100)),
      };
    }
    if (elo >= 1400) {
      return {
        rating: elo,
        tier: 'Diamond Strategist',
        badgeLabel: '💎 DIAMOND',
        badgeColor: '#06B6D4', // Cyan
        nextTierRating: 1550,
        progressPercent: Math.min(100, Math.round(((elo - 1400) / 150) * 100)),
      };
    }
    if (elo >= 1250) {
      return {
        rating: elo,
        tier: 'Gold Tactician',
        badgeLabel: '🥇 GOLD TACTICIAN',
        badgeColor: '#F59E0B', // Amber
        nextTierRating: 1400,
        progressPercent: Math.min(100, Math.round(((elo - 1250) / 150) * 100)),
      };
    }
    if (elo >= 1100) {
      return {
        rating: elo,
        tier: 'Silver Challenger',
        badgeLabel: '🥈 SILVER',
        badgeColor: '#64748B', // Slate
        nextTierRating: 1250,
        progressPercent: Math.min(100, Math.round(((elo - 1100) / 150) * 100)),
      };
    }
    return {
      rating: elo,
      tier: 'Bronze Novice',
      badgeLabel: '🥉 BRONZE',
      badgeColor: '#D97706',
      nextTierRating: 1100,
      progressPercent: Math.min(100, Math.round(((elo - 800) / 300) * 100)),
    };
  }
}
