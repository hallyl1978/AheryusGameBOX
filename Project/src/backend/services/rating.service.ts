/**
 * Rating Service
 *
 * MMR (Matchmaking Rating) hesaplama ve güncelleme servisi.
 * Elo ve Glicko-2 algoritmaları için altyapı.
 *
 * @see Documentation/Advanced_Features.md - Bölüm 1.2
 */

import { Injectable, Logger } from '@nestjs/common';

export interface PlayerRating {
  userId: string;
  gameId: string;
  mmr: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  volatility: number; // Glicko-2 için
}

export interface MatchOutcome {
  userId: string;
  opponentIds: string[];
  result: 'win' | 'loss' | 'draw';
  performanceScore?: number;
}

@Injectable()
export class RatingService {
  private readonly logger = new Logger(RatingService.name);

  // Elo sabitleri
  private readonly K_FACTOR = 32; // Yeni oyuncular için
  private readonly K_FACTOR_EXPERIENCED = 16; // 30+ oyun oynamış oyuncular için
  private readonly BASE_RATING = 1000;

  /**
   * Yeni oyuncu için başlangıç rating'i oluşturur
   */
  async initializePlayerRating(userId: string, gameId: string): Promise<PlayerRating> {
    const rating: PlayerRating = {
      userId,
      gameId,
      mmr: this.BASE_RATING,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      volatility: 50.0
    };

    // TODO: Database'e kaydet (player_ratings tablosu)
    this.logger.log(`Initialized rating for user ${userId} in game ${gameId}`);

    return rating;
  }

  /**
   * Oyuncu rating'ini getirir (yoksa oluşturur)
   */
  async getPlayerRating(userId: string, gameId: string): Promise<PlayerRating> {
    // TODO: Database'den oku
    // Şimdilik mock data
    return {
      userId,
      gameId,
      mmr: this.BASE_RATING,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      volatility: 50.0
    };
  }

  /**
   * Maç sonrası rating güncelleme (Elo algoritması)
   */
  async updateRatings(
    gameId: string,
    outcomes: MatchOutcome[]
  ): Promise<Map<string, PlayerRating>> {
    const updatedRatings = new Map<string, PlayerRating>();

    // Her oyuncu için rating hesapla
    for (const outcome of outcomes) {
      const playerRating = await this.getPlayerRating(outcome.userId, gameId);

      // K-factor belirleme (deneyimli oyuncular için daha düşük)
      const kFactor = playerRating.gamesPlayed >= 30
        ? this.K_FACTOR_EXPERIENCED
        : this.K_FACTOR;

      // Rakiplerin ortalama rating'i
      const opponentRatings = await Promise.all(
        outcome.opponentIds.map(id => this.getPlayerRating(id, gameId))
      );
      const avgOpponentRating = opponentRatings.reduce((sum, r) => sum + r.mmr, 0) / opponentRatings.length;

      // Beklenen skor (Elo formülü)
      const expectedScore = this.calculateExpectedScore(playerRating.mmr, avgOpponentRating);

      // Gerçek skor
      const actualScore = outcome.result === 'win' ? 1 : outcome.result === 'loss' ? 0 : 0.5;

      // Yeni rating hesapla
      const ratingChange = Math.round(kFactor * (actualScore - expectedScore));
      const newMmr = Math.max(0, playerRating.mmr + ratingChange); // Negatif olmasın

      // İstatistikleri güncelle
      const updatedRating: PlayerRating = {
        ...playerRating,
        mmr: newMmr,
        gamesPlayed: playerRating.gamesPlayed + 1,
        wins: playerRating.wins + (outcome.result === 'win' ? 1 : 0),
        losses: playerRating.losses + (outcome.result === 'loss' ? 1 : 0),
        draws: playerRating.draws + (outcome.result === 'draw' ? 1 : 0),
        volatility: this.updateVolatility(playerRating.volatility, Math.abs(ratingChange))
      };

      updatedRatings.set(outcome.userId, updatedRating);

      this.logger.log(
        `Updated rating for user ${outcome.userId}: ${playerRating.mmr} -> ${newMmr} (${ratingChange >= 0 ? '+' : ''}${ratingChange})`
      );
    }

    // TODO: Database'e toplu güncelleme

    return updatedRatings;
  }

  /**
   * Beklenen skoru hesaplar (Elo formülü)
   */
  private calculateExpectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  /**
   * Volatility (belirsizlik) değerini günceller
   * Rating değişimi büyükse volatility artar, küçükse azalır
   */
  private updateVolatility(currentVolatility: number, ratingChange: number): number {
    const changeImpact = ratingChange / 100;
    let newVolatility = currentVolatility;

    if (ratingChange > 50) {
      // Büyük değişim, belirsizlik artar
      newVolatility = Math.min(100, currentVolatility + changeImpact);
    } else {
      // Küçük değişim, belirsizlik azalır (stabilize oluyor)
      newVolatility = Math.max(10, currentVolatility - changeImpact);
    }

    return Math.round(newVolatility * 10) / 10;
  }

  /**
   * MMR bazlı tier/division hesaplar
   */
  getTierAndDivision(mmr: number): { tier: string; division: number } {
    const tiers = [
      { name: 'Bronze', min: 0, max: 999 },
      { name: 'Silver', min: 1000, max: 1499 },
      { name: 'Gold', min: 1500, max: 1999 },
      { name: 'Platinum', min: 2000, max: 2499 },
      { name: 'Diamond', min: 2500, max: 2999 },
      { name: 'Master', min: 3000, max: Infinity }
    ];

    const tier = tiers.find(t => mmr >= t.min && mmr <= t.max) || tiers[0];
    const division = Math.floor((mmr - tier.min) / 100) % 5 + 1; // 1-5 arası division

    return {
      tier: tier.name,
      division: Math.min(5, division)
    };
  }

  /**
   * Leaderboard için top oyuncuları getirir
   */
  async getTopPlayers(gameId: string, limit: number = 100): Promise<PlayerRating[]> {
    // TODO: Database sorgusu
    // SELECT * FROM player_ratings WHERE game_id = ? ORDER BY mmr DESC LIMIT ?

    this.logger.debug(`Fetching top ${limit} players for game ${gameId}`);
    return [];
  }
}
