import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { DatabaseConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';

describe('GameService', () => {
  let service: GameService;
  let configService: ConfigService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'SUPABASE_URL': 'https://test.supabase.co',
                'SUPABASE_SERVICE_ROLE_KEY': 'test-key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    configService = module.get<ConfigService>(ConfigService);

    // Mock DatabaseConfig
    jest.spyOn(DatabaseConfig, 'getClient').mockReturnValue(mockSupabaseClient as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllGames', () => {
    it('should return all games', async () => {
      const mockGames = [
        {
          id: '1',
          name_translations: { 'tr-TR': 'Okey', 'en-US': 'Okey' },
          description_translations: { 'tr-TR': 'Geleneksel Türk oyunu', 'en-US': 'Traditional Turkish game' },
        },
      ];

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockGames,
        error: null,
      });

      const result = await service.getAllGames();

      expect(result).toEqual(mockGames);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('games');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
    });

    it('should throw error when database query fails', async () => {
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.getAllGames()).rejects.toThrow('Database error');
    });
  });

  describe('createSession', () => {
    it('should create a new game session', async () => {
      const gameId = 'game-1';
      const hostUserId = 'user-1';
      const languageCode = 'tr-TR';
      const settings = { maxPlayers: 4 };

      const mockSession = {
        id: 'session-1',
        game_id: gameId,
        host_user_id: hostUserId,
        language_code: languageCode,
        status: 'pending',
        settings,
        created_at: new Date(),
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockSession,
        error: null,
      });

      const result = await service.createSession(gameId, hostUserId, languageCode, settings);

      expect(result).toEqual(mockSession);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('game_sessions');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        game_id: gameId,
        host_user_id: hostUserId,
        language_code: languageCode,
        status: 'pending',
        settings,
      });
    });

    it('should use default language when not specified', async () => {
      const gameId = 'game-1';
      const hostUserId = 'user-1';

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'session-1' },
        error: null,
      });

      await service.createSession(gameId, hostUserId);

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          language_code: 'tr-TR',
        }),
      );
    });
  });

  describe('joinSession', () => {
    it('should add player to session', async () => {
      const sessionId = 'session-1';
      const userId = 'user-2';
      const seatOrder = 1;

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'player-1' },
        error: null,
      });

      await service.joinSession(sessionId, userId, seatOrder);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('session_players');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        session_id: sessionId,
        user_id: userId,
        seat_order: seatOrder,
        status: 'joined',
      });
    });

    it('should throw error when session is full', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Session is full', code: '23505' },
      });

      await expect(service.joinSession('session-1', 'user-2')).rejects.toThrow();
    });
  });

  describe('startSession', () => {
    it('should update session status to active', async () => {
      const sessionId = 'session-1';

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: sessionId, status: 'active' },
        error: null,
      });

      await service.startSession(sessionId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('game_sessions');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        status: 'active',
        started_at: expect.any(Date),
      });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', sessionId);
    });
  });

  describe('leaveSession', () => {
    it('should remove player from session', async () => {
      const sessionId = 'session-1';
      const userId = 'user-2';

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      await service.leaveSession(sessionId, userId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('session_players');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('session_id', sessionId);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', userId);
    });
  });

  describe('getSession', () => {
    it('should return session with players', async () => {
      const sessionId = 'session-1';
      const mockSession = {
        id: sessionId,
        status: 'active',
        players: [
          { user_id: 'user-1', seat_order: 0 },
          { user_id: 'user-2', seat_order: 1 },
        ],
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockSession,
        error: null,
      });

      const result = await service.getSession(sessionId);

      expect(result).toEqual(mockSession);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('game_sessions');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', sessionId);
    });

    it('should throw error when session not found', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Session not found' },
      });

      await expect(service.getSession('invalid-id')).rejects.toThrow('Session not found');
    });
  });
});
