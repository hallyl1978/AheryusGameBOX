/**
 * Matchmaking Service
 *
 * Akıllı eşleştirme sistemi için core servis.
 * MMR bazlı oyuncu eşleştirmesi, kuyruk yönetimi ve oda oluşturma.
 *
 * @see Documentation/Advanced_Features.md - Bölüm 1
 */

import { Injectable, Logger } from '@nestjs/common';

export interface QueueEntry {
  id: string;
  userId: string;
  gameId: string;
  mmr: number;
  preferences: {
    region?: string;
    maxWaitTime?: number;
    partyId?: string;
  };
  joinedAt: Date;
}

export interface MatchResult {
  sessionId: string;
  players: Array<{
    userId: string;
    mmr: number;
    team?: number;
  }>;
  avgMmr: number;
  mmrSpread: number;
  waitTime: number;
}

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);

  // In-memory queue (production'da Redis kullanılmalı)
  private queues: Map<string, QueueEntry[]> = new Map();

  /**
   * Oyuncuyu eşleştirme kuyruğuna ekler
   */
  async joinQueue(entry: QueueEntry): Promise<void> {
    const { gameId } = entry;

    if (!this.queues.has(gameId)) {
      this.queues.set(gameId, []);
    }

    const queue = this.queues.get(gameId)!;
    queue.push(entry);

    this.logger.log(`User ${entry.userId} joined queue for game ${gameId} (MMR: ${entry.mmr})`);

    // Otomatik eşleştirme denemesi
    await this.attemptMatching(gameId);
  }

  /**
   * Oyuncuyu kuyruktan çıkarır
   */
  async leaveQueue(userId: string, gameId: string): Promise<boolean> {
    const queue = this.queues.get(gameId);
    if (!queue) return false;

    const index = queue.findIndex(entry => entry.userId === userId);
    if (index === -1) return false;

    queue.splice(index, 1);
    this.logger.log(`User ${userId} left queue for game ${gameId}`);

    return true;
  }

  /**
   * Eşleştirme algoritması
   *
   * Basit versiyon: MMR aralığı içinde yeterli oyuncu varsa eşleştirir
   * Gelişmiş: Glicko-2, TrueSkill gibi algoritmalara geçilebilir
   */
  private async attemptMatching(gameId: string): Promise<MatchResult | null> {
    const queue = this.queues.get(gameId);
    if (!queue || queue.length < 2) return null;

    // Oyun için gereken minimum ve maksimum oyuncu sayısı
    // (Bu bilgi games tablosundan alınmalı)
    const minPlayers = 2;
    const maxPlayers = 4;

    if (queue.length < minPlayers) return null;

    // MMR bazlı sıralama
    queue.sort((a, b) => a.mmr - b.mmr);

    // En uyumlu oyuncuları bul
    const matchedPlayers: QueueEntry[] = [];
    const maxMmrSpread = 200; // Maksimum MMR farkı

    for (let i = 0; i < queue.length && matchedPlayers.length < maxPlayers; i++) {
      const entry = queue[i];

      if (matchedPlayers.length === 0) {
        matchedPlayers.push(entry);
      } else {
        const avgMmr = matchedPlayers.reduce((sum, p) => sum + p.mmr, 0) / matchedPlayers.length;
        const spread = Math.abs(entry.mmr - avgMmr);

        if (spread <= maxMmrSpread) {
          matchedPlayers.push(entry);
        }
      }
    }

    if (matchedPlayers.length >= minPlayers) {
      // Eşleşme bulundu, oyuncuları kuyruktan çıkar
      matchedPlayers.forEach(player => {
        const index = queue.findIndex(e => e.userId === player.userId);
        if (index !== -1) queue.splice(index, 1);
      });

      const avgMmr = matchedPlayers.reduce((sum, p) => sum + p.mmr, 0) / matchedPlayers.length;
      const mmrValues = matchedPlayers.map(p => p.mmr);
      const mmrSpread = Math.max(...mmrValues) - Math.min(...mmrValues);
      const waitTime = Math.round((Date.now() - matchedPlayers[0].joinedAt.getTime()) / 1000);

      const result: MatchResult = {
        sessionId: this.generateSessionId(),
        players: matchedPlayers.map(p => ({
          userId: p.userId,
          mmr: p.mmr
        })),
        avgMmr,
        mmrSpread,
        waitTime
      };

      this.logger.log(`Match found for game ${gameId}: ${matchedPlayers.length} players, avg MMR: ${avgMmr}`);

      // Veritabanına kaydet ve oyun oturumunu başlat
      await this.createGameSession(result, gameId);

      return result;
    }

    return null;
  }

  /**
   * Oyun oturumu oluşturur
   */
  private async createGameSession(match: MatchResult, gameId: string): Promise<void> {
    // TODO: Database'e kayıt
    // - game_sessions tablosuna yeni kayıt
    // - session_players tablosuna oyuncuları ekle
    // - matchmaking_history tablosuna eşleşme bilgilerini kaydet
    // - Realtime üzerinden oyunculara bildirim gönder

    this.logger.debug(`Creating game session for match: ${match.sessionId}`);
  }

  /**
   * Session ID üretir
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Aktif kuyruğu sorgular
   */
  async getQueueStatus(gameId: string): Promise<{
    queueLength: number;
    avgWaitTime: number;
    avgMmr: number;
  }> {
    const queue = this.queues.get(gameId) || [];

    if (queue.length === 0) {
      return { queueLength: 0, avgWaitTime: 0, avgMmr: 0 };
    }

    const avgMmr = queue.reduce((sum, e) => sum + e.mmr, 0) / queue.length;
    const now = Date.now();
    const avgWaitTime = queue.reduce((sum, e) => sum + (now - e.joinedAt.getTime()), 0) / queue.length / 1000;

    return {
      queueLength: queue.length,
      avgWaitTime: Math.round(avgWaitTime),
      avgMmr: Math.round(avgMmr)
    };
  }
}
