/**
 * Game WebSocket Gateway
 * Real-time communication for game sessions
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface GameMove {
  sessionId: string;
  userId: string;
  moveType: string;
  payload: any;
}

interface PlayerConnection {
  userId: string;
  sessionId: string;
  socket: Socket;
}

@WebSocketGateway({
  cors: {
    origin: '*', // TODO: Configure properly in production
  },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  private connections: Map<string, PlayerConnection> = new Map();

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    client.emit('connection', {
      status: 'connected',
      clientId: client.id,
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Find and remove connection
    for (const [key, conn] of this.connections.entries()) {
      if (conn.socket.id === client.id) {
        // Notify other players in the session
        client.to(`session_${conn.sessionId}`).emit('player_disconnected', {
          userId: conn.userId,
        });

        this.connections.delete(key);
        break;
      }
    }
  }

  /**
   * Join game session room
   */
  @SubscribeMessage('join_session')
  handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; sessionId: string },
  ) {
    const roomName = `session_${data.sessionId}`;

    // Join the room
    client.join(roomName);

    // Store connection
    this.connections.set(client.id, {
      userId: data.userId,
      sessionId: data.sessionId,
      socket: client,
    });

    this.logger.log(`User ${data.userId} joined session ${data.sessionId}`);

    // Notify other players
    client.to(roomName).emit('player_joined', {
      userId: data.userId,
      timestamp: new Date(),
    });

    // Send confirmation
    client.emit('joined_session', {
      success: true,
      sessionId: data.sessionId,
      roomName,
    });
  }

  /**
   * Leave game session room
   */
  @SubscribeMessage('leave_session')
  handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; sessionId: string },
  ) {
    const roomName = `session_${data.sessionId}`;

    client.leave(roomName);
    this.connections.delete(client.id);

    this.logger.log(`User ${data.userId} left session ${data.sessionId}`);

    // Notify other players
    client.to(roomName).emit('player_left', {
      userId: data.userId,
      timestamp: new Date(),
    });
  }

  /**
   * Send game move
   */
  @SubscribeMessage('game_move')
  handleGameMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GameMove,
  ) {
    const roomName = `session_${data.sessionId}`;

    this.logger.log(
      `Move received from user ${data.userId} in session ${data.sessionId}`,
    );

    // TODO: Validate move on server side
    // TODO: Update game state
    // TODO: Check win conditions

    // Broadcast move to all players in the session
    this.server.to(roomName).emit('move_applied', {
      userId: data.userId,
      moveType: data.moveType,
      payload: data.payload,
      timestamp: new Date(),
    });
  }

  /**
   * Send chat message
   */
  @SubscribeMessage('chat_message')
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      sessionId: string;
      userId: string;
      message: string;
    },
  ) {
    const roomName = `session_${data.sessionId}`;

    // TODO: Moderate message before broadcasting

    this.server.to(roomName).emit('chat_message', {
      userId: data.userId,
      message: data.message,
      timestamp: new Date(),
    });
  }

  /**
   * Player ready status
   */
  @SubscribeMessage('player_ready')
  handlePlayerReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      sessionId: string;
      userId: string;
      isReady: boolean;
    },
  ) {
    const roomName = `session_${data.sessionId}`;

    this.server.to(roomName).emit('player_status_changed', {
      userId: data.userId,
      isReady: data.isReady,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast game state update
   */
  broadcastGameState(sessionId: string, gameState: any) {
    const roomName = `session_${sessionId}`;

    this.server.to(roomName).emit('game_state_sync', {
      sessionId,
      state: gameState,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast game over
   */
  broadcastGameOver(sessionId: string, results: any) {
    const roomName = `session_${sessionId}`;

    this.server.to(roomName).emit('game_over', {
      sessionId,
      results,
      timestamp: new Date(),
    });
  }

  /**
   * Get connected players count in a session
   */
  getSessionPlayerCount(sessionId: string): number {
    const roomName = `session_${sessionId}`;
    const room = this.server.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  }

  /**
   * Kick player from session
   */
  kickPlayer(sessionId: string, userId: string) {
    for (const [key, conn] of this.connections.entries()) {
      if (conn.sessionId === sessionId && conn.userId === userId) {
        conn.socket.emit('kicked', {
          reason: 'Removed from session',
        });
        conn.socket.disconnect();
        this.connections.delete(key);
        break;
      }
    }
  }
}
