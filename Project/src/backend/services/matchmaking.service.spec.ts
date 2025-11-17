import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingService, QueueEntry } from './matchmaking.service';
import { RatingService } from './rating.service';
import { ConfigService } from '@nestjs/config';

describe('MatchmakingService', () => {
  let service: MatchmakingService;
  let ratingService: RatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingService,
        {
          provide: RatingService,
          useValue: {
            getPlayerRating: jest.fn(),
            updateRatings: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'game.maxMmrSpread': 200,
                'game.matchmakingTimeout': 60,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MatchmakingService>(MatchmakingService);
    ratingService = module.get<RatingService>(RatingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('joinQueue', () => {
    it('should add player to queue', async () => {
      const entry: QueueEntry = {
        id: 'queue-1',
        userId: 'user-1',
        gameId: 'game-1',
        mmr: 1500,
        preferences: {},
        joinedAt: new Date(),
      };

      await service.joinQueue(entry);

      const queue = await service.getQueue('game-1');
      expect(queue).toContainEqual(entry);
    });

    it('should attempt matching after joining queue', async () => {
      const entry1: QueueEntry = {
        id: 'queue-1',
        userId: 'user-1',
        gameId: 'game-1',
        mmr: 1500,
        preferences: {},
        joinedAt: new Date(),
      };

      const entry2: QueueEntry = {
        id: 'queue-2',
        userId: 'user-2',
        gameId: 'game-1',
        mmr: 1520,
        preferences: {},
        joinedAt: new Date(),
      };

      await service.joinQueue(entry1);
      await service.joinQueue(entry2);

      // Should match players with similar MMR
      const queue = await service.getQueue('game-1');
      expect(queue.length).toBeLessThan(2); // Players should be matched
    });
  });

  describe('leaveQueue', () => {
    it('should remove player from queue', async () => {
      const entry: QueueEntry = {
        id: 'queue-1',
        userId: 'user-1',
        gameId: 'game-1',
        mmr: 1500,
        preferences: {},
        joinedAt: new Date(),
      };

      await service.joinQueue(entry);
      await service.leaveQueue('user-1', 'game-1');

      const queue = await service.getQueue('game-1');
      expect(queue).not.toContainEqual(entry);
    });

    it('should handle removing non-existent player gracefully', async () => {
      await expect(service.leaveQueue('user-999', 'game-1')).resolves.not.toThrow();
    });
  });

  describe('findMatch', () => {
    it('should match players with similar MMR', async () => {
      const entry1: QueueEntry = {
        id: 'queue-1',
        userId: 'user-1',
        gameId: 'game-1',
        mmr: 1500,
        preferences: { mode: 'ranked' },
        joinedAt: new Date(),
      };

      const entry2: QueueEntry = {
        id: 'queue-2',
        userId: 'user-2',
        gameId: 'game-1',
        mmr: 1520,
        preferences: { mode: 'ranked' },
        joinedAt: new Date(),
      };

      await service.joinQueue(entry1);
      await service.joinQueue(entry2);

      // Wait for matching to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const queue = await service.getQueue('game-1');
      expect(queue.length).toBe(0); // Both players matched
    });

    it('should not match players with very different MMR', async () => {
      const entry1: QueueEntry = {
        id: 'queue-1',
        userId: 'user-1',
        gameId: 'game-1',
        mmr: 1500,
        preferences: {},
        joinedAt: new Date(),
      };

      const entry2: QueueEntry = {
        id: 'queue-2',
        userId: 'user-2',
        gameId: 'game-1',
        mmr: 2000, // 500 MMR difference
        preferences: {},
        joinedAt: new Date(),
      };

      await service.joinQueue(entry1);
      await service.joinQueue(entry2);

      await new Promise(resolve => setTimeout(resolve, 100));

      const queue = await service.getQueue('game-1');
      expect(queue.length).toBe(2); // Players should NOT be matched
    });

    it('should respect player preferences', async () => {
      const entry1: QueueEntry = {
        id: 'queue-1',
        userId: 'user-1',
        gameId: 'game-1',
        mmr: 1500,
        preferences: { mode: 'ranked' },
        joinedAt: new Date(),
      };

      const entry2: QueueEntry = {
        id: 'queue-2',
        userId: 'user-2',
        gameId: 'game-1',
        mmr: 1520,
        preferences: { mode: 'casual' },
        joinedAt: new Date(),
      };

      await service.joinQueue(entry1);
      await service.joinQueue(entry2);

      await new Promise(resolve => setTimeout(resolve, 100));

      const queue = await service.getQueue('game-1');
      expect(queue.length).toBe(2); // Should NOT match due to different modes
    });
  });

  describe('getQueuePosition', () => {
    it('should return correct queue position', async () => {
      const entries: QueueEntry[] = [
        { id: 'q-1', userId: 'user-1', gameId: 'game-1', mmr: 1600, preferences: {}, joinedAt: new Date(Date.now() - 3000) },
        { id: 'q-2', userId: 'user-2', gameId: 'game-1', mmr: 1500, preferences: {}, joinedAt: new Date(Date.now() - 2000) },
        { id: 'q-3', userId: 'user-3', gameId: 'game-1', mmr: 1400, preferences: {}, joinedAt: new Date(Date.now() - 1000) },
      ];

      for (const entry of entries) {
        await service.joinQueue(entry);
      }

      const position = await service.getQueuePosition('user-2', 'game-1');
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(3);
    });

    it('should return -1 for player not in queue', async () => {
      const position = await service.getQueuePosition('user-999', 'game-1');
      expect(position).toBe(-1);
    });
  });

  describe('getEstimatedWaitTime', () => {
    it('should calculate estimated wait time based on queue', async () => {
      const entry: QueueEntry = {
        id: 'queue-1',
        userId: 'user-1',
        gameId: 'game-1',
        mmr: 1500,
        preferences: {},
        joinedAt: new Date(),
      };

      await service.joinQueue(entry);

      const waitTime = await service.getEstimatedWaitTime('user-1', 'game-1');
      expect(waitTime).toBeGreaterThanOrEqual(0);
      expect(typeof waitTime).toBe('number');
    });
  });
});
