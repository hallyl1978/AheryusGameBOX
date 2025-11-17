import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../config/database.config';

export interface Game {
  id: string;
  code: string;
  name_translations: Record<string, string>;
  description_translations?: Record<string, string>;
  type: string;
  minPlayers: number;
  maxPlayers: number;
  isActive: boolean;
  config: any;
}

export interface GameSession {
  id: string;
  gameId: string;
  hostUserId: string;
  status: 'pending' | 'active' | 'finished';
  languageCode?: string;
  settings: any;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  /**
   * Get all active games
   */
  async getAllGames(): Promise<Game[]> {
    const { data, error } = await db.from('games')
      .select('*')
      .eq('is_active', true);

    if (error) {
      this.logger.error('Failed to fetch games', error);
      throw error;
    }

    return data;
  }

  /**
   * Get game by ID
   */
  async getGameById(gameId: string): Promise<Game> {
    const { data, error } = await db.from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch game ${gameId}`, error);
      throw error;
    }

    return data;
  }

  /**
   * Create game session
   */
  async createSession(
    gameId: string,
    hostUserId: string,
    languageCode: string = 'tr-TR',
    settings: any = {},
  ): Promise<GameSession> {
    const { data, error } = await db.from('game_sessions')
      .insert({
        game_id: gameId,
        host_user_id: hostUserId,
        language_code: languageCode,
        status: 'pending',
        settings,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create game session', error);
      throw error;
    }

    this.logger.log(`Game session created: ${data.id}`);
    return data;
  }

  /**
   * Join game session
   */
  async joinSession(sessionId: string, userId: string, seatOrder?: number): Promise<void> {
    // Check if session exists and is joinable
    const { data: session, error: sessionError } = await db.from('game_sessions')
      .select('*, games(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'pending') {
      throw new Error('Session already started');
    }

    // Check current player count
    const { count } = await db.from('session_players')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (count >= session.games.max_players) {
      throw new Error('Session is full');
    }

    // Add player to session
    const { error } = await db.from('session_players')
      .insert({
        session_id: sessionId,
        user_id: userId,
        seat_order: seatOrder || count + 1,
      });

    if (error) {
      this.logger.error('Failed to join session', error);
      throw error;
    }

    this.logger.log(`User ${userId} joined session ${sessionId}`);
  }

  /**
   * Leave game session
   */
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const { error } = await db.from('session_players')
      .update({ leave_time: new Date() })
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('Failed to leave session', error);
      throw error;
    }

    this.logger.log(`User ${userId} left session ${sessionId}`);
  }

  /**
   * Start game session
   */
  async startSession(sessionId: string): Promise<void> {
    const { error } = await db.from('game_sessions')
      .update({
        status: 'active',
        started_at: new Date(),
      })
      .eq('id', sessionId);

    if (error) {
      this.logger.error('Failed to start session', error);
      throw error;
    }

    this.logger.log(`Game session ${sessionId} started`);
  }

  /**
   * End game session
   */
  async endSession(sessionId: string, results: any): Promise<void> {
    const { error } = await db.from('game_sessions')
      .update({
        status: 'finished',
        finished_at: new Date(),
      })
      .eq('id', sessionId);

    if (error) {
      this.logger.error('Failed to end session', error);
      throw error;
    }

    // TODO: Calculate ratings and rewards

    this.logger.log(`Game session ${sessionId} ended`);
  }

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<any> {
    const { data, error } = await db.from('game_sessions')
      .select(`
        *,
        games(*),
        session_players(*, users(id, display_name, avatar_url))
      `)
      .eq('id', sessionId)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch session ${sessionId}`, error);
      throw error;
    }

    return data;
  }
}
