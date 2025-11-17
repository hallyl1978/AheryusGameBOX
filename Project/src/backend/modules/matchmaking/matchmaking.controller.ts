import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MatchmakingService, QueueEntry } from '../../services/matchmaking.service';
import { RatingService } from '../../services/rating.service';

@Controller('matchmaking')
export class MatchmakingController {
  constructor(
    private readonly matchmakingService: MatchmakingService,
    private readonly ratingService: RatingService,
  ) {}

  /**
   * Join matchmaking queue
   * POST /matchmaking/queue
   */
  @Post('queue')
  async joinQueue(@Body() body: {
    userId: string;
    gameId: string;
    preferences?: any;
  }) {
    // Get player rating
    const rating = await this.ratingService.getPlayerRating(body.userId, body.gameId);

    const entry: QueueEntry = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: body.userId,
      gameId: body.gameId,
      mmr: rating.mmr,
      preferences: body.preferences || {},
      joinedAt: new Date(),
    };

    await this.matchmakingService.joinQueue(entry);

    return {
      success: true,
      message: 'Joined matchmaking queue',
      data: {
        queueId: entry.id,
        estimatedWait: 30, // TODO: Calculate based on queue stats
      },
    };
  }

  /**
   * Leave matchmaking queue
   * DELETE /matchmaking/queue/:userId/:gameId
   */
  @Delete('queue/:userId/:gameId')
  async leaveQueue(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    const success = await this.matchmakingService.leaveQueue(userId, gameId);

    return {
      success,
      message: success ? 'Left matchmaking queue' : 'Not in queue',
    };
  }

  /**
   * Get queue status
   * GET /matchmaking/queue/:gameId/status
   */
  @Get('queue/:gameId/status')
  async getQueueStatus(@Param('gameId') gameId: string) {
    const status = await this.matchmakingService.getQueueStatus(gameId);

    return {
      success: true,
      data: status,
    };
  }

  /**
   * Get player rating
   * GET /matchmaking/rating/:userId/:gameId
   */
  @Get('rating/:userId/:gameId')
  async getPlayerRating(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    const rating = await this.ratingService.getPlayerRating(userId, gameId);
    const { tier, division } = this.ratingService.getTierAndDivision(rating.mmr);

    return {
      success: true,
      data: {
        ...rating,
        tier,
        division,
      },
    };
  }

  /**
   * Get leaderboard
   * GET /matchmaking/leaderboard/:gameId
   */
  @Get('leaderboard/:gameId')
  async getLeaderboard(
    @Param('gameId') gameId: string,
    @Query('limit') limit?: number,
  ) {
    const players = await this.ratingService.getTopPlayers(
      gameId,
      limit ? parseInt(limit.toString(), 10) : 100,
    );

    return {
      success: true,
      data: players,
    };
  }
}
