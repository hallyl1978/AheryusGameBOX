import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { Socket } from 'socket.io';

describe('GameGateway', () => {
  let gateway: GameGateway;
  let mockSocket: Partial<Socket>;
  let mockServer: any;

  beforeEach(async () => {
    mockSocket = {
      id: 'socket-123',
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      to: jest.fn().mockReturnThis(),
      disconnect: jest.fn(),
    };

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      sockets: {
        adapter: {
          rooms: new Map([
            ['session_1', new Set(['socket-1', 'socket-2'])],
            ['session_2', new Set(['socket-3'])],
          ]),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GameGateway],
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);
    gateway.server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should handle client connection', () => {
      gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connection', {
        status: 'connected',
        clientId: 'socket-123',
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnection', () => {
      // Setup: Add a connection
      gateway.handleJoinSession(mockSocket as Socket, {
        userId: 'user-1',
        sessionId: 'session-1',
      });

      // Act: Disconnect
      gateway.handleDisconnect(mockSocket as Socket);

      // Assert: Should notify other players
      expect(mockSocket.to).toHaveBeenCalledWith('session_session-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('player_disconnected', {
        userId: 'user-1',
      });
    });

    it('should remove connection from internal map', () => {
      gateway.handleJoinSession(mockSocket as Socket, {
        userId: 'user-1',
        sessionId: 'session-1',
      });

      gateway.handleDisconnect(mockSocket as Socket);

      // Connection should be removed
      expect(gateway['connections'].has('socket-123')).toBe(false);
    });
  });

  describe('handleJoinSession', () => {
    it('should join session room', () => {
      const data = { userId: 'user-1', sessionId: 'session-1' };

      gateway.handleJoinSession(mockSocket as Socket, data);

      expect(mockSocket.join).toHaveBeenCalledWith('session_session-1');
      expect(mockSocket.to).toHaveBeenCalledWith('session_session-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('joined_session', {
        success: true,
        sessionId: 'session-1',
        roomName: 'session_session-1',
      });
    });

    it('should notify other players when joining', () => {
      const data = { userId: 'user-1', sessionId: 'session-1' };

      gateway.handleJoinSession(mockSocket as Socket, data);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'player_joined',
        expect.objectContaining({
          userId: 'user-1',
          timestamp: expect.any(Date),
        }),
      );
    });

    it('should store connection internally', () => {
      const data = { userId: 'user-1', sessionId: 'session-1' };

      gateway.handleJoinSession(mockSocket as Socket, data);

      expect(gateway['connections'].has('socket-123')).toBe(true);
      expect(gateway['connections'].get('socket-123')).toMatchObject({
        userId: 'user-1',
        sessionId: 'session-1',
      });
    });
  });

  describe('handleLeaveSession', () => {
    it('should leave session room', () => {
      const data = { userId: 'user-1', sessionId: 'session-1' };

      // First join
      gateway.handleJoinSession(mockSocket as Socket, data);

      // Then leave
      gateway.handleLeaveSession(mockSocket as Socket, data);

      expect(mockSocket.leave).toHaveBeenCalledWith('session_session-1');
      expect(gateway['connections'].has('socket-123')).toBe(false);
    });

    it('should notify other players when leaving', () => {
      const data = { userId: 'user-1', sessionId: 'session-1' };

      gateway.handleLeaveSession(mockSocket as Socket, data);

      expect(mockSocket.to).toHaveBeenCalledWith('session_session-1');
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'player_left',
        expect.objectContaining({
          userId: 'user-1',
          timestamp: expect.any(Date),
        }),
      );
    });
  });

  describe('handleGameMove', () => {
    it('should broadcast move to all players in session', () => {
      const data = {
        sessionId: 'session-1',
        userId: 'user-1',
        moveType: 'play_card',
        payload: { cardId: '5' },
      };

      gateway.handleGameMove(mockSocket as Socket, data);

      expect(mockServer.to).toHaveBeenCalledWith('session_session-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'move_applied',
        expect.objectContaining({
          userId: 'user-1',
          moveType: 'play_card',
          payload: { cardId: '5' },
          timestamp: expect.any(Date),
        }),
      );
    });
  });

  describe('handleChatMessage', () => {
    it('should broadcast chat message to session', () => {
      const data = {
        sessionId: 'session-1',
        userId: 'user-1',
        message: 'Hello everyone!',
      };

      gateway.handleChatMessage(mockSocket as Socket, data);

      expect(mockServer.to).toHaveBeenCalledWith('session_session-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'chat_message',
        expect.objectContaining({
          userId: 'user-1',
          message: 'Hello everyone!',
          timestamp: expect.any(Date),
        }),
      );
    });
  });

  describe('handlePlayerReady', () => {
    it('should broadcast player ready status', () => {
      const data = {
        sessionId: 'session-1',
        userId: 'user-1',
        isReady: true,
      };

      gateway.handlePlayerReady(mockSocket as Socket, data);

      expect(mockServer.to).toHaveBeenCalledWith('session_session-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'player_status_changed',
        expect.objectContaining({
          userId: 'user-1',
          isReady: true,
          timestamp: expect.any(Date),
        }),
      );
    });
  });

  describe('broadcastGameState', () => {
    it('should broadcast game state to session', () => {
      const sessionId = 'session-1';
      const gameState = { currentPlayer: 'user-1', cards: [] };

      gateway.broadcastGameState(sessionId, gameState);

      expect(mockServer.to).toHaveBeenCalledWith('session_session-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'game_state_sync',
        expect.objectContaining({
          sessionId: 'session-1',
          state: gameState,
          timestamp: expect.any(Date),
        }),
      );
    });
  });

  describe('broadcastGameOver', () => {
    it('should broadcast game over to session', () => {
      const sessionId = 'session-1';
      const results = {
        winner: 'user-1',
        scores: { 'user-1': 100, 'user-2': 50 },
      };

      gateway.broadcastGameOver(sessionId, results);

      expect(mockServer.to).toHaveBeenCalledWith('session_session-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'game_over',
        expect.objectContaining({
          sessionId: 'session-1',
          results,
          timestamp: expect.any(Date),
        }),
      );
    });
  });

  describe('getSessionPlayerCount', () => {
    it('should return correct player count for session', () => {
      const count = gateway.getSessionPlayerCount('session_1');
      expect(count).toBe(2);
    });

    it('should return 0 for non-existent session', () => {
      const count = gateway.getSessionPlayerCount('non-existent');
      expect(count).toBe(0);
    });
  });

  describe('kickPlayer', () => {
    it('should kick player from session', () => {
      // Setup: Add player to session
      gateway.handleJoinSession(mockSocket as Socket, {
        userId: 'user-1',
        sessionId: 'session-1',
      });

      // Act: Kick player
      gateway.kickPlayer('session-1', 'user-1');

      // Assert
      expect(mockSocket.emit).toHaveBeenCalledWith('kicked', {
        reason: 'Removed from session',
      });
      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(gateway['connections'].has('socket-123')).toBe(false);
    });

    it('should handle kicking non-existent player gracefully', () => {
      expect(() => gateway.kickPlayer('session-1', 'non-existent')).not.toThrow();
    });
  });
});
